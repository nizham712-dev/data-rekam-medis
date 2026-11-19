# Panduan Menghubungkan Aplikasi ke Supabase (Tanpa Harus Jago IT)

Ikuti urutan dari atas ke bawah. Kalau ada yang susah, berhenti saja dan kirimkan
tangkapan layar / tulisan yang Anda lihat, nanti saya bantu lanjutkan.

---

## LANGKAH 1 — Buat project Supabase

1. Buka browser, kunjungi **https://supabase.com**
2. Klik **Sign in** (masuk dengan Google atau email).
3. Setelah masuk, klik tombol **New project**.
4. Isi formulir:
   - **Name**: bebas, misalnya `rekam-medis-klinik`
   - **Database Password**: buat password sendiri yang kuat, lalu **catat di kertas/catatan** (jarang dipakai, tapi penting disimpan)
   - **Region**: pilih **Southeast Asia (Singapore)** agar cepat dari Indonesia
5. Klik **Create new project**.
6. Tunggu sekitar 1–3 menit sampai statusnya menjadi **Active / Ready**.

---

## LANGKAH 2 — Ambil URL dan kunci yang diperlukan

1. Di halaman project Supabase Anda, klik tombol **Connect** di pojok kanan atas
   (atau buka **Project Settings → API**).
2. Akan terlihat dua hal yang kita butuhkan:

   | Nama | Contoh bentuk | Dicari di menu |
   | --- | --- | --- |
   | **Project URL** | `https://abcdefgh.supabase.co` | Project URL / API URL |
   | **Publishable key** | `sb_publishable_xxxx...` | API Keys → Publishable key |

   > Kalau yang terlihat malah **anon key** (dimulai dengan `eyJ...`), itu juga boleh dipakai.
   >
   > ⚠️ **Jangan** pernah pakai / menyalin kunci yang bertuliskan **service_role** atau **secret key**.
   > Kunci itu khusus server, bukan untuk aplikasi yang dipakai browser.

3. Salin kedua nilai tersebut ke Notepad. Ini yang akan dimasukkan ke Vercel nanti.

---

## LANGKAH 3 — Jalankan SQL (membuat tabel-tabel aplikasi)

1. Di menu sebelah kiri Supabase, klik **SQL Editor** (icon `</>`).
2. Klik **+ New query**.
3. Di komputer Anda, buka file:
   `supabase/migrations/0001_initial_schema.sql`
   (bisa dibuka dengan Notepad / VS Code).
4. Tekan **Ctrl+A** untuk memilih semua isi file, lalu **Ctrl+C** untuk menyalin.
5. Kembali ke Supabase, klik di dalam kolom kosong SQL Editor, tekan **Ctrl+V**.
6. Klik tombol **Run** (atau tekan **Ctrl+Enter**).
7. Kalau muncul tulisan **"Success. No rows returned"** — itu berarti **berhasil**.
   (Pesan itu normal, bukan error.)
8. Ulangi pengecekan: di menu kiri klik **Table Editor**, seharusnya muncul tabel
   `profiles`, `patients`, `medical_records`, `prescriptions`, `medicines`.

---

## LANGKAH 4 — Buat akun untuk login

Lakukan 3 kali (admin, dokter, perawat):

1. Klik **Authentication** di menu kiri → **Users** → tombol **Add user** → **Create new user**.
2. Isi:
   - **Email**: misalnya `admin@klinik.com`
   - **Password**: buat password sendiri, catat
   - Centang **Auto Confirm User** (agar langsung bisa login tanpa verifikasi email)
3. Di formulir yang sama, cari kolom **User Metadata** dan isi dengan teks ini:

   Untuk admin:
   ```json
   {"role": "admin", "full_name": "Nama Admin"}
   ```

   Untuk dokter:
   ```json
   {"role": "dokter", "full_name": "dr. Nama Dokter", "specialization": "Umum", "sip_number": "SIP-123"}
   ```

   Untuk perawat:
   ```json
   {"role": "perawat", "full_name": "Ns. Nama Perawat"}
   ```

   > Kalau kolom User Metadata tidak ada saat membuat user: buat user dulu, lalu klik
   > user tersebut di daftar → bagian **Metadata** → tambahkan JSON di atas → Save.

4. Klik **Create user**.
5. Ulangi untuk peran dokter dan perawat dengan email berbeda.

---

## LANGKAH 5 — Pasang URL dan key ke Vercel

### Cara mudah lewat website Vercel

1. Buka **https://vercel.com** → masuk → buka project **data-rekam-medis**.
2. Klik **Settings** → **Environment Variables**.
3. Klik **Add New**, isi:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: tempel Project URL dari Langkah 2
   - Centang **Production** → Save
4. Klik **Add New** lagi:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: tempel Publishable key / anon key dari Langkah 2
   - Centang **Production** → Save
5. Buka tab **Deployments** → klik titik-titik pada deployment paling atas → **Redeploy**
   → centang **Use existing Build Cache** boleh saja → klik **Redeploy**.

### Atau lewat terminal (kalau mau saya yang jalankan, beri saja URL + key-nya)

```
npx vercel env add VITE_SUPABASE_URL production
npx vercel env add VITE_SUPABASE_ANON_KEY production
npx vercel deploy --prod --yes
```

---

## LANGKAH 6 — Cek hasil

1. Buka https://data-rekam-medis.vercel.app
2. Tanda **"Mode Demo"** di kanan atas harus **hilang**.
3. Halaman login sekarang akan menampilkan kolom **Email** dan **Kata sandi**.
4. Masukkan salah satu akun dari Langkah 4.
5. Jika berhasil masuk, Anda akan melihat Dashboard dengan data kosong (belum ada pasien) — itu normal karena database baru.

---

## Masalah umum

| Gejala | Penyebab & solusi |
| --- | --- |
| Tanda "Mode Demo" masih ada | Env var belum tersimpan atau belum redeploy. Ulangi Langkah 5, pastikan centang **Production**, lalu redeploy. |
| Saat login muncul "Email atau kata sandi salah" | Email/password salah, atau user belum dicentang **Auto Confirm User**. |
| Setelah login, halaman kosong / error | SQL di Langkah 3 belum dijalankan, atau `User Metadata` belum diisi sehingga peran tidak dikenal. |
| Muncul error "relation does not exist" | Langkah 3 belum berhasil. Buka SQL Editor lagi, jalankan ulang seluruh isi file migrasi. |
| Lupa kunci publishable | Kembali ke **Project Settings → API**, salin lagi. |

---

## Kalau mau saya yang mengerjakan

Kirimkan kepada saya dua nilai ini saja:

1. Project URL: `https://....supabase.co`
2. Publishable / anon key: `sb_publishable_...` atau `eyJ...`

Saya akan memasangnya di Vercel, menjalankan SQL migrasi, membuat akun admin/dokter/perawat,
lalu deploy ulang. (Jangan kirim `service_role` / secret key.)
