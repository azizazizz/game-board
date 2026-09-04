export const SIZE = 8
export const DARK = 'D'
export const LIGHT = 'L'

const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export function foeOf(player) {
  return player === DARK ? LIGHT : DARK
}

export function initialBoard() {
  const board = Array(SIZE * SIZE).fill(null)
  board[27] = LIGHT
  board[28] = DARK
  board[35] = DARK
  board[36] = LIGHT
  return board
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE
}

// baris petak yang akan terbalik ke satu arah bila player bermain di (r, c)
function flipsInDirection(board, r, c, dr, dc, player) {
  const foe = foeOf(player)
  const flips = []
  let rr = r + dr
  let cc = c + dc

  while (inBounds(rr, cc) && board[rr * SIZE + cc] === foe) {
    flips.push(rr * SIZE + cc)
    rr += dr
    cc += dc
  }

  if (flips.length > 0 && inBounds(rr, cc) && board[rr * SIZE + cc] === player) {
    return flips
  }
  return []
}

export function flipsForMove(board, index, player) {
  if (board[index]) return []

  const r = Math.floor(index / SIZE)
  const c = index % SIZE
  let all = []

  for (const [dr, dc] of DIRS) {
    all = all.concat(flipsInDirection(board, r, c, dr, dc, player))
  }

  return all
}

export function legalMoves(board, player) {
  const moves = []
  for (let i = 0; i < board.length; i++) {
    if (!board[i] && flipsForMove(board, i, player).length > 0) moves.push(i)
  }
  return moves
}

export function applyMove(board, index, player) {
  const flips = flipsForMove(board, index, player)
  if (flips.length === 0) return null

  const next = board.slice()
  next[index] = player
  for (const i of flips) next[i] = player

  return { board: next, flips }
}

export function count(board) {
  let dark = 0
  let light = 0
  for (const v of board) {
    if (v === DARK) dark++
    else if (v === LIGHT) light++
  }
  return { [DARK]: dark, [LIGHT]: light }
}

export function isFull(board) {
  return board.every(Boolean)
}
