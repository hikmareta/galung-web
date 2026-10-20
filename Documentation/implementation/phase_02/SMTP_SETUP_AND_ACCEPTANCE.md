# Email identitas — panduan penyiapan dan penerimaan

**Status:** rencana konfigurasi. Belum ada penyedia, domain pengirim, atau kredensial resmi yang disetujui. `IDENTITY_ENABLED=false` tetap berlaku sampai uji staging dan gerbang Fase 02 selesai. Panduan ini hanya untuk email verifikasi akun dan pemulihan kata sandi; pemberitahuan transaksi lain memiliki fase tersendiri.

## Keputusan yang perlu diberikan pemilik layanan

1. Tentukan domain/subdomain pengirim milik organisasi, misalnya subdomain transaksional yang benar-benar dikuasai, dan satu alamat `From` yang dapat menerima balasan atau memiliki jalur dukungan jelas. Jangan gunakan alamat contoh sebagai nilai produksi.
2. Pilih penyedia SMTP yang menawarkan TLS, kredensial khusus aplikasi, log status pengiriman tanpa menyimpan token dalam log, pembatasan akses, kebijakan lokasi pemrosesan data, serta mekanisme bounce/complaint. Pengadaan, biaya, DPA, dan lokasi pemrosesan perlu ditinjau sebelum keputusan.
3. Tugaskan pemilik domain untuk menambahkan SPF, DKIM, dan DMARC sesuai instruksi penyedia; verifikasi status DNS pada panel penyedia. Gunakan DMARC secara bertahap setelah hasil pengiriman tervalidasi.
4. Simpan `SMTP_URL` dan tiga kunci identitas pada secret manager lingkungan. Berikan akses hanya kepada runtime API dan petugas operasi yang berwenang. Jangan kirim sandi SMTP di chat, commit, tiket, atau log. Buat kredensial terpisah untuk staging dan produksi, serta prosedur rotasi dan pencabutan.

## Konfigurasi aplikasi

- `SMTP_URL` adalah URL transport Nodemailer. Untuk staging/produksi, kebijakan aplikasi mensyaratkan skema `smtps://` (TLS sejak koneksi awal), misalnya **format saja** `smtps://USER:PASSWORD@SMTP_HOST:465`. Bagian pengguna/sandi harus di-*percent-encode* jika mengandung karakter khusus; nilai nyata masuk secret manager. Pastikan sertifikat dan nama host tervalidasi. Tidak ada fallback ke pengiriman tanpa TLS.
- `SMTP_FROM` harus alamat terverifikasi pada domain yang disetujui. `CUSTOMER_ORIGIN` harus origin HTTPS situs pelanggan yang benar; tautan email memakai fragmen `#token=` agar token tidak masuk request URL server. Origin admin terpisah.
- Kunci `IDENTITY_CSRF_KEY`, `IDENTITY_ENCRYPTION_KEY`, dan `IDENTITY_OUTBOX_KEY` masing-masing 32 byte acak independen dalam hex (64 karakter). Nilai berbeda di setiap lingkungan dan tidak boleh diganti tanpa rencana migrasi sesi/faktor/outbox. Tinjau backup dan akses pemulihan kunci.
- Isi versi/hash Legal hanya setelah naskah final dipublikasikan; `NEXT_PUBLIC_LEGAL_*` pada web harus menunjuk ke versi dan URL yang sama. Hash SHA-256 dihitung dari berkas final yang benar-benar diterbitkan, dengan encoding UTF-8 dan aturan normalisasi berkas yang ditetapkan. Jangan memakai hash draf.

## Uji penerimaan staging

1. Pada domain staging, buat dua akun uji tanpa data pribadi nyata. Pastikan verifikasi mengirim satu email berbahasa Indonesia/Inggris, pengirim tervalidasi, tautan membuka origin pelanggan yang benar, dan token hanya muncul dalam fragmen browser. Token harus ditolak pada penggunaan kedua atau setelah kedaluwarsa.
2. Minta pemulihan untuk alamat yang ada dan tidak ada. Respons publik keduanya sama; hanya alamat yang ada menerima email. Atur ulang kata sandi, uji token kedua kali ditolak, lalu pastikan semua sesi lama tidak berlaku.
3. Putuskan SMTP sementara. Permintaan tetap disimpan sebagai pekerjaan terenkripsi dan percobaan dikirim ulang setelah layanan pulih. Pastikan token, sandi, dan rahasia MFA tidak muncul dalam log API, SMTP, analytics, atau baris subjek.
4. Periksa header autentikasi surat pada kotak uji yang dikuasai: SPF/DKIM/DMARC sesuai kebijakan domain. Uji bounce, kegagalan permanen, alert antrean, dan prosedur dukungan bagi pelanggan yang tidak menerima email.
5. Dokumentasikan tanggal, lingkungan, ID pesan yang aman, hasil, pemilik uji, serta bukti tanpa token/kredensial. Security dan QA menyetujui hasil sebelum `IDENTITY_ENABLED=true` di lingkungan publik.

## Respons insiden dan rollback

Jika penyedia atau domain bermasalah, nonaktifkan identitas publik melalui flag, hentikan worker pengiriman, cabut kredensial SMTP terdampak, dan selidiki pekerjaan tertunda tanpa membuka plaintext token. Jangan menganggap email gagal sebagai bukti bahwa akun berhasil diverifikasi. Rotasi kunci enkripsi membutuhkan rencana migrasi data; jangan sekadar menggantinya pada runtime.
