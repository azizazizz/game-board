export const COLS = 7
export const ROWS = 6
export const RED = 'R'
export const BLUE = 'B'

// indeks = baris * COLS + kolom, baris 0 di paling atas
export function emptyBoard() {
  return Array(COLS * ROWS).fill(null)
}

export function landingRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r * COLS + col]) return r
  }
  return -1
}

export function drop(board, col, player) {
  const row = landingRow(board, col)
  if (row < 0) return null

  const next = board.slice()
  const index = row * COLS + col
  next[index] = player
  return { board: next, index }
}

export function legalCols(board) {
  const out = []
  for (let c = 0; c < COLS; c++) {
    if (landingRow(board, c) >= 0) out.push(c)
  }
  return out
}

const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

export function findWinner(board) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r * COLS + c]
      if (!player) continue

      for (const [dr, dc] of DIRS) {
        const line = [r * COLS + c]

        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k
          const cc = c + dc * k
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break
          if (board[rr * COLS + cc] !== player) break
          line.push(rr * COLS + cc)
        }

        if (line.length === 4) return { player, line }
      }
    }
  }
  return null
}

export function isFull(board) {
  return board.every(Boolean)
}

export function boardFromMoves(moves) {
  let board = emptyBoard()
  let index = -1

  moves.forEach((col, i) => {
    const result = drop(board, col, i % 2 === 0 ? RED : BLUE)
    if (result) {
      board = result.board
      index = result.index
    }
  })

  return { board, lastIndex: index }
}

// semua jendela empat petak, dipakai bot untuk menilai posisi
export function windows() {
  const out = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of DIRS) {
        const cells = []

        for (let k = 0; k < 4; k++) {
          const rr = r + dr * k
          const cc = c + dc * k
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break
          cells.push(rr * COLS + cc)
        }

        if (cells.length === 4) out.push(cells)
      }
    }
  }

  return out
}
