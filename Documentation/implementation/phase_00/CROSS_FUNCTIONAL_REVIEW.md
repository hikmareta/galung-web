# Tinjauan Lintas Fungsi atas ADR dan Rancangan Kontrak — Phase 00

**Tanggal:** 18 Oktober 2026 (Asia/Jakarta)  
**Status:** rekomendasi teknis untuk keputusan Product Owner; bukan tanda tangan hukum, finance, security, QA, atau Desktop Lead yang sebenarnya.  
**Ruang lingkup:** ADR-01–08, `CONTRACT_DELTA_SPEC.md` D-01–D-06, manifest, PRD/business rules, UI, SQL referensi, OpenAPI, dan protokol licensing. Tidak ada aplikasi yang diuji.

## Ringkasan hasil

| Sudut tinjau | Penilaian | Alasan dan syarat sebelum kontrak dibekukan |
|---|---|---|
| **Product** | Setuju pada arah, bersyarat | DEC-001–006 tetap utuh; alur pembayaran dan penerbitan lisensi terpisah. `entitlement_ready_at` kini didefinisikan sebelum aktivasi perangkat sehingga pelanggan tidak kehilangan hari berbayar karena belum memasang aplikasi. Fitur Basic/Pro, harga, batas perangkat/sesi, kompensasi keterlambatan penerbitan dan perilaku suspend/refund tetap TBD (PRD §§2–3,8; ADR-04/06). |
| **Finance** | Setuju pada kontrol, bersyarat | Bukti transfer bukan dana masuk; kredit bank harus diverifikasi independen dan dipakai paling banyak sekali untuk persetujuan biasa. Selisih kurs/biaya tetap exception. Prinsip perubahan rekening oleh dua orang berbeda dengan MFA telah disetujui Product Owner (ODL-002); skema peran, mata uang, biaya, underpayment, reversal dan SOP masih perlu keputusan Finance (Business Rules §§3,9; ADR-02/03; D-02). |
| **Legal/privasi** | Setuju pada arah pencatatan, bersyarat | D-01 kini memisahkan penerimaan syarat, pemberitahuan privasi, dan persetujuan pemasaran; menyimpan versi serta hash naskah. Tidak ada tarif pajak, masa retensi, dasar pemrosesan data, aturan refund atau identitas hukum yang diada-adakan. Persetujuan legal final harus dilakukan pada teks kebijakan dan proses sebenarnya sebelum checkout aktif (PRD §3.3, FR-02.06/04.05/10.04). |
| **Security** | Setuju pada arsitektur kontrol, bersyarat | ADR-01/05 mengarah pada MFA, CSRF, RBAC, kepemilikan objek, klaim sekali pakai, PoP perangkat, rotasi kredensial dan JWS dengan key allowlist. D-04 telah diperbaiki: `jti` dicatat per penerbitan token, challenge terikat ke kunci/tujuan, dan retry rotasi memerlukan cache respons terenkripsi berbatas waktu. Pemilihan penyedia identitas, custody signer, canonical request bytes, batas replay dan tes ancaman masih wajib sebelum implementasi (licensing §§3–9; threat model). |
| **Desktop** | Setuju pada urutan alur, bersyarat | Penerbitan lisensi menghasilkan revisi otorisasi dan artefak penerbitan yang ditandatangani; setelah itu pelanggan dapat mengaktivasi perangkat dan menerima JWS offline terikat perangkat. Ini menghindari lingkaran ketergantungan antara `entitlement_ready_at` dan aktivasi. Algoritme PoP perangkat, Windows minimum, penyimpanan kunci, aturan rollback jam, format artefak penerbitan dan kompatibilitas klien masih harus diuji pada Windows nyata (ADR-04–06; D-03/04). |

## Perbaikan hasil tinjauan ini

1. **Urutan lisensi:** ADR-06 dan D-03 kini membedakan kesiapan lisensi dari aktivasi perangkat. Kesiapan tidak menunggu JWS offline perangkat; PRD tetap meminta artefak penerbitan bertanda tangan. Format artefak tersebut perlu dibekukan bersama Desktop Lead.
2. **Riwayat token:** ADR-04 dan D-04 memindahkan `jti` dari revisi lisensi ke `license_token_issuances`, karena satu revisi dapat menghasilkan banyak token perangkat/refresh.
3. **Rekening bank:** ADR-03/D-02 mengikat persetujuan dua aktor MFA pada *proposal digest/version* yang sama dan memublikasikannya secara atomik; perubahan langsung dilarang.
4. **Privasi:** D-01 membedakan terms acceptance, privacy notice acknowledgment dan optional marketing consent. Versi/hash naskah serta masa retensi perlu tinjauan Legal.
5. **Replay dan pemulihan:** D-04 mengikat challenge pada kunci/tujuan dan mencatat perlunya pengembalian kredensial refresh yang sama pada retry sah tanpa menyimpan rahasia mentah.

## Temuan yang tetap menghalangi Gate A

| Prioritas | Item | Pemilik keputusan | Dampak |
|---|---|---|---|
| P0 | Nilai komersial dan operasi dalam ODL-001 seluruhnya TBD: fitur, harga, limit, rekening, mata uang/biaya, pajak, refund, identitas hukum. | Product/Finance/Legal | Kontrak pembelian dan operasional belum bisa dibekukan untuk produksi. |
| P0 | ADR-01–08 belum disetujui sebagai kontrak final; SQL/OpenAPI/licensing kanonis masih draf dan berbeda pada protokol perangkat. | Product/Security/Finance/Desktop/Tech Lead | Gate A tidak dapat diberi PASS; Phase 01 tetap tertahan. |
| P0 | Definisi byte kanonis PoP, pilihan algoritme dan cakupan Windows, format artefak penerbitan, rotasi kunci dan tes interoperability belum tetap. | Security/Desktop Lead | Implementasi licensing belum aman untuk dilanjutkan. |
| P1 | Pemetaan rute UI ke OpenAPI, prototipe ID/EN dan audit aksesibilitas belum ada. | UX/Tech Lead/QA | Integrasi UI tidak boleh mengasumsikan rute draf. |

## Bukti dan batas tinjauan

- Sumber internal: `PRODUCT_REQUIREMENTS.md` §§2–3,8,11–15; `BUSINESS_RULES_AND_FLOWS.md` §§2–6,9; `database/001_core_schema.sql`; `galung_api_v1/openapi.yaml`; `galung_licensing_v1/LICENSING_PROTOCOL_SPECIFICATION.md` §§3–10; `THREAT_MODEL.md`; ADR dan D-01–D-06.
- Verifikasi sebelumnya: 72 FR dan 18 ALIGN/15 CR terlacak; ekspor OpenAPI YAML/JSON setara secara struktural. Tidak ada kode aplikasi, migrasi produksi, tes keamanan, atau klien Windows dalam repositori ini.
- Rujukan eksternal sebagai pemeriksaan teknis, bukan pengganti keputusan proyek: [RFC 8725](https://www.rfc-editor.org/info/rfc8725/) mensyaratkan validasi algoritme JWT dan pembatasan penggunaan kunci; [Microsoft CNG key storage providers](https://learn.microsoft.com/en-us/windows/win32/seccertenroll/cng-key-storage-providers) mencantumkan ECDSA P-256 pada penyedia kunci Windows, tetapi tidak membuktikan kompatibilitas seluruh target Galung; [UU 27/2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-) menjadi sumber hukum yang harus ditelaah pada rancangan retensi/pemberitahuan privasi. Tidak ada kesimpulan bahwa kepatuhan hukum telah tercapai.

## Satu keputusan ya/tidak untuk Product Owner

**Apakah Anda menyetujui arah arsitektur dan kontrol pada ADR-01–08 serta D-01–D-06 sebagaimana diperbaiki di atas, dan mengizinkan penyelarasan dokumen SQL/OpenAPI/licensing kanonis sebagai draf Phase 00 untuk ditinjau lagi?**

- **Ya:** setujui *arah rancangan* dan izinkan perubahan draf kontrak Phase 00 yang dapat ditinjau; **bukan** persetujuan nilai TBD, Gate A, deployment, atau Phase 01.
- **Tidak:** ADR/kontrak tetap draf; sampaikan koreksi yang dikehendaki tanpa mengubah kontrak kanonis.

Keputusan ini sengaja tidak meminta persetujuan final untuk hal yang masih TBD. Gate A hanya dapat lulus setelah nilai/kebijakan yang relevan, tinjauan lintas fungsi yang nyata, kontrak versi baru dan bukti pengujian terpenuhi.
