import { useEffect, useState } from 'react'

const SRC = '/music-game-board.mp3'

function createAudio() {
  if (typeof Audio === 'undefined') return null
  const audio = new Audio(SRC)
  audio.loop = true
  audio.volume = 0.55
  return audio
}

// musik latar untuk Daftar Isi saja: menyala saat `active` true, berhenti
// total begitu sebuah game dibuka. Elemen <audio> dibuat sekali lewat
// initializer malas useState, bukan dipasang di JSX, supaya tetap hidup dan
// tidak diulang dari awal saat komponen induk render ulang.
export function useMenuMusic(active) {
  const [audio] = useState(createAudio)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (!audio) return undefined

    if (active && !muted) {
      audio.play().catch(() => {
        /* diblokir kebijakan autoplay peramban; coba lagi di bawah */
      })
    } else {
      audio.pause()
    }

    // sebagian peramban menolak audio berbunyi sebelum ada interaksi
    // pengguna; coba lagi begitu pengguna menyentuh halaman untuk pertama kali
    function retry() {
      if (active && !muted && audio.paused) audio.play().catch(() => {})
    }

    document.addEventListener('pointerdown', retry, { once: true })
    document.addEventListener('keydown', retry, { once: true })

    return () => {
      document.removeEventListener('pointerdown', retry)
      document.removeEventListener('keydown', retry)
    }
  }, [active, muted, audio])

  // hentikan musik kalau komponen yang memakai hook ini lenyap
  useEffect(() => {
    return () => audio?.pause()
  }, [audio])

  return [muted, setMuted]
}
