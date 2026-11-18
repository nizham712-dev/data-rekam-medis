import type {
  DashboardStats,
  Medicine,
  MedicineInput,
  MedicalRecord,
  MedicalRecordDetail,
  MedicalRecordListItem,
  Patient,
  PatientInput,
  Prescription,
  PrescriptionInput,
  Profile,
  ProfileInput,
  RecordStatus,
  SoapInput,
  VitalSigns,
} from '@/types';

export interface Api {
  dashboard: {
    get(): Promise<DashboardStats>;
  };
  patients: {
    list(search?: string): Promise<Patient[]>;
    get(id: string): Promise<Patient | null>;
    create(input: PatientInput): Promise<Patient>;
    update(id: string, input: PatientInput): Promise<Patient>;
  };
  records: {
    list(filter?: { status?: RecordStatus; patientId?: string }): Promise<MedicalRecordListItem[]>;
    get(id: string): Promise<MedicalRecordDetail | null>;
    createQueue(input: { patientId: string; doctorId: string; vitalSigns: VitalSigns }): Promise<MedicalRecord>;
    updateTriage(id: string, input: { vitalSigns: VitalSigns; status: RecordStatus }): Promise<MedicalRecord>;
    saveSoap(id: string, input: SoapInput): Promise<MedicalRecord>;
  };
  prescriptions: {
    add(recordId: string, input: PrescriptionInput): Promise<Prescription>;
    remove(id: string): Promise<void>;
  };
  profiles: {
    list(): Promise<Profile[]>;
    update(id: string, input: ProfileInput & { role?: Profile['role'] }): Promise<Profile>;
  };
  medicines: {
    list(): Promise<Medicine[]>;
    create(input: MedicineInput): Promise<Medicine>;
    update(id: string, input: MedicineInput): Promise<Medicine>;
    remove(id: string): Promise<void>;
  };
}
