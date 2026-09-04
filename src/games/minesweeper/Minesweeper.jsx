import { useEffect, useRef, useState } from 'react'
import GameLayout from '../../components/GameLayout'
import SoundBar from '../../components/SoundBar'
import WelcomeDialog from '../../components/WelcomeDialog'
import { useSound } from '../../lib/useSound'
import { useGameMusic } from '../../lib/useGameMusic'
import { MUSIC_THEMES } from '../../lib/musicThemes'
import { useTimer } from '../../lib/useTimer'
import { newSeed } from '../../lib/random'
import { clock, pad } from '../../lib/format'
import {
  DIFFICULTIES,
  checkWin,
  chord,
  generateLayout,
  revealAllMines,
  revealCascade,
  toggleFlag,
} from './logic'

function MineIcon() {
  return (
    <svg className="ms-icon ms-icon--mine" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="50" y1="10" x2="50" y2="90" />
      <line x1="10" y1="50" x2="90" y2="50" />
      <line x1="22" y1="22" x2="78" y2="78" />
      <line x1="78" y1="22" x2="22" y2="78" />
      <circle cx="50" cy="50" r="26" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg className="ms-icon ms-icon--flag" viewBox="0 0 100 100" aria-hidden="true">
      <line x1="30" y1="14" x2="30" y2="88" />
      <polygon points="34,16 82,30 34,44" />
    </svg>
  )
}

function emptyArray(n) {
  return Array(n).fill(false)
}

export default function Minesweeper() {
  const [difficultyKey, setDifficultyKey] = useState('beginner')
  const { rows, cols, mines, label } = DIFFICULTIES[difficultyKey]

  const [layout, setLayout] = useState(null)
  const [revealed, setRevealed] = useState(() => emptyArray(rows * cols))
  const [flagged, setFlagged] = useState(() => emptyArray(rows * cols))
  const [status, setStatus] = useState('idle')
  const [lastHit, setLastHit] = useState(-1)
  const [soundOn, setSoundOn] = useState(true)

  const play = useSound(soundOn)
  const [musicMuted, setMusicMuted, analyser] = useGameMusic(MUSIC_THEMES.minesweeper)
  const [seconds, resetTimer] = useTimer(status === 'playing')
  const longPress = useRef({ id: null, fired: false })
  const welcomeRef = useRef(null)

  useEffect(() => {
    welcomeRef.current?.showModal()
  }, [])

  const flaggedCount = flagged.filter(Boolean).length
  const remaining = mines - flaggedCount
  const over = status === 'won' || status === 'lost'

  function resetBoard(key = difficultyKey) {
    const dims = DIFFICULTIES[key]
    setDifficultyKey(key)
    setLayout(null)
    setRevealed(emptyArray(dims.rows * dims.cols))
    setFlagged(emptyArray(dims.rows * dims.cols))
    setStatus('idle')
    setLastHit(-1)
    resetTimer()
  }

  function loseAt(i, layoutForBoard, revealedBoard) {
    setRevealed(revealAllMines(layoutForBoard, revealedBoard))
    setStatus('lost')
    setLastHit(i)
    play('boom')
  }

  function finishIfWon(layoutForBoard, revealedBoard) {
    if (checkWin(layoutForBoard, revealedBoard)) {
      setRevealed(revealAllMines(layoutForBoard, revealedBoard))
      setStatus('won')
      play('solved')
      return true
    }
    play('reveal')
    return false
  }

  function reveal(i) {
    if (over || flagged[i]) return

    if (revealed[i]) {
      if (!layout) return
      const result = chord(layout, revealed, flagged, i)
      if (!result) return

      if (result.hitMine) loseAt(i, layout, result.revealed)
      else {
        setRevealed(result.revealed)
        finishIfWon(layout, result.revealed)
      }
      return
    }

    if (!layout) {
      // klik pertama: bangkitkan ranjau sekarang, dengan petak ini dijamin aman
      const seed = newSeed()
      const nextLayout = generateLayout(rows, cols, mines, seed, i)
      const nextRevealed = revealCascade(nextLayout, emptyArray(rows * cols), flagged, i)
      setLayout(nextLayout)
      setStatus('playing')
      setRevealed(nextRevealed)
      play('reveal')
      return
    }

    if (layout.mines[i]) {
      const withHit = revealCascade(layout, revealed, flagged, i)
      loseAt(i, layout, withHit)
      return
    }

    const nextRevealed = revealCascade(layout, revealed, flagged, i)
    setRevealed(nextRevealed)
    finishIfWon(layout, nextRevealed)
  }

  function flag(i) {
    if (over || revealed[i]) return
    setFlagged(toggleFlag(flagged, revealed, i))
    play('flag')
  }

  function onCellContextMenu(e, i) {
    e.preventDefault()
    flag(i)
  }

  function onCellKeyDown(e, i) {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      flag(i)
    }
  }

  function onTouchStart(i) {
    longPress.current.fired = false
    longPress.current.id = setTimeout(() => {
      longPress.current.fired = true
      flag(i)
    }, 450)
  }

  function onTouchEnd() {
    clearTimeout(longPress.current.id)
  }

  function onCellClick(i) {
    if (longPress.current.fired) {
      longPress.current.fired = false
      return
    }
    reveal(i)
  }

  const verdict =
    status === 'lost'
      ? { label: 'Hasil', value: 'Meledak' }
      : status === 'won'
        ? { label: 'Hasil', value: 'Selesai' }
        : { label: 'Status', value: status === 'playing' ? 'Berjalan' : 'Menunggu' }

  const boardEl = (
    <div className="ms-scroll">
      <div
        className="ms-grid"
        style={{ '--ms-cols': cols, '--ms-rows': rows }}
        role="group"
        aria-label="Papan sapu ranjau"
      >
        {Array.from({ length: rows * cols }, (_, i) => {
          const isRevealed = revealed[i]
          const isFlagged = flagged[i]
          const isMine = layout?.mines[i]
          const count = layout?.counts[i] ?? 0
          const misflag = status === 'lost' && isFlagged && layout && !isMine

          let content = null
          if (isFlagged && !isRevealed) content = <FlagIcon />
          else if (isRevealed && isMine) content = <MineIcon />
          else if (isRevealed && count > 0) content = <span className={`ms-num-${count}`}>{count}</span>

          if (misflag) content = <span className="ms-cell--misflag">&times;</span>

          return (
            <button
              key={i}
              type="button"
              className={[
                'ms-cell',
                isRevealed ? 'ms-cell--revealed' : 'ms-cell--hidden',
                isRevealed && isMine ? 'ms-cell--mine' : '',
                lastHit === i ? 'ms-cell--hit' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={over}
              onClick={() => onCellClick(i)}
              onContextMenu={(e) => onCellContextMenu(e, i)}
              onKeyDown={(e) => onCellKeyDown(e, i)}
              onTouchStart={() => onTouchStart(i)}
              onTouchEnd={onTouchEnd}
              aria-label={
                isFlagged
                  ? `Petak ${i + 1}, ditandai bendera`
                  : isRevealed
                    ? isMine
                      ? `Petak ${i + 1}, ranjau`
                      : `Petak ${i + 1}, ${count} ranjau di sekitar`
                    : `Petak ${i + 1}, tersembunyi`
              }
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )

  const panel = (
    <>
      <section className="verdict" role="status" aria-live="polite">
        <p className="verdict__label">{verdict.label}</p>
        <p key={`${verdict.label}-${verdict.value}`} className="verdict__value verdict__value--small">
          {verdict.value}
        </p>
        <p className="verdict__note">{label}</p>
      </section>

      <section className="block">
        <h2 className="block__title">Papan</h2>
        <dl className="ledger">
          <div className="ledger__row">
            <dt>Ranjau tersisa</dt>
            <dd>{pad(Math.max(remaining, 0))}</dd>
          </div>
          <div className="ledger__row">
            <dt>Waktu</dt>
            <dd>{clock(seconds)}</dd>
          </div>
        </dl>
      </section>

      <section className="block">
        <h2 className="block__title">Tingkat kesulitan</h2>
        <div className="diff-row">
          {Object.entries(DIFFICULTIES).map(([key, d]) => (
            <button
              key={key}
              type="button"
              className={`diff-btn${key === difficultyKey ? ' diff-btn--current' : ''}`}
              onClick={() => resetBoard(key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="verdict__note">
          Klik kiri membuka, klik kanan menandai, tombol F menandai petak terpilih.
        </p>
      </section>

      <div className="controls">
        <button type="button" className="btn btn--solid" onClick={() => resetBoard()}>
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
        name="Minesweeper"
        blurb="Buka petak aman dan tandai ranjau, dari papan Pemula sampai Mahir."
        musicMuted={musicMuted}
        onToggleMusic={() => setMusicMuted((m) => !m)}
      />
    </>
  )
}
