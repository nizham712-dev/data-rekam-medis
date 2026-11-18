/**
 * Representasi tipe dari skema Supabase PostgreSQL.
 * File ini mengikat query ke struktur tabel yang didefinisikan di
 * supabase/migrations/0001_initial_schema.sql.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'admin' | 'dokter' | 'perawat';
export type GenderType = 'L' | 'P';
export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'Unknown';
export type RecordStatus = 'antrean' | 'diperiksa' | 'selesai';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          specialization: string | null;
          sip_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: UserRole;
          specialization?: string | null;
          sip_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          specialization?: string | null;
          sip_number?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          no_rm: string;
          nik: string;
          full_name: string;
          date_of_birth: string;
          gender: GenderType;
          blood_type: BloodType;
          allergies: string | null;
          phone: string;
          address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          no_rm?: string;
          nik: string;
          full_name: string;
          date_of_birth: string;
          gender: GenderType;
          blood_type?: BloodType;
          allergies?: string | null;
          phone?: string;
          address?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          no_rm?: string;
          nik?: string;
          full_name?: string;
          date_of_birth?: string;
          gender?: GenderType;
          blood_type?: BloodType;
          allergies?: string | null;
          phone?: string;
          address?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          visit_date: string;
          vital_signs: Json;
          subjective: string;
          objective: string;
          assessment: string;
          plan: string;
          status: RecordStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          visit_date?: string;
          vital_signs?: Json;
          subjective?: string;
          objective?: string;
          assessment?: string;
          plan?: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          visit_date?: string;
          vital_signs?: Json;
          subjective?: string;
          objective?: string;
          assessment?: string;
          plan?: string;
          status?: RecordStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'medical_records_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medical_records_doctor_id_fkey';
            columns: ['doctor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      prescriptions: {
        Row: {
          id: string;
          medical_record_id: string;
          medicine_name: string;
          dosage: string;
          quantity: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          medical_record_id: string;
          medicine_name: string;
          dosage: string;
          quantity: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          medical_record_id?: string;
          medicine_name?: string;
          dosage?: string;
          quantity?: number;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prescriptions_medical_record_id_fkey';
            columns: ['medical_record_id'];
            isOneToOne: false;
            referencedRelation: 'medical_records';
            referencedColumns: ['id'];
          },
        ];
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          dosage_form: string;
          stock: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          dosage_form?: string;
          stock?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          dosage_form?: string;
          stock?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      no_rm_sequence: {
        Row: { month_key: string; last_value: number };
        Insert: { month_key: string; last_value?: number };
        Update: { month_key?: string; last_value?: number };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: { Args: Record<string, never>; Returns: UserRole };
      generate_no_rm: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      user_role: UserRole;
      gender_type: GenderType;
      blood_type: BloodType;
      record_status: RecordStatus;
    };
  };
}
