import { forwardRef } from 'react'

// dialog native <dialog>: tersembunyi sampai diminta lewat tombol, tidak
// mengganggu papan, dan bisa ditutup lewat tombol, Escape, atau klik di luar
const RulesDialog = forwardRef(function RulesDialog({ title, rules }, ref) {
  function onBackdropClick(e) {
    if (e.target === ref?.current) ref.current.close()
  }

  return (
    <dialog ref={ref} className="rules-dialog" onClick={onBackdropClick} aria-labelledby="rules-title">
      <div className="rules-dialog__head">
        <h2 id="rules-title" className="rules-dialog__title">
          Aturan main: {title}
        </h2>
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => ref?.current?.close()}
        >
          Tutup
        </button>
      </div>
      <div className="rules-dialog__body">
        {rules.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </dialog>
  )
})

export default RulesDialog
