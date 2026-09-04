import { useEffect, useState } from 'react'
import { createMusicEngine } from './musicEngine'

// satu mesin musik per komponen yang memanggilnya, dibuat sekali lewat
// initializer malas useState (bukan saat render biasa). AnalyserNode sudah
// jadi bagian dari mesin sejak dibangun, jadi tidak perlu setState di efek
// untuk mengumumkan kesiapannya. Mesin mulai berjalan saat game tampil,
// berhenti dan menutup AudioContext saat game lenyap.
export function useGameMusic(theme) {
  const [engine] = useState(() => createMusicEngine(theme))
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    engine.start()
    return () => engine.stop()
  }, [engine])

  useEffect(() => {
    engine.setMuted(muted)
  }, [engine, muted])

  return [muted, setMuted, engine.getAnalyser()]
}
