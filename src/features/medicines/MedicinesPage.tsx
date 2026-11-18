import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCreateMedicine, useDeleteMedicine, useMedicines, useUpdateMedicine } from './useMedicines';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '@/components/ui/States';
import { medicineFormSchema, type MedicineFormValues } from '@/utils/schemas';
import type { Medicine } from '@/types';

export function MedicinesPage() {
  const { data, isLoading, isError, error, refetch } = useMedicines();
  const create = useCreateMedicine();
  const update = useUpdateMedicine();
  const remove = useDeleteMedicine();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Medicine | null>(null);

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: { name: '', dosageForm: '', stock: 0 },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? { name: editing.name, dosageForm: editing.dosageForm, stock: editing.stock }
        : { name: '', dosageForm: '', stock: 0 },
    );
  }, [open, editing, form]);

  const submit = async (values: MedicineFormValues) => {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input: values });
      else await create.mutateAsync(values);
      setOpen(false);
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  const mutationError = create.isError ? create.error : update.isError ? update.error : remove.isError ? remove.error : null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Data Obat"
        subtitle="Master obat yang tersedia untuk pencatatan resep."
        actions={
          <Button variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Tambah obat
          </Button>
        }
      />

      <Card>
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 text-small text-muted">
          <span>{data?.length ?? 0} obat terdaftar</span>
          <span className="hidden sm:inline">Stok diperbarui manual oleh admin</span>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error ? error.message : 'Data tidak tersedia.'} onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Belum ada data obat" description="Tambahkan obat pertama untuk melengkapi master data." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="text-small text-muted">
                  <th className="px-5 py-3 font-normal">Nama obat</th>
                  <th className="px-3 py-3 font-normal">Bentuk</th>
                  <th className="px-3 py-3 text-right font-normal">Stok</th>
                  <th className="w-24 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {data.map((medicine) => (
                  <tr key={medicine.id} className="transition-colors hover:bg-raised">
                    <td className="px-5 py-3 text-body font-medium text-ink">{medicine.name}</td>
                    <td className="px-3 py-3 text-body text-muted">{medicine.dosageForm || '—'}</td>
                    <td className="px-3 py-3 text-right text-body tabular-nums text-ink">{medicine.stock}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Ubah ${medicine.name}`}
                          onClick={() => { setEditing(medicine); setOpen(true); }}
                          className="rounded p-1.5 text-muted hover:bg-active hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${medicine.name}`}
                          onClick={() => setConfirmDelete(medicine)}
                          className="rounded p-1.5 text-faint hover:bg-rose-50 hover:text-negative"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Ubah obat' : 'Tambah obat'}>
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          {mutationError && <InlineNotice tone="error">{mutationError.message}</InlineNotice>}
          <Field label="Nama obat" htmlFor="med-name" required error={form.formState.errors.name?.message}>
            <Input id="med-name" {...form.register('name')} />
          </Field>
          <Field label="Bentuk sediaan" htmlFor="med-form" error={form.formState.errors.dosageForm?.message}>
            <Input id="med-form" placeholder="Tablet, kapsul, sirup…" {...form.register('dosageForm')} />
          </Field>
          <Field label="Stok" htmlFor="med-stock" required error={form.formState.errors.stock?.message}>
            <Input id="med-stock" type="number" min={0} {...form.register('stock')} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <Button type="button" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={create.isPending || update.isPending}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Hapus obat" description={confirmDelete?.name}>
        <p className="text-body text-muted">
          Obat yang dihapus tidak dapat dikembalikan. Riwayat resep yang sudah dibuat tidak berubah.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" onClick={() => setConfirmDelete(null)}>Batal</Button>
          <Button
            type="button"
            variant="danger"
            isLoading={remove.isPending}
            onClick={() => {
              if (!confirmDelete) return;
              void remove.mutateAsync(confirmDelete.id).then(() => setConfirmDelete(null)).catch(() => undefined);
            }}
          >
            Hapus obat
          </Button>
        </div>
      </Modal>
    </div>
  );
}
