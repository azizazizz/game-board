import { applyMove, foeOf, legalMoves } from './logic'

// bobot posisi klasik: sudut sangat berharga, petak tepat di samping sudut
// dihindari karena membuka jalan lawan menguasai sudut itu sendiri
const WEIGHTS = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
]

function evaluate(board, me) {
  const foe = foeOf(me)
  let score = 0

  for (let i = 0; i < board.length; i++) {
    if (board[i] === me) score += WEIGHTS[i]
    else if (board[i] === foe) score -= WEIGHTS[i]
  }

  const myMoves = legalMoves(board, me).length
  const foeMoves = legalMoves(board, foe).length
  score += (myMoves - foeMoves) * 2

  return score
}

function search(board, depth, player, me) {
  const moves = legalMoves(board, player)

  if (depth === 0) return evaluate(board, me)

  if (moves.length === 0) {
    const foeMoves = legalMoves(board, foeOf(player))
    if (foeMoves.length === 0) {
      const { [me]: mine = 0, [foeOf(me)]: theirs = 0 } = countPlayers(board)
      return mine === theirs ? 0 : mine > theirs ? 100000 : -100000
    }
    return search(board, depth - 1, foeOf(player), me)
  }

  const maximizing = player === me
  let best = maximizing ? -Infinity : Infinity

  for (const move of moves) {
    const result = applyMove(board, move, player)
    if (!result) continue

    const value = search(result.board, depth - 1, foeOf(player), me)
    if (maximizing) best = Math.max(best, value)
    else best = Math.min(best, value)
  }

  return best
}

function countPlayers(board) {
  const out = {}
  for (const v of board) {
    if (v) out[v] = (out[v] ?? 0) + 1
  }
  return out
}

export function chooseMove(board, me, depth = 3) {
  const moves = legalMoves(board, me)
  if (moves.length === 0) return -1

  let bestMove = moves[0]
  let bestValue = -Infinity

  for (const move of moves) {
    const result = applyMove(board, move, me)
    if (!result) continue

    const value = search(result.board, depth - 1, foeOf(me), me)
    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }

  return bestMove
}
