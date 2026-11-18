import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useMedicalRecord, useSaveSoap } from './useMedicalRecords';
import { VitalSignsCard } from './VitalSignsCard';
import { PrescriptionCard } from './PrescriptionCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, textareaClass } from '@/components/ui/Field';
import { AllergyAlert } from '@/components/ui/AllergyAlert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ErrorState, InlineNotice, LoadingState } from '@/components/ui/States';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { soapFormSchema, type SoapFormValues } from '@/utils/schemas';
import { formatAge } from '@/utils/age';
import { formatDateTime } from '@/utils/formatters';

export function SoapFormPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isDoctor = user?.role === 'dokter';
  const { data: record, isLoading, isError, error, refetch } = useMedicalRecord(id);
  const save = useSaveSoap();
  const [savedNotice, setSavedNotice] = useState('');

  const form = useForm<SoapFormValues>({
    resolver: zodResolver(soapFormSchema),
    defaultValues: {
      intent: 'draft',
      vitalSigns: { td: '', nadi: '', suhu: '', bb: '', tb: '' },
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    },
  });

  // Form diisi ulang setelah data kunjungan dimuat atau diperbarui.
  useEffect(() => {
    if (!record) return;
    form.reset({
      intent: 'draft',
      vitalSigns: {
        td: record.vitalSigns.td ?? '',
        nadi: record.vitalSigns.nadi ? String(record.vitalSigns.nadi) : '',
        suhu: record.vitalSigns.suhu ? String(record.vitalSigns.suhu) : '',
        bb: record.vitalSigns.bb ? String(record.vitalSigns.bb) : '',
        tb: record.vitalSigns.tb ? String(record.vitalSigns.tb) : '',
      },
      subjective: record.subjective,
      objective: record.objective,
      assessment: record.assessment,
      plan: record.plan,
    });
  }, [record?.id, record?.updatedAt, form]);

  if (isLoading) return <LoadingState label="Memuat catatan kunjungan…" />;
  if (isError || !record) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/records" className="inline-flex w-fit items-center gap-1.5 text-body text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke antrean
        </Link>
        <ErrorState message={error instanceof Error ? error.message : 'Kunjungan tidak ditemukan.'} onRetry={() => void refetch()} />
      </div>
    );
  }

  const locked = record.status === 'selesai';
  const readOnly = locked || !isDoctor;

  const onValid = async (values: SoapFormValues) => {
    setSavedNotice('');
    try {
      await save.mutateAsync({
        id: record.id,
        input: {
          vitalSigns: {
            td: values.vitalSigns.td.trim(),
            ...(values.vitalSigns.nadi ? { nadi: Number(values.vitalSigns.nadi) } : {}),
            ...(values.vitalSigns.suhu ? { suhu: Number(values.vitalSigns.suhu) } : {}),
            ...(values.vitalSigns.bb ? { bb: Number(values.vitalSigns.bb) } : {}),
            ...(values.vitalSigns.tb ? { tb: Number(values.vitalSigns.tb) } : {}),
          },
          subjective: values.subjective.trim(),
          objective: values.objective.trim(),
          assessment: values.assessment.trim(),
          plan: values.plan.trim(),
          status: values.intent === 'selesai' ? 'selesai' : 'diperiksa',
        },
      });
      setSavedNotice(values.intent === 'selesai' ? 'Kunjungan selesai. Rekam medis telah dikunci.' : 'Draf catatan tersimpan.');
    } catch {
      // Error ditampilkan dari state mutation.
    }
  };

  const submitWithIntent = (intent: SoapFormValues['intent']) => {
    form.setValue('intent', intent);
    void form.handleSubmit(onValid)();
  };

  return (
    <div className="flex flex-col gap-5">
      <Link to="/records" className="inline-flex w-fit items-center gap-1.5 text-body text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke antrean
      </Link>

      <PageHeader
        title="Catatan kunjungan"
        subtitle={
          <span>
            {record.patient.fullName} · <span className="font-mono">{record.patient.noRm}</span> · {formatAge(record.patient.dateOfBirth)} · {formatDateTime(record.visitDate)}
          </span>
        }
        actions={<StatusBadge status={record.status} />}
      />

      <AllergyAlert allergies={record.patient.allergies} />

      {locked && (
        <InlineNotice tone="info">
          <span className="inline-flex items-center gap-2">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Kunjungan sudah selesai. Catatan medis dikunci untuk menjaga integritas rekam medis.
          </span>
        </InlineNotice>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Catatan SOAP" />
            <form className="px-5 pb-5" noValidate onSubmit={(event) => event.preventDefault()}>
              <input type="hidden" {...form.register('intent')} />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tekanan darah" htmlFor="soap-td" error={form.formState.errors.vitalSigns?.td?.message}>
                    <input id="soap-td" className={textareaClass + ' h-10 py-2'} placeholder="120/80" disabled={readOnly} {...form.register('vitalSigns.td')} />
                  </Field>
                  <Field label="Nadi (x/menit)" htmlFor="soap-nadi" error={form.formState.errors.vitalSigns?.nadi?.message}>
                    <input id="soap-nadi" className={textareaClass + ' h-10 py-2'} inputMode="numeric" placeholder="78" disabled={readOnly} {...form.register('vitalSigns.nadi')} />
                  </Field>
                </div>

                <Field label="S — Keluhan utama & riwayat penyakit" htmlFor="soap-s" error={form.formState.errors.subjective?.message}>
                  <textarea id="soap-s" rows={3} className={textareaClass} placeholder="Keluhan yang dirasakan pasien…" disabled={readOnly} {...form.register('subjective')} />
                </Field>
                <Field label="O — Hasil pemeriksaan fisik" htmlFor="soap-o" error={form.formState.errors.objective?.message}>
                  <textarea id="soap-o" rows={3} className={textareaClass} placeholder="Temuan pemeriksaan…" disabled={readOnly} {...form.register('objective')} />
                </Field>
                <Field label="A — Diagnosis kerja / kode ICD-10" htmlFor="soap-a" error={form.formState.errors.assessment?.message}>
                  <textarea id="soap-a" rows={2} className={textareaClass} placeholder="Contoh: R51.9 — Nyeri kepala" disabled={readOnly} {...form.register('assessment')} />
                </Field>
                <Field label="P — Rencana terapi, edukasi, dan rujukan" htmlFor="soap-p" error={form.formState.errors.plan?.message}>
                  <textarea id="soap-p" rows={3} className={textareaClass} placeholder="Rencana pengobatan dan tindak lanjut…" disabled={readOnly} {...form.register('plan')} />
                </Field>

                {save.isError && <InlineNotice tone="error">{save.error.message}</InlineNotice>}
                {savedNotice && <InlineNotice tone="success">{savedNotice}</InlineNotice>}

                {!readOnly && (
                  <div className="flex flex-wrap gap-2 border-t border-rule pt-4">
                    <Button type="button" isLoading={save.isPending} onClick={() => submitWithIntent('draft')}>
                      Simpan draf
                    </Button>
                    <Button type="button" variant="primary" isLoading={save.isPending} onClick={() => submitWithIntent('selesai')}>
                      Selesaikan kunjungan
                    </Button>
                  </div>
                )}
                {!isDoctor && !locked && (
                  <InlineNotice tone="info">Hanya dokter yang dapat mengisi dan menyelesaikan catatan SOAP.</InlineNotice>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Info kunjungan" />
            <dl className="px-5 pb-3">
              <div className="flex justify-between gap-4 border-b border-rule py-2.5">
                <dt className="text-body text-muted">Dokter</dt>
                <dd className="text-right text-body text-ink">{record.doctor.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-rule py-2.5">
                <dt className="text-body text-muted">Datang</dt>
                <dd className="text-right text-small tabular-nums text-ink">{formatDateTime(record.visitDate)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-body text-muted">Status</dt>
                <dd className="text-right"><StatusBadge status={record.status} /></dd>
              </div>
            </dl>
            <div className="px-5 pb-4">
              <Link to={`/patients/${record.patientId}`} className="text-body font-medium text-accent hover:underline">
                Lihat profil pasien
              </Link>
            </div>
          </Card>

          <VitalSignsCard record={record} role={user?.role ?? 'perawat'} />
          <PrescriptionCard recordId={record.id} prescriptions={record.prescriptions} locked={locked} />
        </div>
      </div>
    </div>
  );
}
