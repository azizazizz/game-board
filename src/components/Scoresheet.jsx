import { pad } from '../lib/format'

// lembar langkah bernomor dengan dua kolom pemain, dipakai tic tac toe dan catur
export default function Scoresheet({ headers, labels, currentPly, onJump }) {
  const rows = Math.max(1, Math.ceil(labels.length / 2))

  return (
    <table className="sheet-table">
      <caption className="sr-only">Lembar langkah, klik untuk memutar ulang</caption>
      <thead>
        <tr>
          <th scope="col" className="sheet-table__num">
            #
          </th>
          <th scope="col">{headers[0]}</th>
          <th scope="col">{headers[1]}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            <th scope="row" className="sheet-table__num">
              {pad(r + 1)}
            </th>
            {[0, 1].map((side) => {
              const ply = r * 2 + side + 1
              const label = labels[ply - 1]

              return (
                <td key={side}>
                  {label ? (
                    <button
                      type="button"
                      className={`ply${ply === currentPly ? ' ply--current' : ''}`}
                      onClick={() => onJump(ply)}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className="ply ply--empty">.</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
