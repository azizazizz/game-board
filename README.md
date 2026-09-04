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
├─ App.jsx                 # beranda, daftar game, nav, dan dialog aturan main
├─ index.css                # satu titik masuk Tailwind: @theme token desain,
│                             @layer components (kelas bersama & per-game lewat
│                             @apply), plus keyframe animasi dan CSS SVG bespoke
├─ components/              # potongan UI yang dipakai lintas game
│  ├─ BoardFrame.jsx         (bingkai papan + label baris/kolom + getar salah langkah)
│  ├─ GameLayout.jsx         (papan di kiri, panel catatan di kanan)
│  ├─ Marks.jsx              (tanda X/O, cakram, cincin langkah legal)
│  ├─ Scoresheet.jsx         (lembar langkah yang bisa diputar ulang)
│  ├─ RulesDialog.jsx        (dialog "Aturan main" per game)
│  ├─ WelcomeDialog.jsx      (dialog "Selamat datang" saat game dibuka)
│  └─ SoundBar.jsx           (visualizer musik yang bisa diklik untuk mute)
├─ lib/
│  ├─ random.js              (PRNG berbenih untuk papan acak yang bisa diulang)
│  ├─ useSound.js            (efek suara sintesis WebAudio)
│  ├─ useShake.js            (getar sesaat untuk langkah tidak sah)
│  ├─ useTimer.js            (pencatat waktu untuk Minesweeper/Sudoku)
│  ├─ useMenuMusic.js        (pemutar berkas musik untuk Daftar Game)
│  ├─ musicEngine.js         (step-sequencer prosedural Web Audio API)
│  ├─ musicThemes.js         (tangga nada + pola nada per game)
│  ├─ useGameMusic.js        (hook React yang membungkus musicEngine)
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

## Musik

Ada dua jalur musik yang terpisah:

- **Daftar Game** memutar satu berkas musik nyata dari
  `public/music-game-board.mp3` (format mp3, nama berkas harus persis itu),
  di-loop lewat `src/lib/useMenuMusic.js`. Musik ini berhenti total begitu
  sebuah game dibuka. Tanpa berkas ini aplikasi tetap berjalan normal, hanya
  saja tidak ada suara (percobaan pemutaran gagal secara senyap).
- **Setiap game** punya musik latarnya sendiri, dibangkitkan langsung lewat
  Web Audio API — bukan berkas audio. `src/lib/musicEngine.js` adalah
  step-sequencer dua suara (bas + melodi) dengan penjadwalan model
  "lookahead" standar; `src/lib/musicThemes.js` mendefinisikan tangga nada,
  tempo, dan pola nada yang berbeda untuk tiap permainan (ceria dan cepat
  untuk Tic Tac Toe, tegang dan jarang untuk Minesweeper, tenang untuk
  Sudoku, dst). `src/lib/useGameMusic.js` membungkusnya jadi hook React;
  musik dimulai saat komponen game tampil dan berhenti (dijeda, bukan
  ditutup — supaya aman terhadap siklus mount ganda React StrictMode di
  mode pengembangan) saat game ditinggalkan.

Setiap panel game punya **soundbar** (`src/components/SoundBar.jsx`) di
sebelah tombol "Suara" — sebuah visualizer yang benar-benar membaca data
frekuensi langsung dari `AnalyserNode` musik yang sedang berbunyi lewat
`requestAnimationFrame`, bukan animasi hias. Klik soundbar untuk
mematikan/menyalakan musik game tersebut.

Sebagian peramban memblokir audio otomatis sebelum ada interaksi pengguna;
musik akan mulai begitu pengguna mengklik atau menekan tombol apa saja di
halaman.

## Cara bermain

Membuka aplikasi menampilkan tiga lapis navigasi:

1. **Beranda** — halaman penuh tersendiri, tanpa bingkai kartu apa pun
   (lihat komponen `Home` di [`src/App.jsx`](src/App.jsx)). Tidak ada bilah
   header terpisah — nama "Game Board" cukup tampil sekali, di `<section>`
   kiri, supaya tidak ada dua judul berdempetan. Kolom kiri berisi
   `<section>` (nama) lalu tombol **"Masuk ke game"** lalu `<article>`
   (penjelasan singkat aplikasi ini); `<aside>` di kanan berisi galeri
   cuplikan layar keenam game — murni gambar, kartunya **tidak bisa
   diklik**; `footer` penuh lebar di bawah. Tombol "Masuk ke game" adalah
   satu-satunya jalan menuju Daftar Game. Taruh cuplikan layar tiap game di
   `public/screenshots/<id-game>.png` (id sama seperti di
   [`src/games/registry.js`](src/games/registry.js), mis. `tictactoe.png`,
   `chess.png`) — begitu berkasnya ada, gambar otomatis menggantikan kotak
   placeholder "SCREENSHOT ...". Beranda dilewati kalau tautan sudah
   menunjuk langsung ke sebuah game (mis. memuat ulang halaman saat berada
   di `#chess`).
2. **Daftar Game** — juga halaman penuh tanpa bingkai kartu, senada dengan
   Beranda. Satu tombol kecil berkotak **"Kembali ke beranda"** di atas
   daftar (bukan bilah nav selebar halaman) membawa balik ke Beranda.
3. **Game** — satu-satunya layar yang memakai kartu kertas bergaris tepi
   (`.page`/`.sheet`) dengan masthead dan bilah nav — sengaja dibedakan
   supaya "sedang bermain" terasa berbeda dari "sedang menjelajah". Klik
   judul **"GAME BOARD"** di masthead kapan saja untuk kembali ke Beranda;
   "Kembali ke daftar game" untuk selangkah saja. Setiap kali sebuah game
   dibuka, muncul dialog **"Selamat datang di ..."** otomatis (lihat
   `src/components/WelcomeDialog.jsx`) berisi ringkasan singkat dan tombol
   musik, sebelum pemain menekan "Mulai bermain". Musik game itu sendiri
   sudah mulai berbunyi begitu papan tampil, bukan menunggu dialog ditutup.

Di dalam sebuah game, ada:

- Tombol **Kembali ke daftar game** dan **Aturan main** di bilah nav atas.
- Panel di sisi kanan berisi status permainan, skor, dan kendali (papan
  baru, hapus skor, suara efek, dan **tombol "Musik: aktif/mati"** yang
  eksplisit di samping soundbar-nya — mematikan musik tidak harus lewat
  mengklik soundbar).
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
