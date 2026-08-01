CARA PAKAI
==========
1. Extract semua isi zip ke satu folder (jangan dipisah-pisah).
2. Buka index.html di browser buat coba dulu sebelum dikirim ke Frank.
3. Kirim SELURUH FOLDER ke Frank (atau upload ke hosting gratis seperti
   Netlify Drop / GitHub Pages), bukan cuma file index.html-nya saja —
   soalnya dia butuh image.gif dan sound.mp3 yang ada di folder yang sama.

ISI FOLDER
==========
- index.html   -> halaman kuis "Tes IQ" + jumpscare
- image.gif    -> gambar tengkorak animasi yang muncul pas jumpscare
- image.png    -> versi gambar statis (kalau mau ganti gif jadi foto/gif sendiri)
- sound.mp3    -> suara jeritan yang otomatis diputar pas jumpscare

GANTI GAMBAR / SUARA SENDIRI
=============================
Mau pakai gambar atau suara sendiri? Gampang:
1. Siapkan file gambar (boleh .png atau .gif) dan file suara (.mp3).
2. Beri nama file itu PERSIS "image.gif" (atau "image.png") dan "sound.mp3",
   lalu timpa (replace) file yang ada di folder ini.
3. Kalau kamu pakai nama file "image.png" (bukan .gif), buka index.html
   dengan text editor, cari baris:
      <img src="image.gif" alt="">
   ganti jadi:
      <img src="image.png" alt="">
