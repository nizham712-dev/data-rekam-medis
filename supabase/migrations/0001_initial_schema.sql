-- =====================================================================
-- REKAM MEDIS EMR - Skema awal (jalankan di Supabase SQL Editor)
-- Tabel: profiles, patients, medical_records, prescriptions, medicines
-- Keamanan: RLS aktif di SEMUA tabel, role disimpan di JWT-independent
-- helper current_role() agar tidak terjadi rekursi RLS.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Enum types
-- ---------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'dokter', 'perawat');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender_type as enum ('L', 'P');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.blood_type as enum ('A', 'B', 'AB', 'O', 'Unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.record_status as enum ('antrean', 'diperiksa', 'selesai');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Tabel
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'perawat',
  specialization text,
  sip_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.no_rm_sequence (
  month_key text primary key,
  last_value integer not null default 0
);

-- Nomor RM: RM-YYYYMM-XXXX, counter per bulan, aman untuk konkurensi.
create or replace function public.generate_no_rm()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now(), 'YYYYMM');
  v_next integer;
begin
  insert into public.no_rm_sequence (month_key, last_value) values (v_month, 0)
    on conflict (month_key) do nothing;
  update public.no_rm_sequence set last_value = last_value + 1
    where month_key = v_month returning last_value into v_next;
  return 'RM-' || v_month || '-' || lpad(v_next::text, 4, '0');
end;
$$;

grant execute on function public.generate_no_rm() to authenticated;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  no_rm text not null unique default public.generate_no_rm(),
  nik text not null unique,
  full_name text not null,
  date_of_birth date not null,
  gender public.gender_type not null,
  blood_type public.blood_type not null default 'Unknown',
  allergies text,
  phone text not null default '',
  address text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  dosage_form text not null default '',
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  visit_date timestamptz not null default now(),
  vital_signs jsonb not null default '{}'::jsonb,
  subjective text not null default '',
  objective text not null default '',
  assessment text not null default '',
  plan text not null default '',
  status public.record_status not null default 'antrean',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medical_records_patient_idx on public.medical_records (patient_id, visit_date desc);
create index if not exists medical_records_status_idx on public.medical_records (status, visit_date desc);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid not null references public.medical_records(id) on delete cascade,
  medicine_name text not null,
  dosage text not null,
  quantity integer not null check (quantity > 0),
  notes text
);

create index if not exists prescriptions_record_idx on public.prescriptions (medical_record_id);

-- ---------------------------------------------------------------------
-- 3. Helper function: role pengguna saat ini (SECURITY DEFINER)
--    Dipakai semua policy RLS untuk menghindari recursive policy.
--    Dibuat setelah tabel profiles agar badan fungsi selalu valid.
-- ---------------------------------------------------------------------
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_role() from public;
grant execute on function public.current_role() to authenticated, anon;

-- ---------------------------------------------------------------------
-- 4. Trigger: profil otomatis untuk user baru
--    Role diambil dari raw_user_meta_data->>'role' (default 'perawat').
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role := 'perawat';
  v_raw_role text := coalesce(new.raw_user_meta_data ->> 'role', 'perawat');
begin
  if v_raw_role in ('admin', 'dokter', 'perawat') then
    v_role := v_raw_role::public.user_role;
  end if;

  insert into public.profiles (id, full_name, role, specialization, sip_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    v_role,
    nullif(new.raw_user_meta_data ->> 'specialization', ''),
    nullif(new.raw_user_meta_data ->> 'sip_number', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Trigger: updated_at + integritas rekam medis
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists medical_records_set_updated_at on public.medical_records;
create trigger medical_records_set_updated_at
  before update on public.medical_records
  for each row execute function public.set_updated_at();

-- Rekam medis 'selesai' dikunci: tidak boleh diubah/dihapus via API.
create or replace function public.guard_completed_record()
returns trigger language plpgsql as $$
begin
  if old.status = 'selesai' then
    raise exception 'Rekam medis dengan status selesai dikunci dan tidak dapat diubah.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists medical_records_guard_completed on public.medical_records;
create trigger medical_records_guard_completed
  before update or delete on public.medical_records
  for each row execute function public.guard_completed_record();

-- Resep tidak boleh diubah setelah kunjungan selesai.
create or replace function public.guard_prescription_parent()
returns trigger language plpgsql as $$
declare
  v_record_id uuid := case when tg_op = 'DELETE' then old.medical_record_id else new.medical_record_id end;
  v_status public.record_status;
begin
  select status into v_status from public.medical_records where id = v_record_id;
  if v_status = 'selesai' then
    raise exception 'Resep untuk kunjungan yang sudah selesai tidak dapat diubah.'
      using errcode = 'check_violation';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists prescriptions_guard_parent on public.prescriptions;
create trigger prescriptions_guard_parent
  before insert or update or delete on public.prescriptions
  for each row execute function public.guard_prescription_parent();

-- Hanya admin yang boleh mengubah role; user tidak boleh menaikkan role sendiri.
create or replace function public.guard_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and public.current_role() <> 'admin' then
    raise exception 'Hanya admin yang dapat mengubah peran pengguna.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------
-- 6. Row Level Security - WAJIB aktif di semua tabel
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.medical_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medicines enable row level security;
alter table public.no_rm_sequence enable row level security;

-- profiles -------------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- patients -------------------------------------------------------------
drop policy if exists "patients_select" on public.patients;
create policy "patients_select" on public.patients
  for select to authenticated using (true);

drop policy if exists "patients_insert_staff" on public.patients;
create policy "patients_insert_staff" on public.patients
  for insert to authenticated
  with check (public.current_role() in ('admin', 'perawat'));

drop policy if exists "patients_update_staff" on public.patients;
create policy "patients_update_staff" on public.patients
  for update to authenticated
  using (public.current_role() in ('admin', 'perawat'))
  with check (public.current_role() in ('admin', 'perawat'));

-- Tidak ada policy DELETE: data pasien tidak dihapus permanen.

-- medical_records ------------------------------------------------------
drop policy if exists "records_select" on public.medical_records;
create policy "records_select" on public.medical_records
  for select to authenticated using (true);

drop policy if exists "records_insert_staff" on public.medical_records;
create policy "records_insert_staff" on public.medical_records
  for insert to authenticated
  with check (public.current_role() in ('dokter', 'perawat'));

drop policy if exists "records_update_doctor" on public.medical_records;
create policy "records_update_doctor" on public.medical_records
  for update to authenticated
  using (public.current_role() = 'dokter') with check (public.current_role() = 'dokter');

drop policy if exists "records_update_triage" on public.medical_records;
create policy "records_update_triage" on public.medical_records
  for update to authenticated
  using (public.current_role() = 'perawat' and status = 'antrean')
  with check (public.current_role() = 'perawat' and status in ('antrean', 'diperiksa'));

-- Tidak ada policy DELETE: integritas hukum rekam medis.

-- prescriptions --------------------------------------------------------
drop policy if exists "prescriptions_select" on public.prescriptions;
create policy "prescriptions_select" on public.prescriptions
  for select to authenticated using (true);

drop policy if exists "prescriptions_doctor_write" on public.prescriptions;
create policy "prescriptions_doctor_write" on public.prescriptions
  for all to authenticated
  using (
    public.current_role() = 'dokter'
    and exists (select 1 from public.medical_records r where r.id = medical_record_id and r.status <> 'selesai')
  )
  with check (
    public.current_role() = 'dokter'
    and exists (select 1 from public.medical_records r where r.id = medical_record_id and r.status <> 'selesai')
  );

-- medicines (master data obat - admin) ---------------------------------
drop policy if exists "medicines_select" on public.medicines;
create policy "medicines_select" on public.medicines
  for select to authenticated using (true);

drop policy if exists "medicines_admin_write" on public.medicines;
create policy "medicines_admin_write" on public.medicines
  for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- no_rm_sequence: tidak boleh diakses langsung oleh client.
-- RLS aktif tanpa policy = tertutup untuk authenticated.

-- ---------------------------------------------------------------------
-- 7. Storage: bucket privat untuk berkas pendukung (lab, rontgen, dll.)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-documents',
  'medical-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "medical_docs_select" on storage.objects;
create policy "medical_docs_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'medical-documents');

drop policy if exists "medical_docs_insert" on storage.objects;
create policy "medical_docs_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'medical-documents');

drop policy if exists "medical_docs_delete_admin" on storage.objects;
create policy "medical_docs_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'medical-documents' and public.current_role() = 'admin');

-- ---------------------------------------------------------------------
-- Selesai. Langkah berikutnya di Supabase Dashboard:
-- Authentication > Providers > Email -> aktifkan, matikan "Confirm email"
-- untuk kemudahan development (atau siapkan SMTP produksi).
-- Buat user melalui Authentication > Add user, lalu isi raw user metadata:
--   {"role": "admin", "full_name": "Nama Admin"}
--   {"role": "dokter", "full_name": "dr. Nama", "specialization": "Umum", "sip_number": "..."}
--   {"role": "perawat", "full_name": "Ns. Nama"}
-- =====================================================================
