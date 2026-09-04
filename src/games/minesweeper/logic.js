import { makeRandom, pickIndexes } from '../../lib/random'

export const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10, label: 'Pemula' },
  intermediate: { rows: 16, cols: 16, mines: 40, label: 'Menengah' },
  expert: { rows: 16, cols: 30, mines: 99, label: 'Mahir' },
}

function neighbors(rows, cols, i) {
  const r = Math.floor(i / cols)
  const c = i % cols
  const out = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const rr = r + dr
      const cc = c + dc
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) out.push(rr * cols + cc)
    }
  }

  return out
}

// klik pertama selalu aman: ranjau dikecualikan dari petak itu dan tetangganya
export function generateLayout(rows, cols, mineCount, seed, safeIndex) {
  const random = makeRandom(seed)
  const total = rows * cols
  const forbidden = new Set([safeIndex, ...neighbors(rows, cols, safeIndex)])
  const mineIndexes = pickIndexes(total, mineCount, random, forbidden)

  const mines = Array(total).fill(false)
  mineIndexes.forEach((i) => {
    mines[i] = true
  })

  const counts = Array(total).fill(0)
  for (let i = 0; i < total; i++) {
    if (mines[i]) continue
    counts[i] = neighbors(rows, cols, i).filter((n) => mines[n]).length
  }

  return { rows, cols, mines, counts }
}

// penelusuran lebar berbasis tumpukan, bukan rekursi, supaya papan Mahir
// dengan area kosong besar tidak menumpuk pemanggilan fungsi
export function revealCascade(layout, revealed, flagged, start) {
  if (flagged[start] || revealed[start]) return revealed

  const next = revealed.slice()
  next[start] = true

  if (layout.mines[start] || layout.counts[start] !== 0) return next

  const stack = [start]
  while (stack.length > 0) {
    const i = stack.pop()
    for (const n of neighbors(layout.rows, layout.cols, i)) {
      if (next[n] || flagged[n] || layout.mines[n]) continue
      next[n] = true
      if (layout.counts[n] === 0) stack.push(n)
    }
  }

  return next
}

export function toggleFlag(flagged, revealed, i) {
  if (revealed[i]) return flagged
  const next = flagged.slice()
  next[i] = !next[i]
  return next
}

// buka tetangga dari angka yang benderanya sudah lengkap
export function chord(layout, revealed, flagged, i) {
  if (!revealed[i] || layout.mines[i]) return null

  const need = layout.counts[i]
  if (need === 0) return null

  const around = neighbors(layout.rows, layout.cols, i)
  const flagCount = around.filter((n) => flagged[n]).length
  if (flagCount !== need) return null

  let nextRevealed = revealed
  let hitMine = false

  for (const n of around) {
    if (flagged[n] || nextRevealed[n]) continue

    if (layout.mines[n]) {
      hitMine = true
      const copy = nextRevealed.slice()
      copy[n] = true
      nextRevealed = copy
    } else {
      nextRevealed = revealCascade(layout, nextRevealed, flagged, n)
    }
  }

  return { revealed: nextRevealed, hitMine }
}

export function checkWin(layout, revealed) {
  for (let i = 0; i < revealed.length; i++) {
    if (!layout.mines[i] && !revealed[i]) return false
  }
  return true
}

export function revealAllMines(layout, revealed) {
  const next = revealed.slice()
  layout.mines.forEach((isMine, i) => {
    if (isMine) next[i] = true
  })
  return next
}
