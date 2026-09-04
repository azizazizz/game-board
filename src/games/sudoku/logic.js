import { makeRandom, shuffle } from '../../lib/random'

export const DIFFICULTIES = {
  easy: { givens: 40, label: 'Mudah' },
  medium: { givens: 32, label: 'Sedang' },
  hard: { givens: 26, label: 'Sulit' },
}

const NODE_CAP = 60000

function candidates(grid, pos) {
  const r = Math.floor(pos / 9)
  const c = pos % 9
  const used = new Set()

  for (let cc = 0; cc < 9; cc++) used.add(grid[r * 9 + cc])
  for (let rr = 0; rr < 9; rr++) used.add(grid[rr * 9 + c])

  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) used.add(grid[rr * 9 + cc])
  }

  const out = []
  for (let n = 1; n <= 9; n++) if (!used.has(n)) out.push(n)
  return out
}

export function generateSolution(seed) {
  const random = makeRandom(seed)
  const grid = Array(81).fill(0)

  function fill(pos) {
    if (pos === 81) return true

    for (const n of shuffle(candidates(grid, pos), random)) {
      grid[pos] = n
      if (fill(pos + 1)) return true
      grid[pos] = 0
    }
    return false
  }

  fill(0)
  return grid
}

// pencacah solusi yang berhenti begitu menemukan solusi kedua, dengan batas
// simpul pencarian supaya waktu penggalian lubang tetap pendek
function countSolutions(grid, limit) {
  const g = grid.slice()
  let count = 0
  let nodes = 0

  function solve(pos) {
    if (count >= limit || nodes > NODE_CAP) return
    nodes++

    if (pos === 81) {
      count++
      return
    }
    if (g[pos] !== 0) {
      solve(pos + 1)
      return
    }

    for (const n of candidates(g, pos)) {
      g[pos] = n
      solve(pos + 1)
      g[pos] = 0
      if (count >= limit || nodes > NODE_CAP) return
    }
  }

  solve(0)
  return nodes > NODE_CAP ? Math.max(count, 2) : count
}

export function digHoles(solution, seed, targetGivens) {
  const random = makeRandom(seed)
  const puzzle = solution.slice()
  const order = shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    random,
  )

  let givens = 81

  for (const pos of order) {
    if (givens <= targetGivens) break

    const backup = puzzle[pos]
    puzzle[pos] = 0

    if (countSolutions(puzzle, 2) === 1) givens--
    else puzzle[pos] = backup
  }

  return puzzle
}

export function generatePuzzle(seed, difficultyKey) {
  const solution = generateSolution(seed)
  const puzzle = digHoles(solution, seed + 1, DIFFICULTIES[difficultyKey].givens)
  return { solution, puzzle }
}

function hasConflictAt(grid, pos) {
  const v = grid[pos]
  if (!v) return false

  const r = Math.floor(pos / 9)
  const c = pos % 9

  for (let cc = 0; cc < 9; cc++) if (cc !== c && grid[r * 9 + cc] === v) return true
  for (let rr = 0; rr < 9; rr++) if (rr !== r && grid[rr * 9 + c] === v) return true

  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      const p = rr * 9 + cc
      if (p !== pos && grid[p] === v) return true
    }
  }

  return false
}

export function findConflicts(grid) {
  const set = new Set()
  for (let i = 0; i < 81; i++) if (hasConflictAt(grid, i)) set.add(i)
  return set
}

export function peersOf(pos) {
  const r = Math.floor(pos / 9)
  const c = pos % 9
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  const set = new Set()

  for (let cc = 0; cc < 9; cc++) set.add(r * 9 + cc)
  for (let rr = 0; rr < 9; rr++) set.add(rr * 9 + c)
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) set.add(rr * 9 + cc)
  }

  return set
}

export function isComplete(grid) {
  return grid.every((v) => v !== 0) && findConflicts(grid).size === 0
}
