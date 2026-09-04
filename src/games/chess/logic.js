import { Chess } from 'chess.js'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export function squareAt(r, c) {
  return `${FILES[c]}${8 - r}`
}

// membangun ulang posisi dari nol lewat sejumlah langkah pertama, karena
// chess.js tidak menyediakan cara melompat langsung ke posisi sembarang
export function replay(moves, ply) {
  const game = new Chess()
  for (let i = 0; i < ply; i++) {
    const m = moves[i]
    game.move({ from: m.from, to: m.to, promotion: m.promotion })
  }
  return game
}

export const PIECE_NAME = {
  p: 'Pion',
  n: 'Kuda',
  b: 'Gajah',
  r: 'Benteng',
  q: 'Menteri',
  k: 'Raja',
}

export const SIDE_NAME = { w: 'Putih', b: 'Hitam' }
