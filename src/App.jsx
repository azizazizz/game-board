import { useEffect, useRef, useState } from 'react'
import { GAMES, findGame } from './games/registry'
import RulesDialog from './components/RulesDialog'

function GameIndex({ onOpen }) {
  return (
    <div className="index">
      <p className="index__lead">
        Enam papan permainan yang berbagi satu kerangka: papan di kiri, panel catatan di kanan,
        dicetak di atas kertas yang sama. Pilih satu daftar di bawah.
      </p>

      <ol className="index__list">
        {GAMES.map((game) => (
          <li key={game.id}>
            <button type="button" className="index__link" onClick={() => onOpen(game.id)}>
              <span className="index__no">{game.no}</span>
              <span className="index__text">
                <span className="index__name">{game.name}</span>
                <span className="index__blurb">{game.blurb}</span>
              </span>
              <span className="index__players">{game.players}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  const rulesRef = useRef(null)

  // sinkronkan dengan hash agar tombol kembali peramban dan muat ulang tetap bekerja.
  // pembacaan location dilakukan di efek, bukan saat render.
  useEffect(() => {
    function readHash() {
      const id = window.location.hash.replace('#', '')
      setActiveId(findGame(id) ? id : null)
    }

    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  function open(id) {
    rulesRef.current?.close()
    window.location.hash = id ?? ''
    setActiveId(id)
  }

  const active = activeId ? findGame(activeId) : null
  const Active = active?.Component ?? null

  return (
    <div className="page">
      <article className="sheet">
        <header className="masthead">
          <h1 className="masthead__title">Game Board</h1>
          <p className="masthead__meta">
            {GAMES.length} papan permainan / {active ? active.name : 'Daftar isi'}
          </p>
        </header>

        {active ? (
          <nav className="sections" aria-label="Navigasi permainan">
            <button type="button" className="section-back" onClick={() => open(null)}>
              Kembali ke daftar isi
            </button>
            <button
              type="button"
              className="section-info"
              onClick={() => rulesRef.current?.showModal()}
            >
              Aturan main
            </button>
          </nav>
        ) : null}

        {Active ? <Active /> : <GameIndex onOpen={open} />}

        <footer className="colophon">© 2026 Nur Aziz Raihan</footer>
      </article>

      {active ? <RulesDialog ref={rulesRef} title={active.name} rules={active.rules} /> : null}
    </div>
  )
}
