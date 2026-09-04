import { useRef, useState } from 'react'

// getar sesaat untuk langkah tidak sah: dipicu dari penangan klik, bukan dari
// :hover, jadi tetap patuh pada aturan "tanpa animasi hover"
export function useShake(durationMs = 320) {
  const [shaking, setShaking] = useState(false)
  const timeoutRef = useRef(null)

  function trigger() {
    clearTimeout(timeoutRef.current)
    setShaking(false)
    // lepas lalu pasang lagi di frame berikutnya supaya animasi tetap
    // terpicu ulang meski dipanggil berturut-turut pada elemen yang sama
    requestAnimationFrame(() => {
      setShaking(true)
      timeoutRef.current = setTimeout(() => setShaking(false), durationMs)
    })
  }

  return [shaking, trigger]
}
