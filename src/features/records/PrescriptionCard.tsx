import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useMedicines } from '@/features/medicines/useMedicines';
import { useAddPrescription, useRemovePrescription } from './useMedicalRecords';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { EmptyState, InlineNotice } from '@/components/ui/States';
import { prescriptionFormSchema, type PrescriptionFormValues } from '@/utils/schemas';
import type { Prescription } from '@/types';

export function PrescriptionCard({
  recordId,
  prescriptions,
  locked,
}: {
  recordId: string;
  prescriptions: Prescription[];
  locked: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const medicines = useMedicines();
  const add = useAddPrescription(recordId);
  const remove = useRemovePrescription(recordId);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: { medicineName: '', dosage: '', quantity: 1, notes: '' },
  });

  const submit = async (values: PrescriptionFormValues) => {
    try {
      await add.mutateAsync(values);
      form.reset({ medicineName: '', dosage: '', quantity: 1, notes: '' });
      setAdding(false);
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  return (
    <Card>
      <CardHeader
        title="Resep obat"
        action={
          !locked && !adding ? (
            <button type="button" onClick={() => setAdding(true)} className="text-body font-medium text-accent hover:underline">
              Tambah resep
            </button>
          ) : undefined
        }
      />
      <div className="px-5 pb-4">
        {prescriptions.length === 0 ? (
          <EmptyState title="Belum ada resep" description={locked ? undefined : 'Tambahkan obat bila diperlukan.'} className="min-h-24 py-6" />
        ) : (
          <ul className="divide-y divide-rule">
            {prescriptions.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-ink">{item.medicineName}</p>
                  <p className="mt-0.5 text-small text-muted">
                    {item.dosage} · <span className="tabular-nums">{item.quantity}</span> pcs
                  </p>
                  {item.notes && <p className="mt-1 text-small text-faint">{item.notes}</p>}
                </div>
                {!locked && (
                  <button
                    type="button"
                    onClick={() => void remove.mutateAsync(item.id)}
                    aria-label={`Hapus resep ${item.medicineName}`}
                    className="rounded p-1.5 text-faint transition-colors hover:bg-rose-50 hover:text-negative"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {adding && !locked && (
          <form onSubmit={form.handleSubmit(submit)} className="mt-3 flex flex-col gap-3 rounded-card border border-line bg-raised p-3" noValidate>
            {(add.isError || remove.isError) && (
              <InlineNotice tone="error">{(add.error ?? remove.error)?.message}</InlineNotice>
            )}
            <Field label="Nama obat" htmlFor="pres-name" required error={form.formState.errors.medicineName?.message}>
              <Input
                id="pres-name"
                list="medicine-options"
                placeholder="Cari atau ketik nama obat"
                {...form.register('medicineName')}
              />
              <datalist id="medicine-options">
                {(medicines.data ?? []).map((medicine) => (
                  <option key={medicine.id} value={medicine.name} />
                ))}
              </datalist>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dosis" htmlFor="pres-dosage" required error={form.formState.errors.dosage?.message}>
                <Input id="pres-dosage" placeholder="3x1 sesudah makan" {...form.register('dosage')} />
              </Field>
              <Field label="Jumlah" htmlFor="pres-qty" required error={form.formState.errors.quantity?.message}>
                <Input id="pres-qty" type="number" min={1} {...form.register('quantity')} />
              </Field>
            </div>
            <Field label="Catatan" htmlFor="pres-notes">
              <Input id="pres-notes" placeholder="Opsional" {...form.register('notes')} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" isLoading={add.isPending}>Simpan resep</Button>
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Batal</Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
