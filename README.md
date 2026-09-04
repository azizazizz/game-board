# Game Board

Enam papan permainan klasik dalam satu aplikasi React: Tic Tac Toe, Connect Four,
Othello, Minesweeper, Sudoku, dan Catur. Semua dibungkus dalam satu tampilan
bergaya kertas cetak — kertas hangat, tinta gelap, tanpa gradien atau bayangan.

## Tech stack

- **React 19** — seluruh UI adalah komponen fungsional dengan hooks (`useState`,
  `useMemo`, `useCallback`, `useEffect`, `useRef`), tanpa state management
  eksternal (Redux, Zustand, dll).
- **Vite 8** — dev server dan bundler, dengan `@vitejs/plugin-react`.
- **Tailwind CSS 4** — lewat plugin `@tailwindcss/vite` (tanpa `tailwind.config.js`
  terpisah). Token desain (warna kertas/tinta, font) didefinisikan sekali lewat
  `@theme` di `src/index.css`; pola yang berulang di keenam game (sel papan,
  tombol, panel skor) dijadikan kelas komponen lewat `@apply` supaya tidak
  menduplikasi utility yang sama di banyak berkas.
- **chess.js 1.4.0** — satu-satunya dependency non-framework, menangani seluruh
  aturan catur (langkah legal, rokade, en passant, promosi, skak, skakmat, seri).
- **Web Audio API** — efek suara disintesis langsung di browser (`AudioContext`),
  tanpa berkas audio.
- **ESLint 10** — dikonfigurasi lewat `eslint.config.js`, dengan
  `eslint-plugin-react-hooks` dan `eslint-plugin-react-refresh`.
- **pnpm** — package manager (lihat `pnpm-lock.yaml`).

Tidak ada backend, database, atau API eksternal. Aplikasi ini 100% berjalan
di sisi klien; setiap permainan menyimpan state di memori komponen (menutup
tab akan mengulang dari awal).

## Struktur proyek

```
src/
├─ App.jsx                 # daftar isi, nav, dan dialog aturan main
├─ index.css                # satu titik masuk Tailwind: @theme token desain,
│                             @layer components (kelas bersama & per-game lewat
│                             @apply), plus keyframe animasi dan CSS SVG bespoke
├─ components/              # potongan UI yang dipakai lintas game
│  ├─ BoardFrame.jsx         (bingkai papan + label baris/kolom + getar salah langkah)
│  ├─ GameLayout.jsx         (papan di kiri, panel catatan di kanan)
│  ├─ Marks.jsx              (tanda X/O, cakram, cincin langkah legal)
│  ├─ Scoresheet.jsx         (lembar langkah yang bisa diputar ulang)
│  └─ RulesDialog.jsx        (dialog "Aturan main" per game)
├─ lib/
│  ├─ random.js              (PRNG berbenih untuk papan acak yang bisa diulang)
│  ├─ useSound.js            (efek suara sintesis WebAudio)
│  ├─ useShake.js            (getar sesaat untuk langkah tidak sah)
│  ├─ useTimer.js            (pencatat waktu untuk Minesweeper/Sudoku)
│  └─ format.js              (notasi papan, padding angka, label file/rank)
└─ games/
   ├─ registry.js            # satu sumber daftar game + metadata + aturan
   ├─ tictactoe/
   ├─ connectfour/           (+ bot minimax dengan alfa-beta)
   ├─ othello/                (+ bot heuristik bobot-posisi)
   ├─ minesweeper/
   ├─ sudoku/                 (pembangkit papan dengan jawaban tunggal)
   └─ chess/                  (dibungkus di atas chess.js)
```

Tidak ada lagi berkas `.css` per game — semua gaya, termasuk yang khusus
satu permainan, hidup di `src/index.css` supaya Tailwind memprosesnya lewat
satu titik masuk yang sama (menghindari CSS yang diproses berbeda-beda
antar berkas).

### Animasi

Setiap sentuhan gerak dipicu oleh **peristiwa permainan** (taruh bidak,
tangkap, menang, salah langkah), bukan oleh `:hover` — hover hanya mengganti
warna secara instan, tanpa transisi. Tekan tombol/papan (`:active`) memberi
umpan balik skala kecil, dan `useShake` menggetarkan papan saat sebuah aksi
ditolak (klik petak ilegal, mengetik ke petak kunci Sudoku, dll). Semua
animasi tunduk pada `prefers-reduced-motion`.

## Instalasi

Prasyarat: [Node.js](https://nodejs.org/) 18 atau lebih baru, dan
[pnpm](https://pnpm.io/) (`npm install -g pnpm` jika belum ada).

```bash
git clone <url-repo-ini>
cd 3-tic-tac-toe
pnpm install
```

## Menjalankan

```bash
pnpm dev
```

Buka alamat yang ditampilkan di terminal (biasanya `http://localhost:5173`).
Vite akan memuat ulang otomatis setiap kali berkas disimpan.

## Skrip lain

```bash
pnpm lint       # jalankan ESLint
pnpm build      # build produksi ke folder dist/
pnpm preview    # jalankan hasil build secara lokal untuk diperiksa
```

## Cara bermain

Buka aplikasi, pilih salah satu dari enam permainan di daftar isi. Setiap
permainan punya:

- Tombol **Kembali ke daftar isi** dan **Aturan main** di bilah nav atas.
- Panel di sisi kanan berisi status permainan, skor, dan kendali (papan
  baru, hapus skor, suara).
- Lembar langkah / riwayat yang bisa diklik untuk memutar ulang posisi
  sebelumnya (Tic Tac Toe, Connect Four, Othello, Catur).

Ringkasan tiap permainan ada di dialog "Aturan main" masing-masing, atau
lihat `rules` di [`src/games/registry.js`](src/games/registry.js).

## Catatan pengembangan

Proyek ini tidak memakai TypeScript maupun test runner otomatis — logika
inti tiap permainan (deteksi menang, bot, pembangkit papan) diverifikasi
manual dengan skrip Node terpisah selama pengembangan. Jika menambah game
baru, ikuti pola yang sudah ada: `logic.js` murni tanpa React, komponen
`GameName.jsx` yang memanggilnya, dan didaftarkan di `src/games/registry.js`.
