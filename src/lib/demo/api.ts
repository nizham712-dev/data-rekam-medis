import { formatMedicalRecordNumber } from '@/utils/medicalRecordNumber';
import type {
  DashboardStats,
  MedicalRecord,
  MedicalRecordDetail,
  MedicalRecordListItem,
} from '@/types';
import type { Api } from '@/lib/api/contracts';
import { demoState, uid } from './store';

const dayKey = (value: string): string => new Date(value).toISOString().slice(0, 10);
const delay = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 120));

function joined(record: MedicalRecord): MedicalRecordListItem {
  const patient = demoState.patients.find((item) => item.id === record.patientId);
  const doctor = demoState.profiles.find((item) => item.id === record.doctorId);
  if (!patient || !doctor) throw new Error('Data demo tidak konsisten.');
  return { ...record, patient: { ...patient }, doctor: { ...doctor } };
}

export const demoApi: Api = {
  dashboard: {
    async get(): Promise<DashboardStats> {
      await delay();
      const records = demoState.records.map(joined);
      const todayKey = dayKey(new Date().toISOString());
      const todayRecords = records.filter((item) => dayKey(item.visitDate) === todayKey);
      const weeklyVisits: DashboardStats['weeklyVisits'] = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const key = dayKey(date.toISOString());
        weeklyVisits.push({
          date: key,
          label: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
          count: records.filter((item) => dayKey(item.visitDate) === key).length,
        });
      }
      return {
        todayQueue: todayRecords.filter((item) => item.status === 'antrean').length,
        inProgress: todayRecords.filter((item) => item.status === 'diperiksa').length,
        completedToday: todayRecords.filter((item) => item.status === 'selesai').length,
        totalPatients: demoState.patients.length,
        weeklyVisits,
        queue: todayRecords
          .filter((item) => item.status !== 'selesai')
          .sort((a, b) => a.visitDate.localeCompare(b.visitDate)),
        recentRecords: records.filter((item) => item.status === 'selesai').slice(0, 5),
      };
    },
  },

  patients: {
    async list(search = ''): Promise<typeof demoState.patients> {
      await delay();
      const term = search.trim().toLowerCase();
      return demoState.patients
        .filter(
          (item) =>
            !term ||
            item.fullName.toLowerCase().includes(term) ||
            item.noRm.toLowerCase().includes(term) ||
            item.nik.includes(term),
        )
        .map((item) => ({ ...item }));
    },
    async get(id) {
      const found = demoState.patients.find((item) => item.id === id);
      return found ? { ...found } : null;
    },
    async create(input) {
      await delay();
      if (demoState.patients.some((item) => item.nik === input.nik)) {
        throw new Error('NIK sudah terdaftar.');
      }
      demoState.noRmSequence += 1;
      const patient = {
        id: uid(),
        noRm: formatMedicalRecordNumber(new Date(), demoState.noRmSequence),
        nik: input.nik,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        bloodType: input.bloodType,
        allergies: input.allergies || null,
        phone: input.phone,
        address: input.address,
        createdAt: new Date().toISOString(),
      };
      demoState.patients.unshift(patient);
      return { ...patient };
    },
    async update(id, input) {
      await delay();
      const index = demoState.patients.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Pasien tidak ditemukan.');
      const current = demoState.patients[index];
      if (!current) throw new Error('Pasien tidak ditemukan.');
      const updated = { ...current, ...input, allergies: input.allergies || null };
      demoState.patients[index] = updated;
      return { ...updated };
    },
  },

  records: {
    async list(filter): Promise<MedicalRecordListItem[]> {
      await delay();
      return demoState.records
        .filter(
          (item) =>
            (!filter?.status || item.status === filter.status) &&
            (!filter?.patientId || item.patientId === filter.patientId),
        )
        .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
        .map(joined);
    },
    async get(id): Promise<MedicalRecordDetail | null> {
      await delay();
      const record = demoState.records.find((item) => item.id === id);
      if (!record) return null;
      return {
        ...joined(record),
        prescriptions: demoState.prescriptions
          .filter((item) => item.medicalRecordId === id)
          .map((item) => ({ ...item })),
      };
    },
    async createQueue(input) {
      await delay();
      const record: MedicalRecord = {
        id: uid(),
        patientId: input.patientId,
        doctorId: input.doctorId,
        visitDate: new Date().toISOString(),
        vitalSigns: input.vitalSigns,
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        status: 'antrean',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoState.records.unshift(record);
      return { ...record };
    },
    async updateTriage(id, input) {
      await delay();
      const record = demoState.records.find((item) => item.id === id);
      if (!record) throw new Error('Rekam medis tidak ditemukan.');
      if (record.status === 'selesai') throw new Error('Rekam medis selesai dikunci dan tidak dapat diubah.');
      record.vitalSigns = input.vitalSigns;
      record.status = input.status;
      record.updatedAt = new Date().toISOString();
      return { ...record };
    },
    async saveSoap(id, input) {
      await delay();
      const record = demoState.records.find((item) => item.id === id);
      if (!record) throw new Error('Rekam medis tidak ditemukan.');
      if (record.status === 'selesai') throw new Error('Rekam medis selesai dikunci dan tidak dapat diubah.');
      Object.assign(record, {
        vitalSigns: input.vitalSigns,
        subjective: input.subjective,
        objective: input.objective,
        assessment: input.assessment,
        plan: input.plan,
        status: input.status,
        updatedAt: new Date().toISOString(),
      });
      return { ...record };
    },
  },

  prescriptions: {
    async add(recordId, input) {
      await delay();
      const record = demoState.records.find((item) => item.id === recordId);
      if (!record) throw new Error('Rekam medis tidak ditemukan.');
      if (record.status === 'selesai') throw new Error('Resep tidak dapat ditambahkan ke kunjungan yang sudah selesai.');
      const prescription = {
        id: uid(),
        medicalRecordId: recordId,
        medicineName: input.medicineName,
        dosage: input.dosage,
        quantity: input.quantity,
        notes: input.notes || null,
      };
      demoState.prescriptions.push(prescription);
      return { ...prescription };
    },
    async remove(id) {
      await delay();
      demoState.prescriptions = demoState.prescriptions.filter((item) => item.id !== id);
    },
  },

  profiles: {
    async list() {
      await delay();
      return demoState.profiles.map((item) => ({ ...item }));
    },
    async update(id, input) {
      await delay();
      const index = demoState.profiles.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Pengguna tidak ditemukan.');
      const current = demoState.profiles[index];
      if (!current) throw new Error('Pengguna tidak ditemukan.');
      const updated = {
        ...current,
        fullName: input.fullName,
        specialization: input.specialization || null,
        sipNumber: input.sipNumber || null,
        role: input.role ?? current.role,
      };
      demoState.profiles[index] = updated;
      return { ...updated };
    },
  },

  medicines: {
    async list() {
      await delay();
      return demoState.medicines.map((item) => ({ ...item }));
    },
    async create(input) {
      await delay();
      const medicine = {
        id: uid(),
        name: input.name,
        dosageForm: input.dosageForm,
        stock: input.stock,
        createdAt: new Date().toISOString(),
      };
      demoState.medicines.push(medicine);
      return { ...medicine };
    },
    async update(id, input) {
      await delay();
      const medicine = demoState.medicines.find((item) => item.id === id);
      if (!medicine) throw new Error('Obat tidak ditemukan.');
      Object.assign(medicine, input);
      return { ...medicine };
    },
    async remove(id) {
      await delay();
      demoState.medicines = demoState.medicines.filter((item) => item.id !== id);
    },
  },
};
