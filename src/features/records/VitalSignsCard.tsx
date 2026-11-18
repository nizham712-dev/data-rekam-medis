import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateTriage } from './useMedicalRecords';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { InlineNotice } from '@/components/ui/States';
import { vitalSignsFormSchema, type VitalSignsFormValues } from '@/utils/schemas';
import type { MedicalRecordDetail, UserRole } from '@/types';

function VitalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule py-2.5 last:border-0">
      <span className="text-body text-muted">{label}</span>
      <span className={value === '—' ? 'text-body text-faint' : 'text-body tabular-nums text-ink'}>{value}</span>
    </div>
  );
}

export function VitalSignsCard({
  record,
  role,
}: {
  record: MedicalRecordDetail;
  role: UserRole;
}) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateTriage();
  const canEdit = role === 'perawat' && record.status === 'antrean';

  const form = useForm<VitalSignsFormValues>({
    resolver: zodResolver(vitalSignsFormSchema),
    defaultValues: {
      td: record.vitalSigns.td ?? '',
      nadi: record.vitalSigns.nadi ? String(record.vitalSigns.nadi) : '',
      suhu: record.vitalSigns.suhu ? String(record.vitalSigns.suhu) : '',
      bb: record.vitalSigns.bb ? String(record.vitalSigns.bb) : '',
      tb: record.vitalSigns.tb ? String(record.vitalSigns.tb) : '',
    },
  });

  const save = async (intent: 'antrean' | 'diperiksa') => {
    const values = form.getValues();
    try {
      await update.mutateAsync({
        id: record.id,
        input: {
          status: intent,
          vitalSigns: {
            td: values.td.trim(),
            ...(values.nadi ? { nadi: Number(values.nadi) } : {}),
            ...(values.suhu ? { suhu: Number(values.suhu) } : {}),
            ...(values.bb ? { bb: Number(values.bb) } : {}),
            ...(values.tb ? { tb: Number(values.tb) } : {}),
          },
        },
      });
      setEditing(false);
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  return (
    <Card>
      <CardHeader
        title="Tanda vital"
        action={
          canEdit && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-body font-medium text-accent hover:underline"
            >
              Catat
            </button>
          ) : undefined
        }
      />
      <div className="px-5 pb-4">
        {!editing ? (
          <dl>
            <VitalRow label="Tekanan darah" value={record.vitalSigns.td || '—'} />
            <VitalRow label="Nadi" value={record.vitalSigns.nadi ? `${record.vitalSigns.nadi} x/menit` : '—'} />
            <VitalRow label="Suhu" value={record.vitalSigns.suhu ? `${record.vitalSigns.suhu} °C` : '—'} />
            <VitalRow label="Berat badan" value={record.vitalSigns.bb ? `${record.vitalSigns.bb} kg` : '—'} />
            <VitalRow label="Tinggi badan" value={record.vitalSigns.tb ? `${record.vitalSigns.tb} cm` : '—'} />
          </dl>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit(() => void save('diperiksa'))();
            }}
            className="flex flex-col gap-3"
            noValidate
          >
            {update.isError && <InlineNotice tone="error">{update.error.message}</InlineNotice>}
            <Field label="Tekanan darah" htmlFor="vital-td" hint="120/80" error={form.formState.errors.td?.message}>
              <Input id="vital-td" placeholder="120/80" {...form.register('td')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nadi" htmlFor="vital-nadi" error={form.formState.errors.nadi?.message}>
                <Input id="vital-nadi" inputMode="numeric" placeholder="78" {...form.register('nadi')} />
              </Field>
              <Field label="Suhu" htmlFor="vital-suhu" error={form.formState.errors.suhu?.message}>
                <Input id="vital-suhu" inputMode="decimal" placeholder="36.5" {...form.register('suhu')} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="BB (kg)" htmlFor="vital-bb" error={form.formState.errors.bb?.message}>
                <Input id="vital-bb" inputMode="decimal" placeholder="65" {...form.register('bb')} />
              </Field>
              <Field label="TB (cm)" htmlFor="vital-tb" error={form.formState.errors.tb?.message}>
                <Input id="vital-tb" inputMode="decimal" placeholder="170" {...form.register('tb')} />
              </Field>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                isLoading={update.isPending}
                onClick={() => void form.handleSubmit(() => void save('antrean'))()}
              >
                Simpan
              </Button>
              <Button type="submit" variant="primary" isLoading={update.isPending}>
                Kirim ke dokter
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Batal</Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
