const FILE_LETTERS = 'abcdefgh'

export function pad(n) {
  return String(n).padStart(2, '0')
}

// notasi petak ala lembar skor catur: a1 di kiri atas untuk papan kecil
export function coord(i, cols = 3) {
  return `${FILE_LETTERS[i % cols]}${Math.floor(i / cols) + 1}`
}

export function fileLabels(cols) {
  return FILE_LETTERS.slice(0, cols).split('')
}

export function rankLabels(rows, descending = false) {
  const list = Array.from({ length: rows }, (_, i) => String(i + 1))
  return descending ? list.reverse() : list
}

export function clock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(Math.min(m, 99))}:${pad(s)}`
}
