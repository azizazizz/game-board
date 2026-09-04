import { useCallback, useEffect, useState } from 'react'
import BoardFrame from '../../components/BoardFrame'
import GameLayout from '../../components/GameLayout'
import { Disc, Ring } from '../../components/Marks'
import { useSound } from '../../lib/useSound'
import { useShake } from '../../lib/useShake'
import { coord, fileLabels, pad, rankLabels } from '../../lib/format'
import { chooseMove } from './bot'
import {
  DARK,
  LIGHT,
  applyMove,
  count,
  foeOf,
  initialBoard,
  legalMoves,
} from './logic'

const TONE = { [DARK]: 'dark', [LIGHT]: 'light' }
const NAME = { [DARK]: 'Hitam', [LIGHT]: 'Putih' }

export default function Othello() {
  const [board, setBoard] = useState(() => initialBoard())
  const [turn, setTurn] = useState(DARK)
  const [passed, setPassed] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [scores, setScores] = useState({ [DARK]: 0, [LIGHT]: 0, draw: 0 })
  const [botOn, setBotOn] = useState(true)
  const [soundOn, setSoundOn] = useState(true)
  const [lastChange, setLastChange] = useState({ placed: -1, flips: [] })

  const play = useSound(soundOn)
  const [shaking, shake] = useShake()
  const freshSet = new Set(
    lastChange.placed >= 0 ? [lastChange.placed, ...lastChange.flips] : [],
  )

  const tally = count(board)
  const myMoves = gameOver ? [] : legalMoves(board, turn)
  const botTurn = botOn && turn === LIGHT
  const botThinking = botTurn && !gameOver

  // satu titik penerapan langkah, dipakai klik manusia maupun giliran bot.
  // giliran berikutnya, pemberitahuan lewat, dan akhir permainan semua
  // ditentukan di sini, bukan lewat efek yang mengawasi papan
  const applyMoveFor = useCallback(
    (player, index) => {
      const result = applyMove(board, index, player)
      if (!result) return

      const nextBoard = result.board
      const foe = foeOf(player)
      const foeCanMove = legalMoves(nextBoard, foe).length > 0
      const selfCanMove = legalMoves(nextBoard, player).length > 0

      setBoard(nextBoard)
      setLastChange({ placed: index, flips: result.flips })
      play('flip')

      if (foeCanMove) {
        setTurn(foe)
        setPassed(false)
      } else if (selfCanMove) {
        setTurn(player)
        setPassed(true)
      } else {
        setGameOver(true)
        setPassed(false)

        const final = count(nextBoard)
        if (final[DARK] === final[LIGHT]) {
          setScores((s) => ({ ...s, draw: s.draw + 1 }))
          play('draw')
        } else {
          const winner = final[DARK] > final[LIGHT] ? DARK : LIGHT
          setScores((s) => ({ ...s, [winner]: s[winner] + 1 }))
          play('win')
        }
      }
    },
    [board, play],
  )

  // langkah bot dijalankan di efek, bukan saat render
  useEffect(() => {
    if (!botTurn || gameOver) return undefined

    const id = setTimeout(() => {
      const move = chooseMove(board, LIGHT)
      if (move >= 0) applyMoveFor(LIGHT, move)
    }, 260)

    return () => clearTimeout(id)
  }, [botTurn, gameOver, board, applyMoveFor])

  function place(index) {
    if (gameOver || botTurn) return
    if (!myMoves.includes(index)) {
      play('invalid')
      shake()
      return
    }
    applyMoveFor(turn, index)
  }

  function newRound() {
    setBoard(initialBoard())
    setTurn(DARK)
    setPassed(false)
    setGameOver(false)
    setLastChange({ placed: -1, flips: [] })
  }

  const verdict = gameOver
    ? tally[DARK] === tally[LIGHT]
      ? { label: 'Hasil', value: 'Seri', tone: null }
      : { label: 'Pemenang', value: NAME[tally[DARK] > tally[LIGHT] ? DARK : LIGHT], tone: null }
    : passed
      ? { label: 'Giliran dilewati', value: NAME[turn], tone: TONE[turn] }
      : { label: 'Giliran', value: NAME[turn], tone: TONE[turn] }

  const boardEl = (
    <BoardFrame cols={8} rows={8} files={fileLabels(8)} ranks={rankLabels(8)} width={420} shake={shaking}>
      <div className="grid" role="group" aria-label="Papan othello">
        {board.map((value, i) => {
          const isLegal = !gameOver && !botTurn && myMoves.includes(i)

          return (
            <button
              key={i}
              type="button"
              className={`cell${isLegal ? ' cell--open cell--legal' : ''}`}
              onClick={() => place(i)}
              disabled={gameOver || botTurn || (!value && !isLegal)}
              aria-label={
                value
                  ? `Petak ${coord(i, 8)}, ${NAME[value]}`
                  : `Petak ${coord(i, 8)}, kosong${isLegal ? ', langkah legal' : ''}`
              }
            >
              <span className="cell__coord" aria-hidden="true">
                {coord(i, 8)}
              </span>
              {value ? <Disc tone={TONE[value]} fresh={freshSet.has(i)} /> : null}
              {!value && isLegal ? <Ring /> : null}
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
            verdict.tone ? ` verdict__value--${verdict.tone === 'dark' ? 'x' : 'o'}` : ''
          }`}
        >
          {verdict.value}
        </p>
        <p className="verdict__note">
          {myMoves.length} langkah legal{botThinking ? ' / bot menghitung' : ''}
        </p>
      </section>

      <section className="block">
        <h2 className="block__title">Perolehan cakram</h2>
        <dl className="ledger">
          <div className={`ledger__row${!gameOver && turn === DARK ? ' ledger__row--turn' : ''}`}>
            <dt>Hitam</dt>
            <dd>{pad(tally[DARK])}</dd>
          </div>
          <div className={`ledger__row${!gameOver && turn === LIGHT ? ' ledger__row--turn' : ''}`}>
            <dt>Putih {botOn ? '(bot)' : ''}</dt>
            <dd>{pad(tally[LIGHT])}</dd>
          </div>
        </dl>
      </section>

      <section className="block">
        <h2 className="block__title">Ronde dimenangkan</h2>
        <dl className="ledger">
          <div className="ledger__row">
            <dt>Hitam</dt>
            <dd>{pad(scores[DARK])}</dd>
          </div>
          <div className="ledger__row">
            <dt>Seri</dt>
            <dd>{pad(scores.draw)}</dd>
          </div>
          <div className="ledger__row">
            <dt>Putih</dt>
            <dd>{pad(scores[LIGHT])}</dd>
          </div>
        </dl>
      </section>

      <div className="controls">
        <button type="button" className="btn btn--solid" onClick={newRound}>
          Ronde baru
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
          Putih: {botOn ? 'bot' : 'manusia'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            newRound()
            setScores({ [DARK]: 0, [LIGHT]: 0, draw: 0 })
          }}
        >
          Hapus perolehan
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={soundOn}
          onClick={() => setSoundOn((s) => !s)}
        >
          Suara: {soundOn ? 'aktif' : 'mati'}
        </button>
      </div>
    </>
  )

  return <GameLayout board={boardEl} panel={panel} />
}
