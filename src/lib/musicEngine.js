// mesin musik prosedural: step-sequencer dua suara (bas + melodi) lewat Web
// Audio API murni, tanpa berkas audio. Penjadwalan memakai pola "lookahead"
// standar (jadwalkan sedikit di depan currentTime lewat setInterval pendek)
// supaya tidak jitter seperti kalau nada dipicu langsung dari setInterval.
const SCHEDULE_AHEAD = 0.12
const LOOKAHEAD_MS = 25

function degreeToFreq(root, scale, degree, octave) {
  const len = scale.length
  const octaveShift = Math.floor(degree / len) + octave
  const idx = ((degree % len) + len) % len
  const semitone = scale[idx] + octaveShift * 12
  return root * 2 ** (semitone / 12)
}

// AudioContext dan AnalyserNode dibuat sekali di sini, saat mesin dibangun
// (lewat initializer malas useState di useGameMusic), bukan menunggu start().
// Dengan begitu analyser sudah tersedia sejak render pertama, tanpa perlu
// setState di dalam efek untuk "mengumumkan" kesiapannya.
export function createMusicEngine(theme) {
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  const ctx = Ctx ? new Ctx() : null
  const master = ctx ? ctx.createGain() : null
  const analyser = ctx ? ctx.createAnalyser() : null

  if (ctx) {
    master.gain.value = 1
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.7
    master.connect(analyser)
    analyser.connect(ctx.destination)
  }

  let timerId = null
  let nextStepTime = 0
  let stepIndex = 0
  let running = false

  const stepDuration = 60 / theme.bpm / 2

  function playNote(freq, time, duration, wave, peak) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    osc.connect(gain).connect(master)
    osc.start(time)
    osc.stop(time + duration + 0.05)
  }

  function scheduleStep(time) {
    const len = Math.max(theme.bassPattern.length, theme.leadPattern.length)
    const bassDeg = theme.bassPattern[stepIndex % theme.bassPattern.length]
    const leadDeg = theme.leadPattern[stepIndex % theme.leadPattern.length]

    if (bassDeg !== null && bassDeg !== undefined) {
      const freq = degreeToFreq(theme.root, theme.scale, bassDeg, theme.bassOctave ?? -1)
      playNote(freq, time, stepDuration * (theme.bassSustain ?? 0.9), theme.bassWave ?? 'triangle', theme.bassGain ?? 0.07)
    }

    if (leadDeg !== null && leadDeg !== undefined) {
      const freq = degreeToFreq(theme.root, theme.scale, leadDeg, theme.leadOctave ?? 0)
      playNote(freq, time, stepDuration * (theme.leadSustain ?? 0.5), theme.leadWave ?? 'square', theme.leadGain ?? 0.04)
    }

    stepIndex = (stepIndex + 1) % len
  }

  function tick() {
    while (nextStepTime < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(nextStepTime)
      nextStepTime += stepDuration
    }
  }

  function resumeOnGesture() {
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  }

  return {
    start() {
      if (!ctx || running) return

      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      // sebagian peramban menahan AudioContext di 'suspended' sampai ada
      // interaksi pengguna; coba lagi begitu itu terjadi
      document.addEventListener('pointerdown', resumeOnGesture)
      document.addEventListener('keydown', resumeOnGesture)

      running = true
      stepIndex = 0
      nextStepTime = ctx.currentTime + 0.05
      timerId = setInterval(tick, LOOKAHEAD_MS)
    },

    // menjeda (bukan menutup) AudioContext: React StrictMode sengaja
    // menjalankan efek sebagai mount -> cleanup -> mount saat pengembangan,
    // jadi stop() harus aman dipanggil lalu start() lagi tanpa kehilangan
    // suara secara permanen
    stop() {
      running = false
      clearInterval(timerId)
      timerId = null
      document.removeEventListener('pointerdown', resumeOnGesture)
      document.removeEventListener('keydown', resumeOnGesture)
      if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {})
    },

    setMuted(muted) {
      if (master) master.gain.value = muted ? 0 : 1
    },

    getAnalyser() {
      return analyser
    },
  }
}
