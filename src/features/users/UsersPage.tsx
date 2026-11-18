import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useUpdateUser, useUsers } from './useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, ErrorState, InlineNotice, LoadingState } from '@/components/ui/States';
import { ROLE_LABELS } from '@/utils/constants';
import { formatDate, initials } from '@/utils/formatters';
import { profileFormSchema, roleSchema, type ProfileFormValues } from '@/utils/schemas';
import type { Profile, UserRole } from '@/types';

interface UserFormValues extends ProfileFormValues {
  role: UserRole;
}

const userSchema = profileFormSchema.extend({ role: roleSchema });

export function UsersPage() {
  const { user: currentUser, refreshProfile, isDemoMode } = useAuth();
  const { data, isLoading, isError, error, refetch } = useUsers();
  const update = useUpdateUser();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { fullName: '', specialization: '', sipNumber: '', role: 'perawat' },
  });

  useEffect(() => {
    if (!open || !editing) return;
    form.reset({
      fullName: editing.fullName,
      specialization: editing.specialization ?? '',
      sipNumber: editing.sipNumber ?? '',
      role: editing.role,
    });
  }, [open, editing, form]);

  const submit = async (values: UserFormValues) => {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, input: values });
      if (editing.id === currentUser?.id) await refreshProfile();
      setOpen(false);
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pengguna"
        subtitle="Kelola peran staf klinik. Akun dan kata sandi dibuat melalui Supabase Authentication."
      />

      {isDemoMode && (
        <InlineNotice tone="info">
          Mode demo: perubahan pengguna hanya berlaku selama sesi browser ini.
        </InlineNotice>
      )}

      <Card>
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 text-small text-muted">
          <span>{data?.length ?? 0} pengguna terdaftar</span>
          <span className="hidden sm:inline">Peran mengontrol akses melalui RLS</span>
        </div>
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : 'Data tidak tersedia.'} onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="Belum ada pengguna" description="Tambahkan staf melalui Supabase Dashboard." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-small text-muted">
                  <th className="px-5 py-3 font-normal">Nama</th>
                  <th className="px-3 py-3 font-normal">Peran</th>
                  <th className="px-3 py-3 font-normal">Spesialisasi</th>
                  <th className="px-3 py-3 font-normal">No. SIP</th>
                  <th className="px-3 py-3 font-normal">Bergabung</th>
                  <th className="w-10 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {data.map((profile) => (
                  <tr key={profile.id} className="transition-colors hover:bg-raised">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                          {initials(profile.fullName)}
                        </span>
                        <span className="text-body font-medium text-ink">{profile.fullName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-body text-muted">{ROLE_LABELS[profile.role]}</td>
                    <td className="px-3 py-3 text-body text-muted">{profile.specialization || '—'}</td>
                    <td className="px-3 py-3 font-mono text-small text-muted">{profile.sipNumber || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-small tabular-nums text-muted">{formatDate(profile.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Ubah ${profile.fullName}`}
                        onClick={() => { setEditing(profile); setOpen(true); }}
                        className="inline-flex rounded p-1.5 text-muted hover:bg-active hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Ubah data pengguna" description={editing?.fullName}>
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
          {update.isError && <InlineNotice tone="error">{update.error.message}</InlineNotice>}
          <Field label="Nama lengkap" htmlFor="user-name" required error={form.formState.errors.fullName?.message}>
            <Input id="user-name" {...form.register('fullName')} />
          </Field>
          <Field label="Peran" htmlFor="user-role" required error={form.formState.errors.role?.message}>
            <Select id="user-role" {...form.register('role')}>
              <option value="admin">Admin</option>
              <option value="dokter">Dokter</option>
              <option value="perawat">Perawat / Resepsionis</option>
            </Select>
          </Field>
          <Field label="Spesialisasi" htmlFor="user-spec" error={form.formState.errors.specialization?.message}>
            <Input id="user-spec" placeholder="Khusus dokter" {...form.register('specialization')} />
          </Field>
          <Field label="Nomor SIP" htmlFor="user-sip" error={form.formState.errors.sipNumber?.message}>
            <Input id="user-sip" placeholder="Surat Izin Praktik" {...form.register('sipNumber')} />
          </Field>
          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <Button type="button" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" isLoading={update.isPending}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
