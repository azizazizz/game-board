import { useCallback, useRef } from 'react'

// nada pendek untuk tiap peristiwa, dibunyikan lewat WebAudio tanpa berkas aset
const VOICES = {
  X: { notes: [329.63], wave: 'square' },
  O: { notes: [246.94], wave: 'square' },
  place: { notes: [293.66], wave: 'square' },
  drop: { notes: [196, 164.81], wave: 'square' },
  flip: { notes: [392, 440], wave: 'triangle' },
  reveal: { notes: [523.25], wave: 'square' },
  flag: { notes: [659.25], wave: 'square' },
  boom: { notes: [110, 87.31, 65.41], wave: 'sawtooth' },
  pass: { notes: [220], wave: 'triangle' },
  invalid: { notes: [138.59], wave: 'sawtooth' },
  capture: { notes: [220, 164.81], wave: 'square' },
  check: { notes: [880], wave: 'triangle' },
  win: { notes: [392, 523.25, 659.25], wave: 'square' },
  draw: { notes: [311.13, 261.63], wave: 'square' },
  solved: { notes: [523.25, 659.25, 783.99, 1046.5], wave: 'triangle' },
}

export function useSound(enabled) {
  const ctxRef = useRef(null)

  return useCallback(
    (type) => {
      const voice = VOICES[type]
      if (!enabled || !voice) return

      try {
        if (!ctxRef.current) {
          const Ctx = window.AudioContext || window.webkitAudioContext
          if (!Ctx) return
          ctxRef.current = new Ctx()
        }
        const ctx = ctxRef.current
        if (ctx.state === 'suspended') ctx.resume()

        voice.notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          const start = ctx.currentTime + i * 0.1

          osc.type = voice.wave
          osc.frequency.setValueAtTime(freq, start)
          gain.gain.setValueAtTime(0.0001, start)
          gain.gain.exponentialRampToValueAtTime(0.05, start + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16)
          osc.connect(gain).connect(ctx.destination)
          osc.start(start)
          osc.stop(start + 0.18)
        })
      } catch {
        /* audio tidak tersedia, abaikan */
      }
    },
    [enabled],
  )
}
