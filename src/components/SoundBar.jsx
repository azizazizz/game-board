import { useEffect, useRef } from 'react'

const BAR_COUNT = 12

// visualizer yang membaca data frekuensi nyata dari AnalyserNode setiap
// bingkai, jadi tingginya benar-benar mengikuti musik yang sedang berbunyi
// (bukan animasi hias). Klik untuk mematikan/menyalakan musik.
export default function SoundBar({ analyser, muted, onToggle }) {
  const barRefs = useRef([])
  const rafRef = useRef(null)

  useEffect(() => {
    if (!analyser) return undefined

    const data = new Uint8Array(analyser.frequencyBinCount)
    const step = Math.max(1, Math.floor(data.length / BAR_COUNT))

    function draw() {
      analyser.getByteFrequencyData(data)

      barRefs.current.forEach((el, i) => {
        if (!el) return
        const value = data[i * step] ?? 0
        const pct = muted ? 5 : Math.max(6, Math.round((value / 255) * 100))
        el.style.height = `${pct}%`
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, muted])

  return (
    <button
      type="button"
      className="soundbar"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Nyalakan musik latar' : 'Matikan musik latar'}
      title={muted ? 'Musik: mati' : 'Musik: aktif'}
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el
          }}
          className="soundbar__bar"
        />
      ))}
    </button>
  )
}
