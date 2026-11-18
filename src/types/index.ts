import type {
  BloodType,
  GenderType,
  Json,
  RecordStatus,
  UserRole,
} from './database.types';

export type { BloodType, GenderType, RecordStatus, UserRole };

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  specialization: string | null;
  sipNumber: string | null;
  createdAt: string;
}

export interface Patient {
  id: string;
  noRm: string;
  nik: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderType;
  bloodType: BloodType;
  allergies: string | null;
  phone: string;
  address: string;
  createdAt: string;
}

export interface VitalSigns {
  td?: string;
  nadi?: number;
  suhu?: number;
  bb?: number;
  tb?: number;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  vitalSigns: VitalSigns;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medicineName: string;
  dosage: string;
  quantity: number;
  notes: string | null;
}

export interface Medicine {
  id: string;
  name: string;
  dosageForm: string;
  stock: number;
  createdAt: string;
}

export interface MedicalRecordListItem extends MedicalRecord {
  patient: Patient;
  doctor: Profile;
}

export interface MedicalRecordDetail extends MedicalRecordListItem {
  prescriptions: Prescription[];
}

export interface DashboardStats {
  todayQueue: number;
  inProgress: number;
  completedToday: number;
  totalPatients: number;
  weeklyVisits: { date: string; label: string; count: number }[];
  queue: MedicalRecordListItem[];
  recentRecords: MedicalRecordListItem[];
}

export interface PatientInput {
  nik: string;
  fullName: string;
  dateOfBirth: string;
  gender: GenderType;
  bloodType: BloodType;
  allergies: string | null;
  phone: string;
  address: string;
}

export interface SoapInput {
  vitalSigns: VitalSigns;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: RecordStatus;
}

export interface PrescriptionInput {
  medicineName: string;
  dosage: string;
  quantity: number;
  notes: string | null;
}

export interface ProfileInput {
  fullName: string;
  specialization: string | null;
  sipNumber: string | null;
}

export interface MedicineInput {
  name: string;
  dosageForm: string;
  stock: number;
}

/** Utilitas bertipe untuk membaca jsonb vital_signs dari Supabase. */
export function toVitalSigns(value: Json | null | undefined): VitalSigns {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: VitalSigns = {};
  if (typeof value.td === 'string') result.td = value.td;
  if (typeof value.nadi === 'number') result.nadi = value.nadi;
  if (typeof value.suhu === 'number') result.suhu = value.suhu;
  if (typeof value.bb === 'number') result.bb = value.bb;
  if (typeof value.tb === 'number') result.tb = value.tb;
  return result;
}
