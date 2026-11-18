import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, UserRound } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePatient } from './usePatients';
import { PatientFormModal } from './PatientFormModal';
import { QueueModal } from '@/features/records/QueueModal';
import { useMedicalRecords } from '@/features/records/useMedicalRecords';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { AllergyAlert } from '@/components/ui/AllergyAlert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatAge } from '@/utils/age';
import { formatDate, formatDateTime, maskNik } from '@/utils/formatters';
import { GENDER_OPTIONS } from '@/utils/constants';

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-rule py-3 last:border-0">
      <dt className="shrink-0 text-body text-muted">{label}</dt>
      <dd className="text-right text-body text-ink">{value}</dd>
    </div>
  );
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'perawat';
  const [editOpen, setEditOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);

  const { data: patient, isLoading, isError, error, refetch } = usePatient(id);
  const records = useMedicalRecords({ patientId: id });

  if (isLoading) return <LoadingState label="Memuat data pasien…" />;
  if (isError || !patient) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-body text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke data pasien
        </Link>
        <ErrorState message={error instanceof Error ? error.message : 'Pasien tidak ditemukan.'} onRetry={() => void refetch()} />
      </div>
    );
  }

  const genderLabel = GENDER_OPTIONS.find((option) => option.value === patient.gender)?.label ?? patient.gender;

  return (
    <div className="flex flex-col gap-5">
      <Link to="/patients" className="inline-flex w-fit items-center gap-1.5 text-body text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Kembali ke data pasien
      </Link>

      <PageHeader
        title={patient.fullName}
        subtitle={<span>No. RM <span className="font-mono">{patient.noRm}</span> · Terdaftar {formatDate(patient.createdAt)}</span>}
        actions={
          canWrite ? (
            <>
              <Button onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" aria-hidden="true" /> Ubah data
              </Button>
              <Button variant="primary" onClick={() => setQueueOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Buka antrean
              </Button>
            </>
          ) : undefined
        }
      />

      <AllergyAlert allergies={patient.allergies} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Data pasien" />
          <dl className="px-5 pb-3">
            <InfoRow label="NIK" value={<span className="font-mono">{maskNik(patient.nik)}</span>} />
            <InfoRow label="Tanggal lahir" value={formatDate(patient.dateOfBirth)} />
            <InfoRow label="Umur" value={formatAge(patient.dateOfBirth)} />
            <InfoRow label="Jenis kelamin" value={genderLabel} />
            <InfoRow label="Golongan darah" value={patient.bloodType === 'Unknown' ? 'Tidak diketahui' : patient.bloodType} />
            <InfoRow label="Telepon" value={patient.phone} />
            <InfoRow label="Alamat" value={patient.address || '—'} />
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Riwayat kunjungan" action={<span className="text-small text-muted">{records.data?.length ?? 0} kunjungan</span>} />
          {records.isLoading ? (
            <LoadingState />
          ) : records.isError ? (
            <ErrorState message="Riwayat kunjungan gagal dimuat." onRetry={() => void records.refetch()} />
          ) : !records.data || records.data.length === 0 ? (
            <EmptyState title="Belum ada kunjungan" description="Buka antrean untuk mencatat kunjungan pertama pasien." />
          ) : (
            <ul className="divide-y divide-rule border-t border-rule">
              {records.data.map((record) => (
                <li key={record.id}>
                  <Link to={`/records/${record.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-raised">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active text-muted">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-medium text-ink">
                        {record.assessment || 'Kunjungan belum dinilai'}
                      </span>
                      <span className="mt-0.5 block text-small text-muted">
                        {formatDateTime(record.visitDate)} · {record.doctor.fullName}
                      </span>
                    </span>
                    <StatusBadge status={record.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <PatientFormModal open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <QueueModal open={queueOpen} onClose={() => setQueueOpen(false)} defaultPatientId={patient.id} />
    </div>
  );
}
