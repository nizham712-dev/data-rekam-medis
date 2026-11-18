import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useMedicalRecords } from './useMedicalRecords';
import { QueueModal } from './QueueModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDate, formatTime, initials } from '@/utils/formatters';
import { ALLERGY_PILL } from '@/utils/constants';
import { cn } from '@/lib/cn';
import type { RecordStatus } from '@/types';

type TabKey = 'semua' | RecordStatus;

const tabs: { key: TabKey; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'antrean', label: 'Antrean' },
  { key: 'diperiksa', label: 'Diperiksa' },
  { key: 'selesai', label: 'Selesai' },
];

export function RecordsPage() {
  const { user } = useAuth();
  const canQueue = user?.role === 'admin' || user?.role === 'perawat';
  const [tab, setTab] = useState<TabKey>('semua');
  const [queueOpen, setQueueOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useMedicalRecords();

  const records = data ?? [];
  const counts: Record<TabKey, number> = {
    semua: records.length,
    antrean: records.filter((item) => item.status === 'antrean').length,
    diperiksa: records.filter((item) => item.status === 'diperiksa').length,
    selesai: records.filter((item) => item.status === 'selesai').length,
  };
  const visible = tab === 'semua' ? records : records.filter((item) => item.status === tab);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Antrean & Rekam Medis"
        subtitle="Kelola kunjungan dari pendaftaran hingga catatan selesai."
        actions={
          canQueue ? (
            <Button variant="primary" onClick={() => setQueueOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Buka antrean
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="px-5 pt-1">
          <Tabs<TabKey>
            items={tabs.map((item) => ({ ...item, count: counts[item.key] }))}
            active={tab}
            onChange={setTab}
          />
        </div>
        <div className="flex items-center justify-between border-b border-rule px-5 py-3 text-small text-muted">
          <span>{visible.length} kunjungan ditampilkan</span>
          <span className="hidden sm:inline">Diurutkan dari kunjungan terbaru</span>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : 'Data tidak tersedia.'} onRetry={() => void refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Tidak ada kunjungan pada kategori ini"
            description="Perubahan status kunjungan akan tampil di sini secara otomatis."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="text-small text-muted">
                    <th className="px-5 py-3 font-normal">Pasien</th>
                    <th className="px-3 py-3 font-normal">No. RM</th>
                    <th className="px-3 py-3 font-normal">Dokter</th>
                    <th className="px-3 py-3 font-normal">Kunjungan</th>
                    <th className="px-3 py-3 font-normal">Status</th>
                    <th className="w-10 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {visible.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-raised">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                            {initials(record.patient.fullName)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-body font-medium text-ink">{record.patient.fullName}</span>
                            {record.patient.allergies && (
                              <span className={cn('mt-1 inline-block rounded px-1.5 py-0.5 text-[11px]', ALLERGY_PILL)}>
                                Alergi: {record.patient.allergies}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-small text-muted">{record.patient.noRm}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-body text-muted">{record.doctor.fullName}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-small tabular-nums text-muted">
                        {formatDate(record.visitDate)} · {formatTime(record.visitDate)}
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={record.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/records/${record.id}`}
                          aria-label={`Buka catatan ${record.patient.fullName}`}
                          className="inline-flex rounded p-1.5 text-muted hover:bg-active hover:text-ink"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-rule md:hidden">
              {visible.map((record) => (
                <li key={record.id}>
                  <Link to={`/records/${record.id}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                      {initials(record.patient.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-body font-medium text-ink">{record.patient.fullName}</span>
                        {record.patient.allergies && <span className={cn('rounded px-1.5 py-0.5 text-[11px]', ALLERGY_PILL)}>Alergi</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-small text-muted">
                        <span className="font-mono">{record.patient.noRm}</span> · {formatDate(record.visitDate)} {formatTime(record.visitDate)}
                      </span>
                    </span>
                    <StatusBadge status={record.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <QueueModal open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}
