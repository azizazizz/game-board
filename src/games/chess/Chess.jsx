import { Chess as ChessEngine } from 'chess.js'
import { useMemo, useState } from 'react'
import BoardFrame from '../../components/BoardFrame'
import GameLayout from '../../components/GameLayout'
import Scoresheet from '../../components/Scoresheet'
import { Ring } from '../../components/Marks'
import { useSound } from '../../lib/useSound'
import { useShake } from '../../lib/useShake'
import { fileLabels, pad, rankLabels } from '../../lib/format'
import { PIECE_NAME, SIDE_NAME, replay, squareAt } from './logic'
import PieceGlyph from './PieceGlyph'

const TONE = { w: 'x', b: 'o' }
const PROMOTIONS = ['q', 'r', 'b', 'n']

export default function Chess() {
  const [moves, setMoves] = useState([])
  const [viewPly, setViewPly] = useState(0)
  const [selected, setSelected] = useState(null)
  const [pendingPromotion, setPendingPromotion] = useState(null)
  const [scores, setScores] = useState({ w: 0, b: 0, draw: 0 })
  const [soundOn, setSoundOn] = useState(true)

  const play = useSound(soundOn)
  const [shaking, shake] = useShake()

  const game = useMemo(() => replay(moves, viewPly), [moves, viewPly])
  const board = game.board()
  const turn = game.turn()
  const isCheck = game.isCheck()
  const isCheckmate = game.isCheckmate()
  const isStalemate = game.isStalemate()
  const isDraw = game.isDraw()
  const over = game.isGameOver()
  const isLatest = viewPly === moves.length

  const legalTargets = useMemo(() => {
    if (!selected) return []
    return game.moves({ square: selected, verbose: true })
  }, [selected, game])

  const targetMap = useMemo(() => {
    const map = new Map()
    legalTargets.forEach((m) => map.set(m.to, m))
    return map
  }, [legalTargets])

  const kingSquare = useMemo(() => {
    if (!isCheck) return null
    for (const row of board) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === turn) return piece.square
      }
    }
    return null
  }, [board, isCheck, turn])

  const capturedTally = useMemo(() => {
    const tally = { w: 0, b: 0 }
    moves.forEach((m) => {
      if (m.captured) tally[m.color] += 1
    })
    return tally
  }, [moves])

  function commitMove(from, to, promotion) {
    const base = moves.slice(0, viewPly)
    const trial = new ChessEngine(game.fen())

    let result
    try {
      result = trial.move({ from, to, promotion })
    } catch {
      result = null
    }

    if (!result) {
      play('invalid')
      shake()
      return
    }

    const nextMoves = [
      ...base,
      { from, to, promotion, san: result.san, captured: result.captured ?? null, color: result.color },
    ]
    setMoves(nextMoves)
    setViewPly(nextMoves.length)
    setSelected(null)
    setPendingPromotion(null)

    if (trial.isCheckmate()) {
      setScores((s) => ({ ...s, [result.color]: s[result.color] + 1 }))
      play('win')
    } else if (trial.isDraw() || trial.isStalemate()) {
      setScores((s) => ({ ...s, draw: s.draw + 1 }))
      play('draw')
    } else if (trial.isCheck()) {
      play('check')
    } else if (result.captured) {
      play('capture')
    } else {
      play('place')
    }
  }

  function onSquareClick(square, piece) {
    if (pendingPromotion || over) return

    if (selected) {
      const match = targetMap.get(square)
      if (match) {
        if (match.promotion) setPendingPromotion({ from: selected, to: square })
        else commitMove(selected, square)
        return
      }

      if (piece && piece.color === turn) {
        setSelected(square)
      } else {
        play('invalid')
        shake()
        setSelected(null)
      }
      return
    }

    if (piece && piece.color === turn) setSelected(square)
  }

  function undoLastMove() {
    if (moves.length === 0) return
    const nextMoves = moves.slice(0, -1)
    setMoves(nextMoves)
    setViewPly(Math.min(viewPly, nextMoves.length))
    setSelected(null)
    setPendingPromotion(null)
  }

  function newRound() {
    setMoves([])
    setViewPly(0)
    setSelected(null)
    setPendingPromotion(null)
  }

  const labels = moves.map((m) => m.san)

  const verdict = isCheckmate
    ? { label: 'Skakmat', value: SIDE_NAME[turn === 'w' ? 'b' : 'w'] }
    : isStalemate
      ? { label: 'Hasil', value: 'Buntu' }
      : isDraw
        ? { label: 'Hasil', value: 'Seri' }
        : isCheck
          ? { label: 'Skak', value: SIDE_NAME[turn] }
          : { label: 'Giliran', value: SIDE_NAME[turn] }

  const boardEl = (
    <BoardFrame
      cols={8}
      rows={8}
      files={fileLabels(8)}
      ranks={rankLabels(8, true)}
      width={420}
      shake={shaking}
    >
      <div className="grid" role="group" aria-label="Papan catur">
        {board.flat().map((piece, i) => {
          const r = Math.floor(i / 8)
          const c = i % 8
          const square = squareAt(r, c)
          const target = targetMap.get(square)
          const isCapture = Boolean(target && piece)

          return (
            <button
              key={square}
              type="button"
              className={[
                'cell',
                (r + c) % 2 === 0 ? 'chess-cell--light' : 'chess-cell--dark',
                selected === square ? 'chess-cell--selected' : '',
                kingSquare === square ? 'chess-cell--check' : '',
                isCapture ? 'chess-cell--capture' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSquareClick(square, piece)}
              disabled={over}
              aria-label={
                piece
                  ? `${square}, ${PIECE_NAME[piece.type]} ${SIDE_NAME[piece.color]}`
                  : `${square}, kosong`
              }
            >
              {piece ? <PieceGlyph type={piece.type} tone={TONE[piece.color]} /> : null}
              {target && !piece ? <Ring /> : null}
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
            verdict.value === 'Putih' || verdict.value === 'Hitam'
              ? ` verdict__value--${verdict.value === 'Putih' ? 'x' : 'o'}`
              : ''
          }`}
        >
          {verdict.value}
        </p>
        <p className="verdict__note">
          Langkah {pad(viewPly)}
          {!isLatest ? ' / putar ulang' : ''}
        </p>
      </section>

      {pendingPromotion ? (
        <section className="block">
          <h2 className="block__title">Pilih promosi</h2>
          <div className="promo-row">
            {PROMOTIONS.map((p) => (
              <button
                key={p}
                type="button"
                className="promo-btn"
                onClick={() => commitMove(pendingPromotion.from, pendingPromotion.to, p)}
              >
                <PieceGlyph type={p} tone={TONE[turn]} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="block">
        <h2 className="block__title">Bidak tertangkap</h2>
        <dl className="ledger">
          <div className="ledger__row">
            <dt>Oleh Putih</dt>
            <dd>{pad(capturedTally.w)}</dd>
          </div>
          <div className="ledger__row">
            <dt>Oleh Hitam</dt>
            <dd>{pad(capturedTally.b)}</dd>
          </div>
        </dl>
      </section>

      <section className="block">
        <h2 className="block__title">Ronde dimenangkan</h2>
        <dl className="ledger">
          <div className="ledger__row">
            <dt>Putih</dt>
            <dd>{pad(scores.w)}</dd>
          </div>
          <div className="ledger__row">
            <dt>Seri</dt>
            <dd>{pad(scores.draw)}</dd>
          </div>
          <div className="ledger__row">
            <dt>Hitam</dt>
            <dd>{pad(scores.b)}</dd>
          </div>
        </dl>
      </section>

      <section className="block block--grow">
        <h2 className="block__title">Lembar langkah</h2>
        <button
          type="button"
          className={`ply ply--start${viewPly === 0 ? ' ply--current' : ''}`}
          onClick={() => setViewPly(0)}
        >
          papan awal
        </button>
        <div className="scroll-y">
          <Scoresheet headers={['Putih', 'Hitam']} labels={labels} currentPly={viewPly} onJump={setViewPly} />
        </div>
      </section>

      <div className="controls">
        <div className="btn-row">
          <button type="button" className="btn btn--sm" onClick={undoLastMove} disabled={moves.length === 0}>
            Batal langkah
          </button>
          <button type="button" className="btn btn--sm" onClick={newRound}>
            Permainan baru
          </button>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            newRound()
            setScores({ w: 0, b: 0, draw: 0 })
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
