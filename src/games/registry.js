import ChessGame from './chess/Chess'
import ConnectFour from './connectfour/ConnectFour'
import Minesweeper from './minesweeper/Minesweeper'
import Othello from './othello/Othello'
import Sudoku from './sudoku/Sudoku'
import TicTacToe from './tictactoe/TicTacToe'

// satu sumber untuk daftar isi dan bilah bagian
export const GAMES = [
  {
    id: 'tictactoe',
    no: '01',
    name: 'Tic Tac Toe',
    blurb: 'Tiga berjajar di papan tiga kali tiga, dengan lembar langkah yang bisa diputar ulang.',
    players: 'Dua pemain',
    Component: TicTacToe,
    rules: [
      'Dua pemain bergantian menandai petak kosong dengan X atau O pada papan tiga kali tiga. X selalu bermain lebih dulu.',
      'Pemain pertama yang berhasil menyusun tiga tandanya berjajar lurus — mendatar, menurun, atau menyilang — memenangkan ronde. Jika seluruh sembilan petak terisi tanpa ada yang menang, ronde berakhir seri.',
      'Klik salah satu baris pada lembar langkah untuk memutar ulang posisi sebelumnya. Bermain dari posisi lama akan menghapus langkah-langkah sesudahnya.',
    ],
  },
  {
    id: 'connectfour',
    no: '02',
    name: 'Connect Four',
    blurb: 'Empat cakram berjajar di papan tujuh kali enam, lawan manusia atau bot.',
    players: 'Dua pemain / bot',
    Component: ConnectFour,
    rules: [
      'Dua pemain bergantian menjatuhkan cakram ke salah satu dari tujuh kolom. Cakram selalu jatuh ke petak kosong paling bawah pada kolom yang dipilih.',
      'Pemain pertama yang menyusun empat cakram miliknya berjajar — mendatar, menurun, atau menyilang — memenangkan papan. Papan penuh tanpa susunan empat dinyatakan seri.',
      'Warna Biru dapat dimainkan oleh bot yang mencari langkah terbaik beberapa langkah ke depan, atau dialihkan ke pemain manusia lewat tombol di panel.',
    ],
  },
  {
    id: 'othello',
    no: '03',
    name: 'Othello',
    blurb: 'Kuasai sudut dan balikkan cakram lawan di papan delapan kali delapan.',
    players: 'Dua pemain / bot',
    Component: Othello,
    rules: [
      'Permainan dimulai dengan empat cakram di tengah papan, dua milik Hitam dan dua milik Putih, saling menyilang. Hitam bermain lebih dulu.',
      'Setiap langkah harus mengapit satu deret cakram lawan di antara cakram yang baru diletakkan dan cakram sendiri yang sudah ada, pada satu arah lurus. Seluruh cakram lawan yang terapit ikut berbalik warna.',
      'Jika seorang pemain tidak memiliki langkah legal, gilirannya dilewati secara otomatis. Papan berakhir ketika kedua pemain sama-sama tidak punya langkah; pemenang ditentukan dari jumlah cakram terbanyak.',
    ],
  },
  {
    id: 'minesweeper',
    no: '04',
    name: 'Minesweeper',
    blurb: 'Buka petak aman dan tandai ranjau, dari papan Pemula sampai Mahir.',
    players: 'Satu pemain',
    Component: Minesweeper,
    rules: [
      'Papan berisi sejumlah ranjau tersembunyi di antara petak-petak kosong. Angka pada petak yang terbuka menunjukkan jumlah ranjau di kedelapan petak di sekelilingnya.',
      'Klik kiri membuka petak, klik kanan atau tombol F menandai petak dengan bendera. Klik pertama selalu aman dan tidak akan pernah mengenai ranjau.',
      'Klik pada angka yang jumlah benderanya di sekeliling sudah sesuai akan membuka sisa tetangganya sekaligus. Permainan menang ketika seluruh petak aman terbuka, dan kalah ketika sebuah ranjau terbuka.',
    ],
  },
  {
    id: 'sudoku',
    no: '05',
    name: 'Sudoku',
    blurb: 'Isi papan sembilan kali sembilan, dibangkitkan baru dengan jawaban tunggal.',
    players: 'Satu pemain',
    Component: Sudoku,
    rules: [
      'Isi setiap petak kosong dengan angka satu sampai sembilan, sehingga setiap baris, setiap kolom, dan setiap kotak tiga kali tiga memuat kesembilan angka tanpa pengulangan.',
      'Setiap papan dibangkitkan baru dengan tepat satu jawaban yang mungkin, pada tiga tingkat kesulitan berdasarkan jumlah angka awal yang diberikan.',
      'Mode catatan memungkinkan menuliskan beberapa kandidat kecil dalam satu petak. Tombol periksa memeriksa bentrokan tanpa mengungkap jawaban, dan tombol batal langkah mengembalikan perubahan terakhir.',
    ],
  },
  {
    id: 'chess',
    no: '06',
    name: 'Catur',
    blurb: 'Aturan lengkap lewat chess.js: rokade, en passant, promosi, skak, dan skakmat.',
    players: 'Dua pemain',
    Component: ChessGame,
    rules: [
      'Aturan mengikuti catur standar: setiap jenis bidak bergerak menurut caranya masing-masing, dan tujuannya adalah menyekakmat raja lawan hingga tidak punya langkah legal untuk lolos dari ancaman.',
      'Rokade, en passant, dan promosi bidak semuanya berlaku. Klik bidak untuk melihat langkah legalnya, lalu klik petak tujuan; petak bercincin menandai langkah kosong, dan petak bergaris menandai tangkapan.',
      'Permainan bisa berakhir seri karena posisi buntu, materi tidak cukup untuk menang, atau pengulangan posisi. Lembar langkah mencatat notasi setiap langkah dan bisa diklik untuk memutar ulang posisi.',
    ],
  },
]

export function findGame(id) {
  return GAMES.find((g) => g.id === id) ?? null
}
