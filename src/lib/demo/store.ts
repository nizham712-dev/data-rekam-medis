import type {
  Medicine,
  MedicalRecord,
  Patient,
  Prescription,
  Profile,
} from '@/types';

export const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function at(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const demoProfiles: Profile[] = [
  {
    id: 'p-admin-01',
    fullName: 'Rina Anggraini',
    role: 'admin',
    specialization: null,
    sipNumber: null,
    createdAt: at(210, 8, 0),
  },
  {
    id: 'p-dokter-01',
    fullName: 'dr. Arya Wicaksana',
    role: 'dokter',
    specialization: 'Dokter Umum',
    sipNumber: 'SIP-2019-4471',
    createdAt: at(200, 8, 0),
  },
  {
    id: 'p-dokter-02',
    fullName: 'dr. Maya Hartono',
    role: 'dokter',
    specialization: 'Dokter Umum',
    sipNumber: 'SIP-2020-5128',
    createdAt: at(190, 8, 0),
  },
  {
    id: 'p-perawat-01',
    fullName: 'Ns. Dewi Kartika',
    role: 'perawat',
    specialization: null,
    sipNumber: null,
    createdAt: at(180, 8, 0),
  },
];

export const demoPatients: Patient[] = [
  {
    id: 'pas-1',
    noRm: 'RM-202503-0001',
    nik: '3174055601890001',
    fullName: 'Siti Nurhaliza',
    dateOfBirth: '1989-01-05',
    gender: 'P',
    bloodType: 'A',
    allergies: 'Penisilin (ruam kulit)',
    phone: '081234567890',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    createdAt: at(220, 9, 0),
  },
  {
    id: 'pas-2',
    noRm: 'RM-202504-0002',
    nik: '3174021204750002',
    fullName: 'Budi Santoso',
    dateOfBirth: '1975-04-12',
    gender: 'L',
    bloodType: 'O',
    allergies: null,
    phone: '081298765432',
    address: 'Jl. Kenanga No. 8, Jakarta Barat',
    createdAt: at(200, 10, 0),
  },
  {
    id: 'pas-3',
    noRm: 'RM-202506-0003',
    nik: '3174032806910003',
    fullName: 'Dewi Lestari',
    dateOfBirth: '1991-06-28',
    gender: 'P',
    bloodType: 'B',
    allergies: null,
    phone: '085612345678',
    address: 'Jl. Anggrek No. 21, Jakarta Timur',
    createdAt: at(160, 11, 0),
  },
  {
    id: 'pas-4',
    noRm: 'RM-202507-0004',
    nik: '3174041705800004',
    fullName: 'Ahmad Fauzi',
    dateOfBirth: '1980-05-17',
    gender: 'L',
    bloodType: 'AB',
    allergies: 'Debu',
    phone: '087811223344',
    address: 'Jl. Mawar No. 5, Jakarta Utara',
    createdAt: at(140, 9, 30),
  },
  {
    id: 'pas-5',
    noRm: 'RM-202508-0005',
    nik: '3174010309920005',
    fullName: 'Ratna Puspita',
    dateOfBirth: '1992-09-03',
    gender: 'P',
    bloodType: 'O',
    allergies: null,
    phone: '081388776655',
    address: 'Jl. Lily No. 33, Jakarta Pusat',
    createdAt: at(120, 13, 0),
  },
  {
    id: 'pas-6',
    noRm: 'RM-202509-0006',
    nik: '3174061419880006',
    fullName: 'Rizky Pratama',
    dateOfBirth: '1988-11-14',
    gender: 'L',
    bloodType: 'A',
    allergies: null,
    phone: '081277665544',
    address: 'Jl. Dahlia No. 7, Tangerang',
    createdAt: at(90, 8, 30),
  },
  {
    id: 'pas-7',
    noRm: 'RM-202510-0007',
    nik: '3174072501940007',
    fullName: 'Nadia Putri',
    dateOfBirth: '1994-01-25',
    gender: 'P',
    bloodType: 'B',
    allergies: 'Lateks',
    phone: '081355443322',
    address: 'Jl. Violet No. 19, Depok',
    createdAt: at(60, 10, 30),
  },
  {
    id: 'pas-8',
    noRm: 'RM-202511-0008',
    nik: '3174080906710008',
    fullName: 'Slamet Riyadi',
    dateOfBirth: '1971-06-09',
    gender: 'L',
    bloodType: 'Unknown',
    allergies: null,
    phone: '081244332211',
    address: 'Jl. Kamboja No. 4, Bekasi',
    createdAt: at(30, 14, 0),
  },
];

function record(
  id: string,
  patientId: string,
  doctorId: string,
  daysAgo: number,
  hour: number,
  minute: number,
  status: MedicalRecord['status'],
  vitalSigns: MedicalRecord['vitalSigns'],
  subjective: string,
  objective: string,
  assessment: string,
  plan: string,
): MedicalRecord {
  return {
    id,
    patientId,
    doctorId,
    visitDate: at(daysAgo, hour, minute),
    vitalSigns,
    subjective,
    objective,
    assessment,
    plan,
    status,
    createdAt: at(daysAgo, hour, minute),
    updatedAt: at(daysAgo, hour, minute + 10),
  };
}

export const demoRecords: MedicalRecord[] = [
  record('rec-1', 'pas-1', 'p-dokter-01', 0, 7, 45, 'antrean', { td: '120/80', nadi: 78, suhu: 36.6, bb: 58, tb: 158 }, '', '', '', ''),
  record('rec-2', 'pas-2', 'p-dokter-02', 0, 8, 10, 'antrean', { td: '130/85', nadi: 82, suhu: 36.5 }, '', '', '', ''),
  record('rec-3', 'pas-3', 'p-dokter-01', 0, 8, 25, 'diperiksa', { td: '118/76', nadi: 74, suhu: 36.7, bb: 62, tb: 165 }, 'Demam dan nyeri tenggorokan sejak 2 hari', 'Tonsil sedikit bengkak, tidak ada exudate', '', ''),
  record('rec-4', 'pas-4', 'p-dokter-02', 0, 9, 5, 'diperiksa', { td: '126/82', nadi: 88, suhu: 37.1 }, 'Batuk berdahak sejak 3 hari', 'Suara napas vesikuler, rhonki (+)', '', ''),
  record('rec-5', 'pas-5', 'p-dokter-01', 0, 9, 40, 'selesai', { td: '122/78', nadi: 76, suhu: 36.8 }, 'Sakit kepala berulang', 'Tekanan darah normal, tidak ada defisit neurologis', 'R51.9 — Nyeri kepala', 'Istirahat cukup, paracetamol 500 mg 3x1, kontrol 3 hari'),
  record('rec-6', 'pas-6', 'p-dokter-02', 1, 10, 20, 'selesai', { td: '118/78', nadi: 72, suhu: 36.5 }, 'Nyeri lambung setelah makan', 'Epigastrium nyeri tekuk ringan', 'K30 — Dispepsia', 'Antasida 3x1 sesudah makan, hindari kopi'),
  record('rec-7', 'pas-7', 'p-dokter-01', 1, 11, 15, 'selesai', { td: '110/70', nadi: 80, suhu: 36.6 }, 'Gatal-gatal pada lengan', 'Urtikaria lokal, tidak ada sesak', 'L50.0 — Urtikaria', 'Cetirizine 10 mg 1x1, kompres dingin'),
  record('rec-8', 'pas-8', 'p-dokter-02', 2, 9, 30, 'selesai', { td: '140/90', nadi: 84, suhu: 36.4 }, 'Pemeriksaan rutin tekanan darah', 'Tekanan darah 140/90, edema (-)', 'I10 — Hipertensi esensial', 'Amlodipine 5 mg 1x1, diet rendah garam, kontrol 1 minggu'),
  record('rec-9', 'pas-1', 'p-dokter-01', 3, 8, 45, 'selesai', { td: '120/80', nadi: 76, suhu: 36.5 }, 'Kontrol alergi', 'Tidak ada ruam aktif', 'J30.4 — Rinitis alergi', 'Hindari penisilin, loratadine 10 mg bila perlu'),
  record('rec-10', 'pas-2', 'p-dokter-02', 4, 10, 0, 'selesai', { td: '128/84', nadi: 79, suhu: 36.6 }, 'Nyeri punggung bawah', 'Lumbal nyeri tekuk, straight leg raise negatif', 'M54.5 — Nyeri punggung bawah', 'Fisioterapi, istirahat relatif, ibuprofen 400 mg 2x1'),
  record('rec-11', 'pas-3', 'p-dokter-01', 5, 9, 15, 'selesai', { td: '116/74', nadi: 77, suhu: 36.7 }, 'Sariawan', 'Ulkus kecil pada mukosa pipi', 'K12.0 — Stomatitis', 'Vitamin B kompleks, obat kumur antiseptik'),
  record('rec-12', 'pas-4', 'p-dokter-02', 6, 11, 0, 'selesai', { td: '124/80', nadi: 81, suhu: 36.6 }, 'Kontrol rutin', 'Pemeriksaan fisik dalam batas normal', 'Z00.0 — Pemeriksaan umum', 'Lanjutkan pola hidup sehat, kontrol 1 bulan'),
];

export const demoPrescriptions: Prescription[] = [
  { id: 'res-1', medicalRecordId: 'rec-5', medicineName: 'Paracetamol 500 mg', dosage: '3x1 sesudah makan', quantity: 9, notes: null },
  { id: 'res-2', medicalRecordId: 'rec-6', medicineName: 'Antasida tablet', dosage: '3x1 1 jam sesudah makan', quantity: 12, notes: null },
  { id: 'res-3', medicalRecordId: 'rec-7', medicineName: 'Cetirizine 10 mg', dosage: '1x1 sebelum tidur', quantity: 7, notes: 'Hentikan bila mengantuk berlebihan' },
  { id: 'res-4', medicalRecordId: 'rec-8', medicineName: 'Amlodipine 5 mg', dosage: '1x1 pagi', quantity: 30, notes: 'Kontrol tekanan darah tiap minggu' },
];

export const demoMedicines: Medicine[] = [
  { id: 'med-1', name: 'Paracetamol 500 mg', dosageForm: 'Tablet', stock: 240, createdAt: at(120, 8, 0) },
  { id: 'med-2', name: 'Ibuprofen 400 mg', dosageForm: 'Tablet', stock: 86, createdAt: at(115, 8, 0) },
  { id: 'med-3', name: 'Amoxicillin 500 mg', dosageForm: 'Kapsul', stock: 42, createdAt: at(110, 8, 0) },
  { id: 'med-4', name: 'Cetirizine 10 mg', dosageForm: 'Tablet', stock: 118, createdAt: at(100, 8, 0) },
  { id: 'med-5', name: 'Antasida tablet', dosageForm: 'Tablet kunyah', stock: 64, createdAt: at(90, 8, 0) },
  { id: 'med-6', name: 'Amlodipine 5 mg', dosageForm: 'Tablet', stock: 35, createdAt: at(80, 8, 0) },
];

export const demoState = {
  profiles: demoProfiles,
  patients: demoPatients,
  records: demoRecords,
  prescriptions: demoPrescriptions,
  medicines: demoMedicines,
  noRmSequence: 8,
};
