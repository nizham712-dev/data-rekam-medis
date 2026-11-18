# 🏥 PROJECT CONTEXT: Sistem Informasi Data Rekam Medis (EMR)

> **Catatan untuk AI Assistant:** Bacalah dokumen ini secara menyeluruh sebelum menulis, memodifikasi, atau menyarankan kode apa pun. Anda bertindak sebagai *Senior Full-Stack Developer* yang mengutamakan keamanan data medis (privasi pasien), kode yang bersih (*clean code*), dan performa optimal.

---

## 1. Ringkasan Proyek (Project Overview)
Aplikasi berbasis web untuk mengelola **Data Rekam Medis Elektronik (Electronic Medical Record / EMR)** untuk klinik/fasilitas kesehatan tingkat pertama. Aplikasi ini mencakup manajemen pendaftaran pasien, pencatatan riwayat kunjungan (SOAP), diagnosis (ICD-10), resep obat, dan manajemen hak akses berbasis peran (*Role-Based Access Control*).

---

## 2. Tech Stack & Arsitektur
* **Frontend Framework:** React 18+ (menggunakan **Vite** sebagai build tool).
* **Bahasa Pemrograman:** TypeScript (Strict Mode diaktifkan) / JavaScript ES6+ *(Pilih salah satu, disarankan TypeScript untuk keamanan tipe data medis)*.
* **Styling:** Tailwind CSS + Lucide React (untuk ikon).
* **State Management & Data Fetching:** TanStack Query (React Query) untuk *server-state* & caching, React Context / Zustand untuk *client-state*.
* **Routing:** React Router DOM v6+.
* **Form & Validasi:** React Hook Form + Zod.
* **Backend as a Service (BaaS):** **Supabase**
  * **Database:** PostgreSQL.
  * **Authentication:** Supabase Auth (Email/Password).
  * **Security:** Row Level Security (RLS) wajib aktif di semua tabel.
  * **Storage:** Supabase Storage (untuk unggah hasil lab, foto rontgen, atau dokumen pendukung).

---

## 3. Role & Hak Akses Pengguna (RBAC)
Sistem memiliki 3 peran utama yang disimpan dalam tabel `profiles` dan dikontrol melalui Supabase RLS:
1. **`admin`**: Manajemen user (dokter/perawat/resepsionis), master data obat, dan pengaturan klinik. Tidak boleh mengubah catatan medis dokter.
2. **`dokter`**: Melihat daftar pasien, membuat & mengedit catatan rekam medis (SOAP), menetapkan diagnosis, dan membuat resep obat.
3. **`perawat` / `resepsionis`**: Mendaftarkan pasien baru, mencatat tanda-tanda vital (*vital signs* awal sebelum masuk ruang dokter), dan mengatur antrean kunjungan.

---

## 4. Skema Database (Supabase PostgreSQL)

AI harus selalu mengacu pada struktur tabel berikut saat membuat *query* Supabase:

### A. `profiles` (Ekstensi dari `auth.users`)
* `id` (uuid, PK, references `auth.users.id`)
* `full_name` (text)
* `role` (enum: `'admin'`, `'dokter'`, `'perawat'`)
* `specialization` (text, nullable - khusus dokter)
* `sip_number` (text, nullable - Surat Izin Praktik)
* `created_at` (timestamptz)

### B. `patients` (Master Data Pasien)
* `id` (uuid, PK, default `gen_random_uuid()`)
* `no_rm` (text, unique, not null - Nomor Rekam Medis, format: `RM-YYYYMM-XXXX`)
* `nik` (text, unique, not null - 16 digit)
* `full_name` (text, not null)
* `date_of_birth` (date, not null)
* `gender` (enum: `'L'`, `'P'`)
* `blood_type` (enum: `'A'`, `'B'`, `'AB'`, `'O'`, `'Unknown'`)
* `allergies` (text, nullable - Penting untuk peringatan klinis)
* `phone` (text)
* `address` (text)
* `created_at` (timestamptz)

### C. `medical_records` (Catatan Kunjungan & Rekam Medis)
* `id` (uuid, PK, default `gen_random_uuid()`)
* `patient_id` (uuid, FK -> `patients.id`, not null)
* `doctor_id` (uuid, FK -> `profiles.id`, not null)
* `visit_date` (timestamptz, default `now()`)
* `vital_signs` (jsonb - Contoh: `{"td": "120/80", "nadi": 80, "suhu": 36.5, "bb": 65, "tb": 170}`)
* `subjective` (text - Keluhan utama & riwayat penyakit sekarang)
* `objective` (text - Hasil pemeriksaan fisik)
* `assessment` (text - Diagnosis kerja / kode ICD-10)
* `plan` (text - Rencana terapi, edukasi, dan rujukan)
* `status` (enum: `'antrean'`, `'diperiksa'`, `'selesai'`)
* `created_at` (timestamptz)
* `updated_at` (timestamptz)

### D. `prescriptions` (Resep Obat per Kunjungan)
* `id` (uuid, PK, default `gen_random_uuid()`)
* `medical_record_id` (uuid, FK -> `medical_records.id`, on delete cascade)
* `medicine_name` (text, not null)
* `dosage` (text, not null - Contoh: `"3x1 sesudah makan"`)
* `quantity` (int, not null)
* `notes` (text, nullable)

---

## 5. Struktur Folder Proyek
Gunakan arsitektur berbasis fitur (*Feature-based Architecture*) agar mudah dikelola:

```text
src/
├── components/         # Komponen UI reusable (Button, Modal, Input, Badge, dll.)
│   └── layout/         # Sidebar, Navbar, ProtectedRoute
├── features/           # Modul utama aplikasi
│   ├── auth/           # Login, AuthContext, RoleGuard
│   ├── patients/       # CRUD Pasien, Pencarian No. RM / NIK
│   ├── records/        # Form SOAP, Riwayat Medis, Tanda Vital
│   └── dashboard/      # Statistik kunjungan harian/bulanan
├── lib/                # Konfigurasi library pihak ketiga
│   └── supabase.ts     # Inisialisasi Supabase Client
├── types/              # Definisi TypeScript interfaces & Supabase Database Types
├── utils/              # Helper functions (format tanggal, generator No. RM, kalkulator umur)
├── App.tsx             # Konfigurasi Routing utama
└── main.tsx            # Entry point
```

---

## 6. Aturan Standar & Konvensi Koding (Coding Standards)

### 1. Keamanan & Privasi Data Medis (KRITIS)
* **JANGAN PERNAH** mengekspos `SUPABASE_SERVICE_ROLE_KEY` di sisi frontend (Vite). Hanya gunakan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
* **Validasi Input:** Semua form medis (terutama NIK, dosis obat, dan tanda vital) wajib divalidasi menggunakan **Zod** sebelum dikirim ke Supabase.
* **Audit & Integritas:** Data rekam medis yang sudah berstatus `'selesai'` tidak boleh dihapus secara permanen (*hard delete*), melainkan dikunci agar tidak sembarangan diubah demi integritas hukum rekam medis.
* **Peringatan Alergi:** Jika kolom `allergies` pada tabel `patients` tidak kosong, UI wajib menampilkan *alert/badge* berwarna merah yang mencolok di halaman pemeriksaan dokter.

### 2. Konvensi React & Supabase
* Pisahkan logika pemanggilan API Supabase dari komponen UI. Buat custom hooks (contoh: `usePatients.ts`, `useMedicalRecords.ts`) menggunakan **TanStack Query**.
* Gunakan *naming convention*:
  * Komponen React: `PascalCase` (contoh: `PatientForm.tsx`).
  * Hooks & Utilities: `camelCase` (contoh: `formatMedicalRecordNumber.ts`).
  * Tabel & Kolom Database: `snake_case` (contoh: `medical_records`, `visit_date`).
* Selalu tangani state `isLoading`, `isError`, dan `empty state` (data kosong) dengan UI yang ramah pengguna.

### 3. Desain UI/UX (Konteks Medis)
* Gunakan palet warna yang bersih, tenang, dan profesional (contoh: dominan putih/abu-abu terang dengan aksen *Teal* atau *Medical Blue*).
* Pastikan tipografi mudah dibaca dan kontras tinggi.
* Gunakan indikator warna yang jelas untuk status:
  * `antrean`: Kuning (*Amber*)
  * `diperiksa`: Biru (*Blue*)
  * `selesai`: Hijau (*Emerald*)
  * Peringatan Alergi / Kritis: Merah (*Rose/Red*)

---

## 7. Cara AI Merespons Permintaan Saya
Ketika saya meminta Anda membuatkan fitur atau komponen:
1. Selalu periksa apakah kode tersebut mematuhi **Skema Database** dan **Role (RBAC)** di atas.
2. Berikan kode yang lengkap, modular, dan siap pakai tanpa menyingkat bagian penting dengan komentar `// ... kode lainnya`.
3. Jika membutuhkan perubahan pada database (seperti penambahan kolom atau *RLS Policy*), sertakan perintah **SQL Migration** yang siap dijalankan di Supabase SQL Editor.