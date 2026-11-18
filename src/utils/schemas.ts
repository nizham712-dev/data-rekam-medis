import { z } from 'zod';

const today = () => new Date().toISOString().slice(0, 10);

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const patientSchema = z.object({
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, 'NIK harus terdiri dari 16 digit angka'),
  fullName: z.string().trim().min(2, 'Nama pasien wajib diisi').max(100),
  dateOfBirth: z
    .string()
    .min(1, 'Tanggal lahir wajib diisi')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Tanggal lahir tidak valid')
    .refine((value) => value <= today(), 'Tanggal lahir tidak boleh di masa depan'),
  gender: z.enum(['L', 'P']),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'Unknown']),
  allergies: z.string().trim().max(300, 'Maksimal 300 karakter').optional().default(''),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,20}$/, 'Nomor telepon tidak valid (8-20 karakter)'),
  address: z.string().trim().max(300, 'Maksimal 300 karakter').optional().default(''),
});
export type PatientFormValues = z.infer<typeof patientSchema>;

export const vitalSignsFormSchema = z.object({
  td: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{2,3}\/\d{2,3}$/.test(value), 'Format: 120/80'),
  nadi: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 30 && Number(value) <= 250), '30-250 x/menit'),
  suhu: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+(\.\d)?$/.test(value) && Number(value) >= 34 && Number(value) <= 43), '34-43 °C'),
  bb: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+(\.\d)?$/.test(value) && Number(value) > 0 && Number(value) <= 400), '0-400 kg'),
  tb: z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d+(\.\d)?$/.test(value) && Number(value) > 0 && Number(value) <= 250), '0-250 cm'),
});
export type VitalSignsFormValues = z.infer<typeof vitalSignsFormSchema>;

const optionalText = (max: number) => z.string().trim().max(max);

export const soapFormSchema = z
  .object({
    intent: z.enum(['draft', 'selesai']),
    vitalSigns: vitalSignsFormSchema,
    subjective: optionalText(2000),
    objective: optionalText(2000),
    assessment: optionalText(2000),
    plan: optionalText(2000),
  })
  .superRefine((data, ctx) => {
    if (data.intent !== 'selesai') return;
    const wajib: Array<['subjective' | 'objective' | 'assessment' | 'plan', string]> = [
      ['subjective', 'Keluhan utama (S) wajib diisi'],
      ['objective', 'Hasil pemeriksaan (O) wajib diisi'],
      ['assessment', 'Diagnosis / ICD-10 (A) wajib diisi'],
      ['plan', 'Rencana terapi (P) wajib diisi'],
    ];
    for (const [field, message] of wajib) {
      if (!data[field]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    }
  });
export type SoapFormValues = z.infer<typeof soapFormSchema>;

export const prescriptionFormSchema = z.object({
  medicineName: z.string().trim().min(1, 'Nama obat wajib diisi').max(120),
  dosage: z.string().trim().min(1, 'Dosis wajib diisi').max(120),
  quantity: z.coerce.number().int('Harus bilangan bulat').min(1, 'Minimal 1').max(999),
  notes: optionalText(200).optional().default(''),
});
export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export const medicineFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama obat wajib diisi').max(120),
  dosageForm: z.string().trim().max(60),
  stock: z.coerce.number().int('Harus bilangan bulat').min(0, 'Stok tidak boleh negatif'),
});
export type MedicineFormValues = z.infer<typeof medicineFormSchema>;

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama wajib diisi').max(100),
  specialization: z.string().trim().max(100).optional().default(''),
  sipNumber: z.string().trim().max(50).optional().default(''),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const roleSchema = z.enum(['admin', 'dokter', 'perawat']);
