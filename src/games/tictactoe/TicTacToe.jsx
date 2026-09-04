import { useEffect, useMemo, useRef, useState } from 'react'
import BoardFrame from '../../components/BoardFrame'
import GameLayout from '../../components/GameLayout'
import Scoresheet from '../../components/Scoresheet'
import SoundBar from '../../components/SoundBar'
import WelcomeDialog from '../../components/WelcomeDialog'
import { useSound } from '../../lib/useSound'
import { useGameMusic } from '../../lib/useGameMusic'
import { MUSIC_THEMES } from '../../lib/musicThemes'
import { coord, fileLabels, pad, rankLabels } from '../../lib/format'
import { calculateWinner } from './logic'

function Mark({ value, ghost = false, inverted = false }) {
  if (!value) return null

  const cls = [
    'mark',
    `mark--${value.toLowerCase()}`,
    ghost ? 'mark--ghost' : '',
    inverted ? 'mark--inverted' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <svg className={cls} viewBox="0 0 100 100" aria-hidden="true">
      {value === 'X' ? (
        <>
          <line className="stroke stroke--1" x1="24" y1="24" x2="76" y2="76" />
          <line className="stroke stroke--2" x1="76" y1="24" x2="24" y2="76" />
        </>
      ) : (
        <circle className="stroke stroke--1" cx="50" cy="50" r="26" />
      )}
    </svg>
  )
}

function WinLine({ line }) {
  if (!line) return null

  const center = (i) => [50 + 100 * (i % 3), 50 + 100 * Math.floor(i / 3)]
  const [x1, y1] = center(line[0])
  const [x2, y2] = center(line[2])
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const over = 40

  return (
    <svg className="win-line" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
      <line
        x1={x1 - (dx / len) * over}
        y1={y1 - (dy / len) * over}
        x2={x2 + (dx / len) * over}
        y2={y2 + (dy / len) * over}
      />
    </svg>
  )
}

export default function TicTacToe() {
  const [history, setHistory] = useState([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 })
  const [soundOn, setSoundOn] = useState(true)
  const [round, setRound] = useState(1)

  const play = useSound(soundOn)
  const [musicMuted, setMusicMuted, analyser] = useGameMusic(MUSIC_THEMES.tictactoe)
  const welcomeRef = useRef(null)

  // sapa pemain setiap kali permainan ini dibuka (efek berjalan sekali per
  // pemasangan komponen, yaitu setiap kali dinavigasi masuk ke sini)
  useEffect(() => {
    welcomeRef.current?.showModal()
  }, [])

  const currentSquares = history[currentMove]
  const xIsNext = currentMove % 2 === 0
  const winner = calculateWinner(currentSquares)
  const isDraw = !winner && currentSquares.every(Boolean)
  const winningLine = winner?.line ?? null

  // petak yang berubah di tiap langkah, dipakai sebagai notasi lembar skor
  const labels = useMemo(
    () =>
      history.slice(1).map((squares, m) => {
        const before = history[m]
        const i = squares.findIndex((v, idx) => v !== before[idx])
        return i < 0 ? '' : coord(i, 3)
      }),
    [history],
  )

  function handlePlay(i) {
    if (currentSquares[i] || winner) return

    const nextSquares = currentSquares.slice()
    nextSquares[i] = xIsNext ? 'X' : 'O'

    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)

    const nextWinner = calculateWinner(nextSquares)
    if (nextWinner) {
      setScores((s) => ({ ...s, [nextWinner.player]: s[nextWinner.player] + 1 }))
      play('win')
    } else if (nextSquares.every(Boolean)) {
      setScores((s) => ({ ...s, draw: s.draw + 1 }))
      play('draw')
    } else {
      play(nextSquares[i])
    }
  }

  function newRound() {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setRound((r) => r + 1)
  }

  const verdict = winner
    ? { label: 'Pemenang', value: winner.player }
    : isDraw
      ? { label: 'Hasil', value: 'Seri' }
      : { label: 'Giliran', value: xIsNext ? 'X' : 'O' }

  const board = (
    <BoardFrame cols={3} rows={3} files={fileLabels(3)} ranks={rankLabels(3)} width={400}>
      <div className="grid" role="group" aria-label="Papan tic tac toe">
        {currentSquares.map((value, i) => {
          const isWinning = Boolean(winningLine?.includes(i))
          const winClass = isWinning ? ` cell--tt-win-${value.toLowerCase()}` : ''

          return (
            <button
              key={i}
              type="button"
              className={`cell${value ? '' : ' cell--open'}${winClass}`}
              onClick={() => handlePlay(i)}
              disabled={Boolean(value) || Boolean(winner) || isDraw}
              aria-label={
                value ? `Petak ${coord(i, 3)}, terisi ${value}` : `Petak ${coord(i, 3)}, kosong`
              }
            >
              <span className="cell__coord" aria-hidden="true">
                {coord(i, 3)}
              </span>
              {value ? (
                <Mark value={value} inverted={isWinning} />
              ) : (
                <Mark value={xIsNext ? 'X' : 'O'} ghost />
              )}
            </button>
          )
        })}
      </div>
      <WinLine line={winningLine} />
    </BoardFrame>
  )

  const panel = (
    <>
      <section className="verdict" role="status" aria-live="polite">
        <p className="verdict__label">{verdict.label}</p>
        <p
          key={`${verdict.label}-${verdict.value}`}
          className={`verdict__value${
            verdict.value === 'X' || verdict.value === 'O'
              ? ` verdict__value--${verdict.value.toLowerCase()}`
              : ' verdict__value--small'
          }`}
        >
          {verdict.value}
        </p>
        <p className="verdict__note">
          Ronde {pad(round)} / langkah {pad(currentMove)}
          {currentMove < history.length - 1 ? ' / putar ulang' : ''}
        </p>
      </section>

      <section className="block">
        <h2 className="block__title">Perolehan</h2>
        <dl className="ledger">
          <div className={`ledger__row${!winner && !isDraw && xIsNext ? ' ledger__row--turn' : ''}`}>
            <dt>Pemain X</dt>
            <dd>{pad(scores.X)}</dd>
          </div>
          <div className="ledger__row">
            <dt>Seri</dt>
            <dd>{pad(scores.draw)}</dd>
          </div>
          <div
            className={`ledger__row${!winner && !isDraw && !xIsNext ? ' ledger__row--turn' : ''}`}
          >
            <dt>Pemain O</dt>
            <dd>{pad(scores.O)}</dd>
          </div>
        </dl>
      </section>

      <section className="block block--grow">
        <h2 className="block__title">Lembar langkah</h2>
        <button
          type="button"
          className={`ply ply--start${currentMove === 0 ? ' ply--current' : ''}`}
          onClick={() => setCurrentMove(0)}
        >
          papan kosong
        </button>
        <Scoresheet
          headers={['X', 'O']}
          labels={labels}
          currentPly={currentMove}
          onJump={setCurrentMove}
        />
      </section>

      <div className="controls">
        <button type="button" className="btn btn--solid" onClick={newRound}>
          Ronde baru
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            newRound()
            setScores({ X: 0, O: 0, draw: 0 })
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
      <GameLayout board={board} panel={panel} />
      <WelcomeDialog
        ref={welcomeRef}
        name="Tic Tac Toe"
        blurb="Tiga berjajar di papan tiga kali tiga, dengan lembar langkah yang bisa diputar ulang."
        musicMuted={musicMuted}
        onToggleMusic={() => setMusicMuted((m) => !m)}
      />
    </>
  )
}
