# RekamMedis — Sistem Informasi Rekam Medis Elektronik (EMR)

Aplikasi web EMR untuk klinik / fasilitas kesehatan tingkat pertama. Dibangun dengan **React 18 + Vite + TypeScript (strict)**, **Tailwind CSS**, **TanStack Query**, **React Hook Form + Zod**, **React Router**, dan **Supabase** (PostgreSQL, Auth, RLS, Storage).

> **Mode demo:** jika `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` belum diisi, aplikasi otomatis berjalan dengan data contoh di browser (pilih peran di halaman login). Tidak ada data yang dikirim ke server.

---

## 1. Fitur

| Peran | Akses |
| --- | --- |
| **admin** | Dashboard, data pasien, antrean (lihat), pengguna, master obat, profil. **Tidak dapat mengubah catatan medis dokter.** |
| **dokter** | Dashboard, data pasien, antrean, mengisi catatan SOAP, diagnosis ICD-10, resep obat, profil. |
| **perawat / resepsionis** | Dashboard, mendaftarkan pasien, mencatat tanda vital awal, mengatur antrean (antrean → diperiksa), profil. |

- Peringatan alergi merah yang mencolok di halaman pemeriksaan dokter.
- No. RM `RM-YYYYMM-XXXX` dibuat otomatis oleh database (counter per bulan, aman untuk konkurensi).
- Rekam medis berstatus **selesai dikunci** (trigger menolak UPDATE/DELETE); resep juga terkunci.
- RLS aktif di semua tabel; helper `current_role()` mencegah eskalasi peran sendiri.
- Semua form medis divalidasi dengan **Zod** sebelum dikirim.
- State `loading`, `error`, dan `empty` tersedia di setiap daftar.
- Upload berkas pendukung: bucket Storage privat `medical-documents` (disiapkan lewat migrasi).

---

## 2. Menjalankan secara lokal

```bash
npm install
cp .env.example .env
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (atau biarkan kosong untuk mode demo)
npm run dev
```

Build produksi:

```bash
npm run build     # hasilkan folder dist/
npm run preview   # uji hasil build secara lokal
```

---

## 3. Menyiapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan seluruh isi [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql).
3. **Authentication → Providers → Email**: aktifkan. Nonaktifkan *Confirm email* untuk development, atau siapkan SMTP untuk produksi.
4. Buat akun staf melalui **Authentication → Add user**. Isi *Raw User Metadata* agar trigger membuat profil dengan peran yang benar:

```json
{ "role": "admin", "full_name": "Nama Admin" }
{ "role": "dokter", "full_name": "dr. Nama Dokter", "specialization": "Umum", "sip_number": "SIP-..." }
{ "role": "perawat", "full_name": "Ns. Nama Perawat" }
```

5. Isi `.env` dengan **Project URL** dan **anon/publishable key** (Pengaturan → API).

> ⚠️ **Jangan pernah** menaruh `SUPABASE_SERVICE_ROLE_KEY` di file yang dibaca Vite (`VITE_*`) atau di source code frontend. Kunci itu hanya untuk server/backend, bukan browser.

### Storage

Migrasi membuat bucket privat `medical-documents` (maks. 10 MB: JPG/PNG/WebP/PDF). Contoh unggah dari aplikasi:

```ts
const { data } = await supabase.storage
  .from('medical-documents')
  .upload(`${patientId}/${crypto.randomUUID()}.pdf`, file);
```

---

## 4. Deploy ke cPanel

Aplikasi ini adalah **SPA statis**, jadi cukup di-upload file hasil build.

1. Jalankan `npm run build`.
2. Upload **seluruh isi folder `dist/`** (bukan folder `dist`-nya) ke `public_html` di cPanel, atau ke subdirektori seperti `public_html/emr`.
3. Pastikan file **`.htaccess`** ikut ter-upload (file tersembunyi — centang *Show hidden files* di File Manager). File ini meneruskan semua rute React Router ke `index.html`.
   - Jika aplikasi berada di subdirektori dan rewrite tidak bekerja, tambahkan `RewriteBase /emr` di dalam `.htaccess`.
4. Jika di subdirektori, tambahkan baris ini ke `.env` **sebelum build**, lalu build ulang:

```env
VITE_BASE_PATH=emr
```

5. Pastikan situs memakai **HTTPS** agar Supabase Auth dan `crypto.randomUUID()` berfungsi normal.
6. Tambahkan domain di Supabase **Authentication → URL Configuration**:
   - *Site URL*: `https://domain-anda.com/emr`
   - *Redirect URLs*: `https://domain-anda.com/emr/**`

### Catatan penting

- `VITE_*` tertanam di bundle saat **build**, bukan saat runtime. Ubah `.env` → jalankan `npm run build` lagi → upload ulang `dist/`.
- Jangan upload folder `node_modules`, `src/`, atau `.env` ke cPanel.
- Jika cPanel menyediakan **Setup Node.js App**, itu tidak diperlukan untuk SPA statis.

---

## 5. Struktur proyek

```text
src/
├── components/
│   ├── layout/     # Sidebar, Topbar, AppLayout, ProtectedRoute, Brand
│   └── ui/         # Button, Field, Input, Card, Modal, Tabs, StatusBadge, dll.
├── features/
│   ├── auth/       # AuthContext, LoginPage, RoleGuard
│   ├── dashboard/  # DashboardPage + hook ringkasan
│   ├── patients/   # Daftar, detail, form pasien, hooks
│   ├── records/    # Antrean, SOAP, tanda vital, resep, hooks
│   ├── users/      # Manajemen pengguna, profil
│   └── medicines/  # Master obat
├── lib/
│   ├── api/        # Kontrak + implementasi Supabase (remote)
│   ├── demo/       # Data contoh untuk mode demo
│   ├── supabase.ts # Inisialisasi client (hanya URL + anon key)
│   └── queryClient.ts
├── types/          # Tipe domain + tipe skema database
├── utils/          # Formatter, umur, No. RM, konstanta, Zod schema
├── App.tsx
└── main.tsx
```

---

## 6. Catatan desain

Arahan visual mengikuti gaya **framed sheet** (bingkai bernuansa medis + lembar kerja putih, tanpa bayangan pada elemen diam). Warna status: amber = antrean, biru = diperiksa, emerald = selesai, rose = peringatan alergi. Tipografi: IBM Plex Sans dengan IBM Plex Mono untuk No. RM/NIK.

Nama fasilitas default `Klinik Sehat Bersama` dapat diganti lewat `VITE_CLINIC_NAME`.

Data pada **mode demo** adalah data contoh (nama pasien, resep, dan angka kunjungan) untuk keperluan pratinjau — ganti dengan data sungguhan sebelum produksi.
