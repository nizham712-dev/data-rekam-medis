import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthContext';
import { useCreatePatient, useUpdatePatient } from './usePatients';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { InlineNotice } from '@/components/ui/States';
import { BLOOD_OPTIONS, GENDER_OPTIONS } from '@/utils/constants';
import { medicalRecordNumberHint } from '@/utils/medicalRecordNumber';
import { patientSchema, type PatientFormValues } from '@/utils/schemas';
import type { Patient } from '@/types';

interface PatientFormModalProps {
  open: boolean;
  onClose(): void;
  patient?: Patient | null;
}

const emptyValues: PatientFormValues = {
  nik: '',
  fullName: '',
  dateOfBirth: '',
  gender: 'L',
  bloodType: 'Unknown',
  allergies: '',
  phone: '',
  address: '',
};

export function PatientFormModal({ open, onClose, patient }: PatientFormModalProps) {
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'perawat';
  const create = useCreatePatient();
  const update = useUpdatePatient();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      patient
        ? {
            nik: patient.nik,
            fullName: patient.fullName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            allergies: patient.allergies ?? '',
            phone: patient.phone,
            address: patient.address,
          }
        : emptyValues,
    );
  }, [open, patient, form]);

  const submit = async (values: PatientFormValues) => {
    if (!canWrite) return;
    try {
      if (patient) {
        await update.mutateAsync({ id: patient.id, input: values });
      } else {
        await create.mutateAsync(values);
      }
      onClose();
    } catch {
      // Error tampil melalui state mutation di bawah.
    }
  };

  const mutationError = create.isError ? create.error : update.isError ? update.error : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient ? 'Ubah data pasien' : 'Daftarkan pasien baru'}
      description={patient ? patient.noRm : `No. RM akan dibuat otomatis (${medicalRecordNumberHint()})`}
      width="max-w-2xl"
    >
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
        {mutationError && <InlineNotice tone="error">{mutationError.message}</InlineNotice>}
        {!canWrite && <InlineNotice tone="info">Peran Anda hanya dapat melihat data pasien.</InlineNotice>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="NIK" htmlFor="nik" required error={form.formState.errors.nik?.message} hint="16 digit angka">
            <Input id="nik" inputMode="numeric" maxLength={16} disabled={!canWrite} {...form.register('nik')} />
          </Field>
          <Field label="Nama lengkap" htmlFor="fullName" required error={form.formState.errors.fullName?.message}>
            <Input id="fullName" disabled={!canWrite} {...form.register('fullName')} />
          </Field>
          <Field label="Tanggal lahir" htmlFor="dateOfBirth" required error={form.formState.errors.dateOfBirth?.message}>
            <Input id="dateOfBirth" type="date" disabled={!canWrite} {...form.register('dateOfBirth')} />
          </Field>
          <Field label="Jenis kelamin" htmlFor="gender" required>
            <Select id="gender" disabled={!canWrite} {...form.register('gender')}>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Golongan darah" htmlFor="bloodType">
            <Select id="bloodType" disabled={!canWrite} {...form.register('bloodType')}>
              {BLOOD_OPTIONS.map((option) => (
                <option key={option} value={option}>{option === 'Unknown' ? 'Tidak diketahui' : option}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nomor telepon" htmlFor="phone" required error={form.formState.errors.phone?.message}>
            <Input id="phone" inputMode="tel" disabled={!canWrite} {...form.register('phone')} />
          </Field>
          <Field
            label="Alergi"
            htmlFor="allergies"
            error={form.formState.errors.allergies?.message}
            hint="Kosongkan bila tidak ada. Akan ditampilkan sebagai peringatan di halaman pemeriksaan."
            className="sm:col-span-2"
          >
            <Input id="allergies" placeholder="Contoh: Penisilin (ruam kulit)" disabled={!canWrite} {...form.register('allergies')} />
          </Field>
          <Field label="Alamat" htmlFor="address" error={form.formState.errors.address?.message} className="sm:col-span-2">
            <Textarea id="address" rows={2} disabled={!canWrite} {...form.register('address')} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-rule pt-4">
          <Button type="button" onClick={onClose}>Batal</Button>
          {canWrite && (
            <Button type="submit" variant="primary" isLoading={create.isPending || update.isPending}>
              {patient ? 'Simpan perubahan' : 'Daftarkan pasien'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
