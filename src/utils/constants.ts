import type { BloodType, GenderType, RecordStatus, UserRole } from '@/types';
import { cn } from '@/lib/cn';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  dokter: 'Dokter',
  perawat: 'Perawat / Resepsionis',
};

export const STATUS_META: Record<RecordStatus, { label: string; pill: string; dot: string }> = {
  antrean: {
    label: 'Antrean',
    pill: 'bg-amber-50 text-amber-900 border border-amber-200',
    dot: 'bg-amber-500',
  },
  diperiksa: {
    label: 'Diperiksa',
    pill: 'bg-blue-50 text-blue-900 border border-blue-200',
    dot: 'bg-blue-600',
  },
  selesai: {
    label: 'Selesai',
    pill: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
];

export const BLOOD_OPTIONS: BloodType[] = ['A', 'B', 'AB', 'O', 'Unknown'];

export const ALLERGY_PILL =
  'bg-rose-50 text-rose-900 border border-rose-200';

export function statusPillClass(status: RecordStatus): string {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium leading-5',
    STATUS_META[status].pill,
  );
}
