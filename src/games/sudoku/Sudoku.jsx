import { useEffect, useMemo, useRef, useState } from 'react'
import BoardFrame from '../../components/BoardFrame'
import GameLayout from '../../components/GameLayout'
import SoundBar from '../../components/SoundBar'
import WelcomeDialog from '../../components/WelcomeDialog'
import { useSound } from '../../lib/useSound'
import { useShake } from '../../lib/useShake'
import { useGameMusic } from '../../lib/useGameMusic'
import { MUSIC_THEMES } from '../../lib/musicThemes'
import { useTimer } from '../../lib/useTimer'
import { newSeed } from '../../lib/random'
import { clock } from '../../lib/format'
import { DIFFICULTIES, findConflicts, generatePuzzle, isComplete, peersOf } from './logic'

function toggleNote(list, digit) {
  return list.includes(digit) ? list.filter((n) => n !== digit) : [...list, digit].sort()
}

export default function Sudoku() {
  const [difficultyKey, setDifficultyKey] = useState('easy')
  const [givenMask, setGivenMask] = useState(null)
  const [values, setValues] = useState(null)
  const [notes, setNotes] = useState(null)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [noteMode, setNoteMode] = useState(false)
  const [status, setStatus] = useState('select')
  const [checkMsg, setCheckMsg] = useState('')
  const [soundOn, setSoundOn] = useState(true)

  const play = useSound(soundOn)
  const [shaking, shake] = useShake()
  const [musicMuted, setMusicMuted, analyser] = useGameMusic(MUSIC_THEMES.sudoku)
  const [seconds, resetTimer] = useTimer(status === 'playing')
  const cellRefs = useRef([])
  const welcomeRef = useRef(null)

  useEffect(() => {
    welcomeRef.current?.showModal()
  }, [])

  const conflicts = useMemo(() => (values ? findConflicts(values) : new Set()), [values])
  const highlight = useMemo(() => {
    if (selected === null || !values) return new Set()
    const set = peersOf(selected)
    const digit = values[selected]
    if (digit) values.forEach((v, i) => v === digit && set.add(i))
    return set
  }, [selected, values])

  function startGame(key) {
    // solusi hanya dipakai generatePuzzle sendiri untuk memastikan jawaban
    // tunggal; komponen ini cukup menyimpan papan soal
    const { puzzle: nextPuzzle } = generatePuzzle(newSeed(), key)
    setDifficultyKey(key)
    setGivenMask(nextPuzzle.map((v) => v !== 0))
    setValues(nextPuzzle.slice())
    setNotes(Array.from({ length: 81 }, () => []))
    setHistory([])
    setSelected(null)
    setNoteMode(false)
    setCheckMsg('')
    setStatus('playing')
    resetTimer()
  }

  function snapshot() {
    setHistory((h) => [...h, { values: values.slice(), notes: notes.map((n) => n.slice()) }])
  }

  function undo() {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setValues(last.values)
    setNotes(last.notes)
    setHistory(history.slice(0, -1))
  }

  function writeDigit(i, digit) {
    if (status !== 'playing') return
    if (givenMask[i]) {
      play('invalid')
      shake()
      return
    }

    snapshot()
    setCheckMsg('')

    if (noteMode) {
      setNotes((prev) => prev.map((n, idx) => (idx === i ? toggleNote(n, digit) : n)))
      play('place')
      return
    }

    const nextValues = values.slice()
    nextValues[i] = nextValues[i] === digit ? 0 : digit
    setValues(nextValues)
    setNotes((prev) => prev.map((n, idx) => (idx === i ? [] : n)))

    if (isComplete(nextValues)) {
      setStatus('solved')
      play('solved')
    } else {
      play('place')
    }
  }

  function clearCell(i) {
    if (status !== 'playing' || givenMask[i]) return

    snapshot()
    setCheckMsg('')
    setValues((prev) => prev.map((v, idx) => (idx === i ? 0 : v)))
    setNotes((prev) => prev.map((n, idx) => (idx === i ? [] : n)))
  }

  function moveSelection(from, dr, dc) {
    const r = Math.floor(from / 9)
    const c = from % 9
    const nr = Math.min(8, Math.max(0, r + dr))
    const nc = Math.min(8, Math.max(0, c + dc))
    const next = nr * 9 + nc
    cellRefs.current[next]?.focus()
  }

  function onCellKeyDown(e, i) {
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault()
      writeDigit(i, Number(e.key))
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      e.preventDefault()
      clearCell(i)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveSelection(i, -1, 0)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveSelection(i, 1, 0)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveSelection(i, 0, -1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveSelection(i, 0, 1)
    }
  }

  function runCheck() {
    if (!values) return
    const c = findConflicts(values)
    const empties = values.filter((v) => v === 0).length

    if (c.size > 0) setCheckMsg(`${c.size} bentrokan ditemukan`)
    else if (empties > 0) setCheckMsg(`${empties} petak masih kosong, belum ada bentrokan`)
    else setCheckMsg('Papan sah dan penuh')
  }

  const remainingCount = useMemo(() => {
    if (!values) return Array(10).fill(9)
    const out = Array(10).fill(9)
    values.forEach((v) => {
      if (v) out[v] -= 1
    })
    return out
  }, [values])

  if (status === 'select') {
    return (
      <>
        <GameLayout
          board={
            <div className="index">
              <p className="index__lead">Pilih tingkat kesulitan untuk membangkitkan papan baru.</p>
              <div className="diff-row">
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                  <button key={key} type="button" className="diff-btn" onClick={() => startGame(key)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          }
          panel={
            <section className="block">
              <h2 className="block__title">Sudoku</h2>
              <p className="verdict__note">
                Papan sembilan kali sembilan dengan tepat satu jawaban untuk setiap tingkat
                kesulitan.
              </p>
              <div className="controls">
                <div className="btn-row">
                  <button
                    type="button"
                    className="btn btn--sm"
                    aria-pressed={!musicMuted}
                    onClick={() => setMusicMuted((m) => !m)}
                  >
                    Musik: {musicMuted ? 'mati' : 'aktif'}
                  </button>
                  <SoundBar
                    analyser={analyser}
                    muted={musicMuted}
                    onToggle={() => setMusicMuted((m) => !m)}
                  />
                </div>
              </div>
            </section>
          }
        />
        <WelcomeDialog
          ref={welcomeRef}
          name="Sudoku"
          blurb="Isi papan sembilan kali sembilan, dibangkitkan baru dengan jawaban tunggal."
          musicMuted={musicMuted}
          onToggleMusic={() => setMusicMuted((m) => !m)}
        />
      </>
    )
  }

  const boardEl = (
    <BoardFrame cols={9} rows={9} width={430} shake={shaking}>
      <div className="grid" role="group" aria-label="Papan sudoku">
        {values.map((v, i) => {
          const r = Math.floor(i / 9)
          const c = i % 9
          const isGiven = givenMask[i]
          const isConflict = conflicts.has(i)
          const isSelected = selected === i
          const isHighlight = highlight.has(i) && !isSelected

          return (
            <button
              key={i}
              type="button"
              ref={(el) => {
                cellRefs.current[i] = el
              }}
              className={[
                'cell',
                c % 3 === 2 && c !== 8 ? 'sud-thick-right' : '',
                r % 3 === 2 && r !== 8 ? 'sud-thick-bottom' : '',
                isGiven ? 'sud-cell--given' : 'sud-cell--entry',
                isConflict ? 'sud-cell--conflict' : isHighlight ? 'sud-cell--peer' : '',
                isSelected ? 'sud-cell--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onKeyDown={(e) => onCellKeyDown(e, i)}
              disabled={status === 'solved'}
              aria-label={v ? `Petak baris ${r + 1} kolom ${c + 1}, isi ${v}` : `Petak baris ${r + 1} kolom ${c + 1}, kosong`}
            >
              {v ? (
                <span className="sud-value">{v}</span>
              ) : notes[i].length > 0 ? (
                <span className="sud-notes">
                  {Array.from({ length: 9 }, (_, n) => (
                    <span key={n}>{notes[i].includes(n + 1) ? n + 1 : ''}</span>
                  ))}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </BoardFrame>
  )

  const panel = (
    <>
      <section className="verdict" role="status" aria-live="polite">
        <p className="verdict__label">{status === 'solved' ? 'Hasil' : 'Status'}</p>
        <p
          key={status === 'solved' ? 'solved' : difficultyKey}
          className="verdict__value verdict__value--small"
        >
          {status === 'solved' ? 'Selesai' : DIFFICULTIES[difficultyKey].label}
        </p>
        <p className="verdict__note">
          {clock(seconds)}
          {checkMsg ? ` / ${checkMsg}` : ''}
        </p>
      </section>

      <section className="block">
        <h2 className="block__title">Papan angka</h2>
        <div className="pad-grid">
          {Array.from({ length: 9 }, (_, idx) => idx + 1).map((n) => (
            <button
              key={n}
              type="button"
              className="pad-btn"
              disabled={status !== 'playing' || selected === null || givenMask[selected]}
              onClick={() => selected !== null && writeDigit(selected, n)}
            >
              {n}
              <span className="pad-btn__left">{Math.max(remainingCount[n], 0)}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="controls">
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={noteMode}
            onClick={() => setNoteMode((m) => !m)}
          >
            Catatan: {noteMode ? 'aktif' : 'mati'}
          </button>
          <button type="button" className="btn btn--sm" onClick={undo} disabled={history.length === 0}>
            Batal langkah
          </button>
        </div>
        <button type="button" className="btn" onClick={runCheck}>
          Periksa papan
        </button>
        <button type="button" className="btn btn--solid" onClick={() => setStatus('select')}>
          Papan baru
        </button>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((s) => !s)}
          >
            Suara: {soundOn ? 'aktif' : 'mati'}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={!musicMuted}
            onClick={() => setMusicMuted((m) => !m)}
          >
            Musik: {musicMuted ? 'mati' : 'aktif'}
          </button>
          <SoundBar analyser={analyser} muted={musicMuted} onToggle={() => setMusicMuted((m) => !m)} />
        </div>
      </div>
    </>
  )

  return (
    <>
      <GameLayout board={boardEl} panel={panel} />
      <WelcomeDialog
        ref={welcomeRef}
        name="Sudoku"
        blurb="Isi papan sembilan kali sembilan, dibangkitkan baru dengan jawaban tunggal."
        musicMuted={musicMuted}
        onToggleMusic={() => setMusicMuted((m) => !m)}
      />
    </>
  )
}
