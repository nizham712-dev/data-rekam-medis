import { supabase } from '@/lib/supabase';
import type { Database, Json } from '@/types/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
import {
  toVitalSigns,
  type DashboardStats,
  type Medicine,
  type MedicalRecord,
  type MedicalRecordDetail,
  type MedicalRecordListItem,
  type Patient,
  type Prescription,
  type Profile,
} from '@/types';
import type { Api } from './contracts';

type Row = Record<string, unknown>;

const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const asNullableString = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const asNumber = (value: unknown, fallback = 0): number => (typeof value === 'number' ? value : fallback);

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, context: string): T {
  if (result.error) throw new Error(`${context}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${context}: data tidak ditemukan`);
  return result.data;
}

function mapProfile(row: Row): Profile {
  return {
    id: asString(row.id),
    fullName: asString(row.full_name),
    role: oneOf(row.role, ['admin', 'dokter', 'perawat'] as const, 'perawat'),
    specialization: asNullableString(row.specialization),
    sipNumber: asNullableString(row.sip_number),
    createdAt: asString(row.created_at),
  };
}

function mapPatient(row: Row): Patient {
  return {
    id: asString(row.id),
    noRm: asString(row.no_rm),
    nik: asString(row.nik),
    fullName: asString(row.full_name),
    dateOfBirth: asString(row.date_of_birth),
    gender: oneOf(row.gender, ['L', 'P'] as const, 'L'),
    bloodType: oneOf(row.blood_type, ['A', 'B', 'AB', 'O', 'Unknown'] as const, 'Unknown'),
    allergies: asNullableString(row.allergies),
    phone: asString(row.phone),
    address: asString(row.address),
    createdAt: asString(row.created_at),
  };
}

function mapRecord(row: Row): MedicalRecord {
  return {
    id: asString(row.id),
    patientId: asString(row.patient_id),
    doctorId: asString(row.doctor_id),
    visitDate: asString(row.visit_date),
    vitalSigns: toVitalSigns(row.vital_signs as Json),
    subjective: asString(row.subjective),
    objective: asString(row.objective),
    assessment: asString(row.assessment),
    plan: asString(row.plan),
    status: oneOf(row.status, ['antrean', 'diperiksa', 'selesai'] as const, 'antrean'),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

function mapPrescription(row: Row): Prescription {
  return {
    id: asString(row.id),
    medicalRecordId: asString(row.medical_record_id),
    medicineName: asString(row.medicine_name),
    dosage: asString(row.dosage),
    quantity: asNumber(row.quantity),
    notes: asNullableString(row.notes),
  };
}

function mapMedicine(row: Row): Medicine {
  return {
    id: asString(row.id),
    name: asString(row.name),
    dosageForm: asString(row.dosage_form),
    stock: asNumber(row.stock),
    createdAt: asString(row.created_at),
  };
}

function mapJoinedRecord(row: Row): MedicalRecordListItem {
  const patient = row.patient;
  const doctor = row.doctor;
  if (!patient || typeof patient !== 'object' || !doctor || typeof doctor !== 'object') {
    throw new Error('Data rekam medis tidak lengkap (pasien/dokter tidak ditemukan).');
  }
  return {
    ...mapRecord(row),
    patient: mapPatient(patient as Row),
    doctor: mapProfile(doctor as Row),
  };
}

const JOIN_SELECT = '*, patient:patients(*), doctor:profiles(*)';

async function joinedRecords(): Promise<MedicalRecordListItem[]> {
  const response = (await supabase
    .from('medical_records')
    .select(JOIN_SELECT)
    .order('visit_date', { ascending: false })
    .limit(300)) as unknown as { data: Row[] | null; error: { message: string } | null };
  if (response.error) throw new Error(response.error.message);
  return (response.data ?? []).map(mapJoinedRecord);
}

function dayKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

export const remoteApi: Api = {
  dashboard: {
    async get(): Promise<DashboardStats> {
      const [records, patientCount] = await Promise.all([
        joinedRecords(),
        supabase.from('patients').select('id', { count: 'exact', head: true }),
      ]);
      if (patientCount.error) throw new Error(patientCount.error.message);

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
        totalPatients: patientCount.count ?? 0,
        weeklyVisits,
        queue: todayRecords
          .filter((item) => item.status !== 'selesai')
          .sort((a, b) => a.visitDate.localeCompare(b.visitDate)),
        recentRecords: records.filter((item) => item.status === 'selesai').slice(0, 5),
      };
    },
  },

  patients: {
    async list(search = ''): Promise<Patient[]> {
      const term = search.trim().replace(/[%,.()\\]/g, '');
      let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (term) {
        query = query.or(`full_name.ilike.%${term}%,no_rm.ilike.%${term}%,nik.ilike.%${term}%`);
      }
      const response = (await query) as unknown as { data: Row[] | null; error: { message: string } | null };
      if (response.error) throw new Error(response.error.message);
      return (response.data ?? []).map(mapPatient);
    },

    async get(id: string): Promise<Patient | null> {
      const response = (await supabase.from('patients').select('*').eq('id', id).maybeSingle()) as unknown as {
        data: Row | null;
        error: { message: string } | null;
      };
      if (response.error) throw new Error(response.error.message);
      return response.data ? mapPatient(response.data) : null;
    },

    async create(input): Promise<Patient> {
      const response = (await supabase
        .from('patients')
        .insert({
          nik: input.nik,
          full_name: input.fullName,
          date_of_birth: input.dateOfBirth,
          gender: input.gender,
          blood_type: input.bloodType,
          allergies: input.allergies || null,
          phone: input.phone,
          address: input.address,
        })
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapPatient(unwrap(response, 'Gagal menyimpan pasien'));
    },

    async update(id, input): Promise<Patient> {
      const response = (await supabase
        .from('patients')
        .update({
          nik: input.nik,
          full_name: input.fullName,
          date_of_birth: input.dateOfBirth,
          gender: input.gender,
          blood_type: input.bloodType,
          allergies: input.allergies || null,
          phone: input.phone,
          address: input.address,
        })
        .eq('id', id)
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapPatient(unwrap(response, 'Gagal memperbarui pasien'));
    },
  },

  records: {
    async list(filter): Promise<MedicalRecordListItem[]> {
      const records = await joinedRecords();
      return records.filter(
        (item) =>
          (!filter?.status || item.status === filter.status) &&
          (!filter?.patientId || item.patientId === filter.patientId),
      );
    },

    async get(id): Promise<MedicalRecordDetail | null> {
      const response = (await supabase
        .from('medical_records')
        .select(JOIN_SELECT)
        .eq('id', id)
        .maybeSingle()) as unknown as { data: Row | null; error: { message: string } | null };
      if (response.error) throw new Error(response.error.message);
      if (!response.data) return null;
      const prescriptionsResponse = (await supabase
        .from('prescriptions')
        .select('*')
        .eq('medical_record_id', id)
        .order('id')) as unknown as { data: Row[] | null; error: { message: string } | null };
      if (prescriptionsResponse.error) throw new Error(prescriptionsResponse.error.message);
      return {
        ...mapJoinedRecord(response.data),
        prescriptions: (prescriptionsResponse.data ?? []).map(mapPrescription),
      };
    },

    async createQueue(input): Promise<MedicalRecord> {
      const response = (await supabase
        .from('medical_records')
        .insert({
          patient_id: input.patientId,
          doctor_id: input.doctorId,
          vital_signs: input.vitalSigns as Json,
          status: 'antrean',
        })
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapRecord(unwrap(response, 'Gagal membuka antrean'));
    },

    async updateTriage(id, input): Promise<MedicalRecord> {
      const current = (await supabase.from('medical_records').select('status').eq('id', id).single()) as unknown as {
        data: Row | null;
        error: { message: string } | null;
      };
      if (current.error) throw new Error(current.error.message);
      if (current.data?.status === 'selesai') throw new Error('Rekam medis selesai dikunci dan tidak dapat diubah.');
      const response = (await supabase
        .from('medical_records')
        .update({ vital_signs: input.vitalSigns as Json, status: input.status })
        .eq('id', id)
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapRecord(unwrap(response, 'Gagal menyimpan tanda vital'));
    },

    async saveSoap(id, input): Promise<MedicalRecord> {
      const current = (await supabase.from('medical_records').select('status').eq('id', id).single()) as unknown as {
        data: Row | null;
        error: { message: string } | null;
      };
      if (current.error) throw new Error(current.error.message);
      if (current.data?.status === 'selesai') throw new Error('Rekam medis selesai dikunci dan tidak dapat diubah.');
      const response = (await supabase
        .from('medical_records')
        .update({
          vital_signs: input.vitalSigns as Json,
          subjective: input.subjective,
          objective: input.objective,
          assessment: input.assessment,
          plan: input.plan,
          status: input.status,
        })
        .eq('id', id)
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapRecord(unwrap(response, 'Gagal menyimpan catatan SOAP'));
    },
  },

  prescriptions: {
    async add(recordId, input): Promise<Prescription> {
      const record = (await supabase.from('medical_records').select('status').eq('id', recordId).single()) as unknown as {
        data: Row | null;
        error: { message: string } | null;
      };
      if (record.error) throw new Error(record.error.message);
      if (record.data?.status === 'selesai') throw new Error('Resep tidak dapat ditambahkan ke kunjungan yang sudah selesai.');
      const response = (await supabase
        .from('prescriptions')
        .insert({
          medical_record_id: recordId,
          medicine_name: input.medicineName,
          dosage: input.dosage,
          quantity: input.quantity,
          notes: input.notes || null,
        })
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapPrescription(unwrap(response, 'Gagal menyimpan resep'));
    },

    async remove(id): Promise<void> {
      const response = (await supabase.from('prescriptions').delete().eq('id', id)) as unknown as {
        error: { message: string } | null;
      };
      if (response.error) throw new Error(response.error.message);
    },
  },

  profiles: {
    async list(): Promise<Profile[]> {
      const response = (await supabase.from('profiles').select('*').order('role')) as unknown as {
        data: Row[] | null;
        error: { message: string } | null;
      };
      if (response.error) throw new Error(response.error.message);
      return (response.data ?? []).map(mapProfile);
    },

    async update(id, input): Promise<Profile> {
      const payload: ProfileUpdate = {
        full_name: input.fullName,
        specialization: input.specialization || null,
        sip_number: input.sipNumber || null,
      };
      if (input.role) payload.role = input.role;
      const response = (await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapProfile(unwrap(response, 'Gagal memperbarui profil'));
    },
  },

  medicines: {
    async list(): Promise<Medicine[]> {
      const response = (await supabase.from('medicines').select('*').order('name')) as unknown as {
        data: Row[] | null;
        error: { message: string } | null;
      };
      if (response.error) throw new Error(response.error.message);
      return (response.data ?? []).map(mapMedicine);
    },
    async create(input): Promise<Medicine> {
      const response = (await supabase
        .from('medicines')
        .insert({ name: input.name, dosage_form: input.dosageForm, stock: input.stock })
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapMedicine(unwrap(response, 'Gagal menambah obat'));
    },
    async update(id, input): Promise<Medicine> {
      const response = (await supabase
        .from('medicines')
        .update({ name: input.name, dosage_form: input.dosageForm, stock: input.stock })
        .eq('id', id)
        .select('*')
        .single()) as unknown as { data: Row | null; error: { message: string } | null };
      return mapMedicine(unwrap(response, 'Gagal memperbarui obat'));
    },
    async remove(id): Promise<void> {
      const response = (await supabase.from('medicines').delete().eq('id', id)) as unknown as {
        error: { message: string } | null;
      };
      if (response.error) throw new Error(response.error.message);
    },
  },
};
