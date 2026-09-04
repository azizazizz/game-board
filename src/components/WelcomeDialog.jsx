import { forwardRef } from 'react'

// dialog native <dialog>, tampil otomatis setiap kali sebuah game dibuka
// (dipicu dari efek mount di masing-masing game, bukan saat render). Berisi
// sapaan singkat dan kontrol musik yang eksplisit, bukan cuma lewat soundbar.
const WelcomeDialog = forwardRef(function WelcomeDialog(
  { name, blurb, musicMuted, onToggleMusic },
  ref,
) {
  function onBackdropClick(e) {
    if (e.target === ref?.current) ref.current.close()
  }

  return (
    <dialog
      ref={ref}
      className="rules-dialog"
      onClick={onBackdropClick}
      aria-labelledby="welcome-title"
    >
      <div className="rules-dialog__head">
        <h2 id="welcome-title" className="rules-dialog__title">
          Selamat datang di {name}
        </h2>
      </div>
      <div className="rules-dialog__body">
        <p>{blurb}</p>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn--sm"
            aria-pressed={!musicMuted}
            onClick={onToggleMusic}
          >
            Musik: {musicMuted ? 'mati' : 'aktif'}
          </button>
          <button
            type="button"
            className="btn btn--solid btn--sm"
            onClick={() => ref?.current?.close()}
          >
            Mulai bermain
          </button>
        </div>
      </div>
    </dialog>
  )
})

export default WelcomeDialog
