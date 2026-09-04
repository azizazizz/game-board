import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BoardFrame from '../../components/BoardFrame'
import GameLayout from '../../components/GameLayout'
import { Disc } from '../../components/Marks'
import SoundBar from '../../components/SoundBar'
import WelcomeDialog from '../../components/WelcomeDialog'
import { useSound } from '../../lib/useSound'
import { useGameMusic } from '../../lib/useGameMusic'
import { MUSIC_THEMES } from '../../lib/musicThemes'
import { pad } from '../../lib/format'
import { chooseColumn } from './bot'
import { BLUE, COLS, RED, ROWS, boardFromMoves, findWinner, isFull, landingRow } from './logic'

const TONE = { [RED]: 'red', [BLUE]: 'blue' }
const NAME = { [RED]: 'Merah', [BLUE]: 'Biru' }

export default function ConnectFour() {
  const [moves, setMoves] = useState([])
  const [scores, setScores] = useState({ [RED]: 0, [BLUE]: 0, draw: 0 })
  const [botOn, setBotOn] = useState(true)
  const [soundOn, setSoundOn] = useState(true)
  const [hoverCol, setHoverCol] = useState(null)

  const play = useSound(soundOn)
  const [musicMuted, setMusicMuted, analyser] = useGameMusic(MUSIC_THEMES.connectfour)
  const welcomeRef = useRef(null)

  useEffect(() => {
    welcomeRef.current?.showModal()
  }, [])

  const { board, lastIndex } = useMemo(() => boardFromMoves(moves), [moves])
  const winner = useMemo(() => findWinner(board), [board])
  const full = isFull(board)
  const turn = moves.length % 2 === 0 ? RED : BLUE
  const over = Boolean(winner) || full
  const winningLine = winner?.line ?? null

  // satu titik penerapan langkah, dipanggil dari klik manusia maupun giliran bot;
  // skor dihitung di sini, bukan lewat efek yang mengawasi hasil papan
  const applyMove = useCallback(
    (col) => {
      const nextMoves = [...moves, col]
      const { board: nextBoard } = boardFromMoves(nextMoves)
      const nextWinner = findWinner(nextBoard)

      setMoves(nextMoves)

      if (nextWinner) {
        setScores((s) => ({ ...s, [nextWinner.player]: s[nextWinner.player] + 1 }))
        play('win')
      } else if (isFull(nextBoard)) {
        setScores((s) => ({ ...s, draw: s.draw + 1 }))
        play('draw')
      } else {
        play('drop')
      }
    },
    [moves, play],
  )

  // langkah bot dijalankan di efek, bukan saat render
  useEffect(() => {
    if (!botOn || over || turn !== BLUE) return undefined

    const id = setTimeout(() => {
      const col = chooseColumn(board, BLUE)
      if (col >= 0) applyMove(col)
    }, 240)

    return () => clearTimeout(id)
  }, [botOn, over, turn, board, applyMove])

  function dropIn(col) {
    if (over || landingRow(board, col) < 0) return
    if (botOn && turn === BLUE) return

    applyMove(col)
  }

  function newRound() {
    setMoves([])
    setHoverCol(null)
  }

  const ghostRow = hoverCol === null || over ? -1 : landingRow(board, hoverCol)
  const botThinking = botOn && turn === BLUE && !over

  const verdict = winner
    ? { label: 'Pemenang', value: NAME[winner.player], tone: TONE[winner.player] }
    : full
      ? { label: 'Hasil', value: 'Seri', tone: null }
      : { label: 'Giliran', value: NAME[turn], tone: TONE[turn] }

  const boardEl = (
    <BoardFrame
      cols={COLS}
      rows={ROWS}
      files={Array.from({ length: COLS }, (_, i) => String(i + 1))}
      width={440}
    >
      <div className="c4-grid" role="group" aria-label="Papan empat baris">
        {Array.from({ length: COLS }, (_, col) => {
          const remaining = landingRow(board, col) + 1
          const blocked = over || remaining === 0 || botThinking

          return (
            <button
              key={col}
              type="button"
              className="c4-col"
              disabled={blocked}
              onClick={() => dropIn(col)}
              onMouseEnter={() => setHoverCol(col)}
              onMouseLeave={() => setHoverCol((c) => (c === col ? null : c))}
              onFocus={() => setHoverCol(col)}
              onBlur={() => setHoverCol((c) => (c === col ? null : c))}
              aria-label={`Kolom ${col + 1}, tersisa ${remaining} petak`}
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const i = row * COLS + col
                const value = board[i]
                const isWin = Boolean(winningLine?.includes(i))

                return (
                  <span key={row} className={`c4-slot${isWin ? ' c4-slot--win' : ''}`}>
                    {value ? (
                      <span className={i === lastIndex ? 'c4-drop' : undefined}>
                        <Disc tone={TONE[value]} />
                      </span>
                    ) : null}
                    {!value && row === ghostRow ? <Disc tone={TONE[turn]} hollow /> : null}
                  </span>
                )
              })}
            </button>
          )
        })}
      </div>
    </BoardFrame>
  )

  const panel = (
    <>
      <section className="verdict" role="status" aria-live="polite">
        <p className="verdict__label">{verdict.label}</p>
        <p
          key={`${verdict.label}-${verdict.value}`}
          className={`verdict__value verdict__value--small${
            verdict.tone ? ` verdict__value--${verdict.tone === 'red' ? 'x' : 'o'}` : ''
          }`}
        >
          {verdict.value}
        </p>
        <p className="verdict__note">
          Langkah {pad(moves.length)} dari {COLS * ROWS}
          {botThinking ? ' / bot menghitung' : ''}
        </p>
      </section>

      <section className="block">
        <h2 className="block__title">Perolehan</h2>
        <dl className="ledger">
          <div className={`ledger__row${!over && turn === RED ? ' ledger__row--turn' : ''}`}>
            <dt>Merah</dt>
            <dd>{pad(scores[RED])}</dd>
          </div>
          <div className="ledger__row">
            <dt>Seri</dt>
            <dd>{pad(scores.draw)}</dd>
          </div>
          <div className={`ledger__row${!over && turn === BLUE ? ' ledger__row--turn' : ''}`}>
            <dt>Biru {botOn ? '(bot)' : ''}</dt>
            <dd>{pad(scores[BLUE])}</dd>
          </div>
        </dl>
      </section>

      <section className="block">
        <h2 className="block__title">Aturan singkat</h2>
        <p className="verdict__note">
          Cakram jatuh ke petak terendah pada kolom yang dipilih. Empat berjajar mendatar, menurun,
          atau menyilang memenangkan papan.
        </p>
      </section>

      <div className="controls">
        <button type="button" className="btn btn--solid" onClick={newRound}>
          Papan baru
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={botOn}
          onClick={() => {
            setBotOn((b) => !b)
            newRound()
          }}
        >
          Biru: {botOn ? 'bot' : 'manusia'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            newRound()
            setScores({ [RED]: 0, [BLUE]: 0, draw: 0 })
          }}
        >
          Hapus perolehan
        </button>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((s) => !s)}
          >
            Suara: {soundOn ? 'aktif' : 'mati'}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={!musicMuted}
            onClick={() => setMusicMuted((m) => !m)}
          >
            Musik: {musicMuted ? 'mati' : 'aktif'}
          </button>
          <SoundBar analyser={analyser} muted={musicMuted} onToggle={() => setMusicMuted((m) => !m)} />
        </div>
      </div>
    </>
  )

  return (
    <>
      <GameLayout board={boardEl} panel={panel} />
      <WelcomeDialog
        ref={welcomeRef}
        name="Connect Four"
        blurb="Empat cakram berjajar di papan tujuh kali enam, lawan manusia atau bot."
        musicMuted={musicMuted}
        onToggleMusic={() => setMusicMuted((m) => !m)}
      />
    </>
  )
}
