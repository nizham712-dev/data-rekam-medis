import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthContext';
import { useUpdateUser } from './useUsers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { InlineNotice } from '@/components/ui/States';
import { ROLE_LABELS } from '@/utils/constants';
import { profileFormSchema, type ProfileFormValues } from '@/utils/schemas';

export function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const update = useUpdateUser();
  const [notice, setNotice] = useState('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: '', specialization: '', sipNumber: '' },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      fullName: user.fullName,
      specialization: user.specialization ?? '',
      sipNumber: user.sipNumber ?? '',
    });
  }, [user, form]);

  const submit = async (values: ProfileFormValues) => {
    if (!user) return;
    setNotice('');
    try {
      await update.mutateAsync({ id: user.id, input: values });
      await refreshProfile();
      setNotice('Profil berhasil disimpan.');
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  if (!user) return null;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title="Profil Saya" subtitle="Perbarui data diri yang tampil pada catatan kunjungan." />

      <Card>
        <CardHeader title="Data diri" />
        <form onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-4 px-5 pb-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="profile-name" required error={form.formState.errors.fullName?.message}>
              <Input id="profile-name" {...form.register('fullName')} />
            </Field>
            <Field label="Email" htmlFor="profile-email">
              <Input id="profile-email" value={user.email} disabled readOnly />
            </Field>
            <Field label="Peran" htmlFor="profile-role">
              <Input id="profile-role" value={ROLE_LABELS[user.role]} disabled readOnly />
            </Field>
            <Field label="Spesialisasi" htmlFor="profile-spec" error={form.formState.errors.specialization?.message}>
              <Input id="profile-spec" placeholder="Khusus dokter" {...form.register('specialization')} />
            </Field>
            <Field label="Nomor SIP" htmlFor="profile-sip" error={form.formState.errors.sipNumber?.message}>
              <Input id="profile-sip" placeholder="Surat Izin Praktik" {...form.register('sipNumber')} />
            </Field>
          </div>
          {update.isError && <InlineNotice tone="error">{update.error.message}</InlineNotice>}
          {notice && <InlineNotice tone="success">{notice}</InlineNotice>}
          <div className="flex justify-end border-t border-rule pt-4">
            <Button type="submit" variant="primary" isLoading={update.isPending}>Simpan profil</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
