// tata letak dua kolom yang dipakai keenam permainan
export default function GameLayout({ board, panel }) {
  return (
    <div className="layout">
      <section className="col col--board">{board}</section>
      <aside className="col col--side">{panel}</aside>
    </div>
  )
}
