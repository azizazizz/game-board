import { useCallback, useEffect, useState } from 'react'

// detik berjalan sederhana, dipakai Minesweeper dan sudoku
export function useTimer(running) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!running) return undefined

    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const reset = useCallback(() => setSeconds(0), [])

  return [seconds, reset]
}
