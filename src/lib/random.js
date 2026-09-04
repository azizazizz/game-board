// PRNG berbenih (mulberry32). Dipakai supaya papan acak bisa dibangkitkan
// dari benih yang tersimpan di state, jadi render tetap murni.
export function makeRandom(seed) {
  let a = seed >>> 0

  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// hanya boleh dipanggil dari penangan peristiwa atau efek, bukan saat render
export function newSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
}

export function shuffle(list, random) {
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ambil n indeks unik dari rentang 0..total-1, melewati indeks terlarang
export function pickIndexes(total, n, random, forbidden = new Set()) {
  const pool = []
  for (let i = 0; i < total; i++) {
    if (!forbidden.has(i)) pool.push(i)
  }
  return shuffle(pool, random).slice(0, n)
}
