CARA PAKAI
==========
1. Extract semua isi zip ke satu folder (jangan dipisah-pisah).
2. Buka index.html di browser buat coba dulu sebelum dikirim ke Frank.
3. Kirim SELURUH FOLDER ke Frank (atau upload ke hosting gratis seperti
   Netlify Drop / GitHub Pages), bukan cuma file index.html-nya saja —
   soalnya dia butuh image1.png - image7.png dan sound.mp3 yang ada
   di folder yang sama.

ISI FOLDER
==========
- index.html                -> halaman kuis "Tes IQ" + jumpscare
- image1.png ... image7.png -> 7 gambar (dibuat dari gambarmu sendiri
                                dengan efek shake/flash/tint) yang
                                bergantian cepat pas jumpscare muncul
- sound.mp3                 -> suara yang diputar ulang 3x pas jumpscare

GANTI GAMBAR / SUARA LAGI
===========================
1. Siapkan 7 file gambar baru (.png/.gif) dan 1 file suara (.mp3).
2. Beri nama file gambar itu PERSIS "image1.png" sampai "image7.png",
   dan file suara "sound.mp3". Timpa (replace) file yang ada di folder
   ini dengan file-file barumu.
3. Kalau jumlah gambarnya beda dari 7, buka index.html dengan text
   editor, cari baris "const scareImages = [...]" dan sesuaikan
   daftar nama filenya.

ATUR DURASI, KECEPATAN GANTI GAMBAR, & JUMLAH LOOP SUARA
==========================================================
Buka index.html dengan text editor, cari bagian ini di dalam <script>:

  const SCARE_DURATION_MS = 5000;   // lama layar jumpscare tampil (ms)
  const IMAGE_SWITCH_MS   = 90;     // ganti gambar tiap berapa ms
  const SOUND_LOOPS       = 3;      // suara diputar ulang berapa kali

Ubah angkanya sesuai selera:
- SCARE_DURATION_MS lebih besar = jumpscare tampil lebih lama
- IMAGE_SWITCH_MS lebih kecil   = gambar gonta-ganti lebih cepat
- SOUND_LOOPS lebih besar       = suara diulang lebih banyak kali
