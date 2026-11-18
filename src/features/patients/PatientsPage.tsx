import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Pencil, Plus, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { usePatients } from './usePatients';
import { PatientFormModal } from './PatientFormModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Input } from '@/components/ui/Input';
import { formatAge } from '@/utils/age';
import { formatDate, initials, maskNik } from '@/utils/formatters';
import { ALLERGY_PILL } from '@/utils/constants';
import { cn } from '@/lib/cn';
import type { Patient } from '@/types';

export function PatientsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'perawat';
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(queryParam);
  const [search, setSearch] = useState(queryParam);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  useEffect(() => {
    if (queryParam) setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isError, error, refetch } = usePatients(search);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Pasien"
        subtitle="Cari berdasarkan nama, Nomor Rekam Medis, atau NIK."
        actions={
          canWrite ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Daftarkan pasien
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-rule px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
            <Input
              aria-label="Cari pasien"
              placeholder="Cari nama, No. RM, atau NIK"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="shrink-0 text-small text-muted">
            {isLoading ? 'Mencari…' : `${data?.length ?? 0} pasien ditemukan`}
          </p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : 'Data tidak tersedia.'} onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title={search ? 'Pasien tidak ditemukan' : 'Belum ada pasien terdaftar'}
            description={search ? 'Coba kata kunci lain.' : 'Daftarkan pasien pertama untuk mulai mencatat kunjungan.'}
            action={canWrite && !search ? <Button variant="primary" onClick={openCreate}>Daftarkan pasien</Button> : undefined}
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="text-small text-muted">
                    <th className="px-5 py-3 font-normal">Pasien</th>
                    <th className="px-3 py-3 font-normal">No. RM</th>
                    <th className="px-3 py-3 font-normal">NIK</th>
                    <th className="px-3 py-3 font-normal">Umur</th>
                    <th className="px-3 py-3 font-normal">Gol. darah</th>
                    <th className="px-3 py-3 font-normal">Telepon</th>
                    <th className="w-10 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {data.map((patient) => (
                    <tr key={patient.id} className="transition-colors hover:bg-raised">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                            {initials(patient.fullName)}
                          </span>
                          <span className="min-w-0">
                            <Link to={`/patients/${patient.id}`} className="block truncate text-body font-medium text-ink hover:underline">
                              {patient.fullName}
                            </Link>
                            {patient.allergies && (
                              <span className={cn('mt-1 inline-block rounded px-1.5 py-0.5 text-[11px]', ALLERGY_PILL)}>
                                Alergi: {patient.allergies}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-small text-muted">{patient.noRm}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-small text-muted">{maskNik(patient.nik)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-small tabular-nums text-muted">{formatAge(patient.dateOfBirth)}</td>
                      <td className="px-3 py-3 text-small text-muted">{patient.bloodType === 'Unknown' ? '—' : patient.bloodType}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-small tabular-nums text-muted">{patient.phone}</td>
                      <td className="px-5 py-3 text-right">
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => openEdit(patient)}
                            aria-label={`Ubah ${patient.fullName}`}
                            className="inline-flex rounded p-1.5 text-muted hover:bg-active hover:text-ink"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-rule md:hidden">
              {data.map((patient) => (
                <li key={patient.id}>
                  <Link to={`/patients/${patient.id}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                      {initials(patient.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-body font-medium text-ink">{patient.fullName}</span>
                        {patient.allergies && <span className={cn('rounded px-1.5 py-0.5 text-[11px]', ALLERGY_PILL)}>Alergi</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-small text-muted">
                        <span className="font-mono">{patient.noRm}</span> · {formatAge(patient.dateOfBirth)} · {formatDate(patient.createdAt)}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <PatientFormModal open={modalOpen} onClose={() => setModalOpen(false)} patient={editing} />
    </div>
  );
}
