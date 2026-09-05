import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons'
import { GAMES, findGame } from './games/registry'
import RulesDialog from './components/RulesDialog'
import { useMenuMusic } from './lib/useMenuMusic'

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/azizazizz', icon: faGithub },
  { label: 'Instagram', href: 'https://www.instagram.com/azizraihan_/', icon: faInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/nur.azizraihan.5', icon: faFacebook },
]

// footer
function SiteFooter() {
  return (
    <footer className="footer">
      <p className="footer__copyright">© 2026 Nur Aziz Raihan</p>

      <div className="footer__brand">
        <p className="footer__brand-title">Game Board</p>
        <p className="footer__brand-desc">
          Enam papan permainan klasik dalam satu kerangka kertas-dan-tinta yang sama.
        </p>
      </div>

      <ul className="footer__social">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.label}>
            <a
              className="footer__social-link"
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
            >
              <FontAwesomeIcon icon={link.icon} className="footer__social-icon" />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

// slot cuplikan layar tiap game
function HomeShot({ id, name }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="home-card__shot">
      {failed ? (
        <span className="home-card__placeholder">Screenshot {name}</span>
      ) : (
        <img
          src={`/screenshots/${id}.png`}
          alt={`Cuplikan layar ${name}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

// beranda
function Home({ onEnterIndex }) {
  return (
    <div className="flat-page">
      <div className="home-page__body">
        <div className="home-page__left">
          <section className="home__brand" aria-label="Tentang Game Board">
            <p className="home__brand-eyebrow">Selamat datang di</p>
            <h1 className="home__brand-title">Game Board</h1>
          </section>

          <button type="button" className="btn btn--solid home__enter" onClick={onEnterIndex}>
            Masuk ke game
          </button>

          <article className="home__article">
            <p>
              Enam papan permainan klasik, yaitu Tic Tac Toe, Connect Four, Othello, Minesweeper,
              Sudoku, dan Catur, dibungkus satu kerangka kertas-dan-tinta yang sama. Setiap
              permainan punya musik latarnya sendiri, bot lawan untuk yang membutuhkan, dan
              lembar langkah yang bisa diputar ulang.
            </p>
          </article>
        </div>

        <aside className="home-page__aside" aria-label="Cuplikan layar tiap permainan">
          <h2 className="home__aside-title">Cuplikan layar</h2>
          <div className="home__grid">
            {GAMES.map((game) => (
              <div key={game.id} className="home-card">
                <HomeShot id={game.id} name={game.name} />
                <p className="home-card__name">
                  {game.no} · {game.name}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <SiteFooter />
    </div>
  )
}

// daftar isi
function GameIndex({ onOpen, onGoHome, musicMuted, onToggleMusic }) {
  return (
    <div className="flat-page">
      <div className="index">
        <button type="button" className="index__back" onClick={onGoHome}>
          Kembali ke beranda
        </button>

        <div className="index__head">
          <p className="index__lead">
            {/* susunan papan/panel berbeda di layar sempit */}
            <span className="max-[860px]:hidden">
              Enam papan permainan yang berbagi satu kerangka: papan di kiri, panel catatan di
              kanan, dicetak di atas kertas yang sama. Pilih satu daftar di bawah.
            </span>
            <span className="hidden max-[860px]:inline">
              Enam papan permainan yang berbagi satu kerangka: papan di atas, panel catatan di
              bawah, dicetak di atas kertas yang sama. Pilih satu daftar di bawah.
            </span>
          </p>
          <button
            type="button"
            className="btn shrink-0"
            aria-pressed={!musicMuted}
            onClick={onToggleMusic}
          >
            Musik: {musicMuted ? 'mati' : 'aktif'}
          </button>
        </div>

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

      <SiteFooter />
    </div>
  )
}

export default function App() {
  const [activeId, setActiveId] = useState(null)
  // lewati beranda kalau tautan sudah menunjuk langsung ke sebuah game
  const [showHome, setShowHome] = useState(() => {
    const id = window.location.hash.replace('#', '')
    return !findGame(id)
  })
  const rulesRef = useRef(null)

  // sinkronkan dengan hash agar tombol kembali peramban dan muat ulang tetap bekerja.
  // pembacaan location dilakukan di efek, bukan saat render.
  useEffect(() => {
    function readHash() {
      const id = window.location.hash.replace('#', '')
      const game = findGame(id)
      setActiveId(game ? id : null)
      if (game) setShowHome(false)
    }

    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  function open(id) {
    rulesRef.current?.close()
    window.location.hash = id ?? ''
    setActiveId(id)
    setShowHome(false)
  }

  // kembali sampai ke beranda dari mana pun
  function goHome() {
    rulesRef.current?.close()
    window.location.hash = ''
    setActiveId(null)
    setShowHome(true)
  }

  const active = activeId ? findGame(activeId) : null
  const Active = active?.Component ?? null
  const [musicMuted, setMusicMuted] = useMenuMusic(!active)

  // beranda, daftar game, dan layar game semuanya halaman penuh yang
  // senada (.flat-page), tanpa kartu terbungkus terpisah.
  if (showHome) {
    return <Home onEnterIndex={() => setShowHome(false)} />
  }

  if (!active) {
    return (
      <GameIndex
        onOpen={open}
        onGoHome={goHome}
        musicMuted={musicMuted}
        onToggleMusic={() => setMusicMuted((m) => !m)}
      />
    )
  }

  return (
    <div className="flat-page">
      <header className="masthead">
        <h1 className="masthead__title">
          <button type="button" className="masthead__title-btn" onClick={goHome}>
            {active.name}
          </button>
        </h1>
      </header>

      <nav className="sections" aria-label="Navigasi permainan">
        <button type="button" className="section-back" onClick={() => open(null)}>
          Kembali ke daftar game
        </button>
        <button type="button" className="section-info" onClick={() => rulesRef.current?.showModal()}>
          Aturan main
        </button>
      </nav>

      <Active />

      <SiteFooter />

      <RulesDialog ref={rulesRef} title={active.name} rules={active.rules} />
    </div>
  )
}
