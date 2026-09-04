import { BLUE, RED, drop, findWinner, isFull, legalCols, windows } from './logic'

const WINDOWS = windows()

// kolom tengah diperiksa lebih dulu supaya pemangkasan alfa beta lebih tajam
const ORDER = [3, 2, 4, 1, 5, 0, 6]

function foeOf(player) {
  return player === RED ? BLUE : RED
}

function evaluate(board, me) {
  const foe = foeOf(me)
  let score = 0

  for (const cells of WINDOWS) {
    let mine = 0
    let theirs = 0

    for (const i of cells) {
      if (board[i] === me) mine++
      else if (board[i] === foe) theirs++
    }

    if (mine && theirs) continue
    if (mine === 3) score += 60
    else if (mine === 2) score += 10
    else if (mine === 1) score += 1
    else if (theirs === 3) score -= 80
    else if (theirs === 2) score -= 12
    else if (theirs === 1) score -= 1
  }

  // sedikit bonus untuk kolom tengah
  for (let r = 0; r < 6; r++) {
    if (board[r * 7 + 3] === me) score += 4
    else if (board[r * 7 + 3] === foe) score -= 4
  }

  return score
}

function search(board, depth, alpha, beta, turn, me) {
  const win = findWinner(board)
  if (win) return win.player === me ? 100000 + depth : -100000 - depth
  if (isFull(board)) return 0
  if (depth === 0) return evaluate(board, me)

  const legal = legalCols(board)
  const cols = ORDER.filter((c) => legal.includes(c))
  const maximizing = turn === me
  let best = maximizing ? -Infinity : Infinity
  let a = alpha
  let b = beta

  for (const col of cols) {
    const next = drop(board, col, turn)
    if (!next) continue

    const value = search(next.board, depth - 1, a, b, foeOf(turn), me)

    if (maximizing) {
      if (value > best) best = value
      if (best > a) a = best
    } else {
      if (value < best) best = value
      if (best < b) b = best
    }

    if (b <= a) break
  }

  return best
}

export function chooseColumn(board, me, depth = 5) {
  const legal = legalCols(board)
  const cols = ORDER.filter((c) => legal.includes(c))
  if (cols.length === 0) return -1

  let bestCol = cols[0]
  let bestValue = -Infinity

  for (const col of cols) {
    const next = drop(board, col, me)
    if (!next) continue

    const value = search(next.board, depth - 1, -Infinity, Infinity, foeOf(me), me)
    if (value > bestValue) {
      bestValue = value
      bestCol = col
    }
  }

  return bestCol
}
