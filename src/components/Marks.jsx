// cakram dan cincin penanda, digambar SVG supaya tidak ada satu pun sudut
// membulat yang berasal dari border-radius
export function Disc({ tone, fresh = false, hollow = false }) {
  const cls = ['disc', `disc--${tone}`, fresh ? 'disc--fresh' : '', hollow ? 'disc--hollow' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <svg className={cls} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="37" />
    </svg>
  )
}

export function Ring() {
  return (
    <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" />
    </svg>
  )
}
