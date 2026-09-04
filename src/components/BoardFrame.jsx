// bingkai papan bersama: rel koordinat di tepi kiri dan bawah, lalu pelat papan.
// `shake` menggetarkan papan sesaat untuk langkah tidak sah (lihat lib/useShake).
export default function BoardFrame({
  cols,
  rows,
  files = null,
  ranks = null,
  width = 400,
  shake = false,
  children,
}) {
  const style = { '--cols': cols, '--rows': rows, '--frame-width': `${width}px` }

  return (
    <div
      className={`board-frame${ranks ? '' : ' board-frame--bare'}${shake ? ' board-shake' : ''}`}
      style={style}
    >
      {ranks ? (
        <ol className="ranks" aria-hidden="true">
          {ranks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      ) : null}

      <div className="board-plate">{children}</div>

      {files ? (
        <ol className="files" aria-hidden="true">
          {files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
