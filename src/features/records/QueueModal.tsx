import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatients } from '@/features/patients/usePatients';
import { useUsers } from '@/features/users/useUsers';
import { useCreateQueue } from './useMedicalRecords';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { InlineNotice } from '@/components/ui/States';
import { vitalSignsFormSchema, type VitalSignsFormValues } from '@/utils/schemas';
import type { VitalSigns } from '@/types';

interface QueueModalProps {
  open: boolean;
  onClose(): void;
  defaultPatientId?: string;
}

interface QueueFormValues extends VitalSignsFormValues {
  patientId: string;
  doctorId: string;
}

const queueSchema = vitalSignsFormSchema.extend({
  patientId: z.string().min(1, 'Pilih pasien'),
  doctorId: z.string().min(1, 'Pilih dokter'),
});

function toVitalSigns(values: VitalSignsFormValues): VitalSigns {
  const result: VitalSigns = { td: values.td.trim() };
  if (values.nadi) result.nadi = Number(values.nadi);
  if (values.suhu) result.suhu = Number(values.suhu);
  return result;
}

export function QueueModal({ open, onClose, defaultPatientId }: QueueModalProps) {
  const patients = usePatients();
  const users = useUsers();
  const create = useCreateQueue();
  const doctors = (users.data ?? []).filter((item) => item.role === 'dokter');

  const form = useForm<QueueFormValues>({
    resolver: zodResolver(queueSchema),
    defaultValues: { patientId: defaultPatientId ?? '', doctorId: '', td: '', nadi: '', suhu: '', bb: '', tb: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ patientId: defaultPatientId ?? '', doctorId: '', td: '', nadi: '', suhu: '', bb: '', tb: '' });
    }
  }, [open, defaultPatientId, form]);

  const submit = async (values: QueueFormValues) => {
    try {
      await create.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId,
        vitalSigns: toVitalSigns(values),
      });
      onClose();
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buka antrean kunjungan"
      description="Catat tanda vital awal sebelum pasien masuk ruang dokter."
    >
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
        {create.isError && <InlineNotice tone="error">{create.error.message}</InlineNotice>}

        <Field label="Pasien" htmlFor="queue-patient" required error={form.formState.errors.patientId?.message}>
          <Select id="queue-patient" {...form.register('patientId')}>
            <option value="">Pilih pasien</option>
            {(patients.data ?? []).map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} — {patient.noRm}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dokter pemeriksa" htmlFor="queue-doctor" required error={form.formState.errors.doctorId?.message}>
          <Select id="queue-doctor" {...form.register('doctorId')}>
            <option value="">Pilih dokter</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>{doctor.fullName}</option>
            ))}
          </Select>
        </Field>

        <div className="rounded-card border border-line bg-raised px-4 py-3">
          <p className="mb-3 text-body font-medium text-ink">Tanda vital awal</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Tekanan darah" htmlFor="queue-td" hint="120/80" error={form.formState.errors.td?.message}>
              <Input id="queue-td" placeholder="120/80" {...form.register('td')} />
            </Field>
            <Field label="Nadi" htmlFor="queue-nadi" hint="x/menit" error={form.formState.errors.nadi?.message}>
              <Input id="queue-nadi" inputMode="numeric" placeholder="78" {...form.register('nadi')} />
            </Field>
            <Field label="Suhu" htmlFor="queue-suhu" hint="°C" error={form.formState.errors.suhu?.message}>
              <Input id="queue-suhu" inputMode="decimal" placeholder="36.5" {...form.register('suhu')} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-rule pt-4">
          <Button type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary" isLoading={create.isPending}>Buka antrean</Button>
        </div>
      </form>
    </Modal>
  );
}
