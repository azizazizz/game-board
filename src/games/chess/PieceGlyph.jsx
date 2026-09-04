// siluet bidak digambar sendiri dengan bentuk dasar, senada dengan cakram dan
// tanda di permainan lain, supaya tidak bergantung pada glif Unicode atau emoji
const SHAPES = {
  p: (
    <>
      <circle cx="50" cy="32" r="14" />
      <polygon points="34,54 66,54 74,82 26,82" />
    </>
  ),
  n: (
    <polygon points="30,82 30,58 22,52 27,38 19,30 31,20 48,16 64,23 71,36 65,47 74,54 74,82" />
  ),
  b: (
    <>
      <circle cx="50" cy="26" r="10" />
      <ellipse cx="50" cy="60" rx="20" ry="24" />
      <rect x="47" y="42" width="6" height="12" />
    </>
  ),
  r: (
    <>
      <rect x="26" y="72" width="48" height="10" />
      <rect x="30" y="38" width="40" height="34" />
      <rect x="30" y="24" width="8" height="14" />
      <rect x="46" y="24" width="8" height="14" />
      <rect x="62" y="24" width="8" height="14" />
    </>
  ),
  q: (
    <>
      <polygon points="34,50 66,50 74,82 26,82" />
      <circle cx="30" cy="38" r="6" />
      <circle cx="42" cy="32" r="6" />
      <circle cx="50" cy="28" r="6" />
      <circle cx="58" cy="32" r="6" />
      <circle cx="70" cy="38" r="6" />
    </>
  ),
  k: (
    <>
      <polygon points="34,54 66,54 74,82 26,82" />
      <rect x="47" y="14" width="6" height="22" />
      <rect x="39" y="22" width="22" height="6" />
    </>
  ),
}

export default function PieceGlyph({ type, tone }) {
  const shape = SHAPES[type]
  if (!shape) return null

  return (
    <svg className={`chess-piece chess-piece--${tone}`} viewBox="0 0 100 100" aria-hidden="true">
      {shape}
    </svg>
  )
}
