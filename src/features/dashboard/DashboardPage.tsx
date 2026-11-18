import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Clock3 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useDashboard } from './useDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatStrip } from '@/components/ui/StatStrip';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VisitChart } from '@/components/ui/VisitChart';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDate, formatTime, initials } from '@/utils/formatters';
import { formatAge } from '@/utils/age';
import { ALLERGY_PILL } from '@/utils/constants';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const { user } = useAuth();

  if (isLoading) return <LoadingState label="Memuat ringkasan klinik…" />;
  if (isError || !data) {
    return <ErrorState message={error instanceof Error ? error.message : 'Data tidak tersedia.'} onRetry={() => void refetch()} />;
  }

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const totalVisits = data.weeklyVisits.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Ringkasan kunjungan — ${todayLabel}`}
        actions={
          <Link
            to="/records"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-control border border-primary bg-primary px-4 text-body font-medium text-white transition-colors hover:bg-primary/90"
          >
            Buka antrean
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <StatStrip
        items={[
          { label: 'Menunggu', value: data.todayQueue, hint: 'Belum diperiksa', tone: 'accent' },
          { label: 'Sedang diperiksa', value: data.inProgress, hint: 'Dalam ruang dokter' },
          { label: 'Selesai hari ini', value: data.completedToday, hint: 'Rekam medis terkunci' },
          { label: 'Total pasien', value: data.totalPatients, hint: 'Terdaftar' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Antrean hari ini"
            action={
              <Link to="/records" className="inline-flex items-center gap-1 text-body font-medium text-accent hover:underline">
                Lihat semua
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
          {data.queue.length === 0 ? (
            <EmptyState title="Tidak ada antrean aktif" description="Antrean baru akan muncul saat pasien mendaftar kunjungan." />
          ) : (
            <ul className="divide-y divide-rule border-t border-rule">
              {data.queue.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/records/${item.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-raised"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                      {initials(item.patient.fullName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-body font-medium text-ink">{item.patient.fullName}</span>
                        {item.patient.allergies && (
                          <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium', ALLERGY_PILL)}>
                            Alergi
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-small text-muted">
                        <span className="font-mono">{item.patient.noRm}</span> · {formatAge(item.patient.dateOfBirth)} · {item.doctor.fullName}
                      </span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1.5 text-small text-muted sm:flex">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="tabular-nums">{formatTime(item.visitDate)}</span>
                    </span>
                    <StatusBadge status={item.status} />
                    <ChevronRight className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-rule px-5 py-3 text-small text-muted">
            <span>{data.queue.length} kunjungan aktif</span>
            <span>{user?.role === 'dokter' ? 'Catatan SOAP siap diisi' : 'Antrean diperbarui otomatis'}</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Kunjungan 7 hari" />
          <div className="px-3 pb-2">
            <VisitChart data={data.weeklyVisits} />
          </div>
          <p className="border-t border-rule px-5 py-3 text-body text-muted">
            <span className="font-medium tabular-nums text-ink">{totalVisits} kunjungan</span> dalam minggu ini,
            termasuk {data.completedToday} yang selesai hari ini.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Rekam medis terbaru" />
        {data.recentRecords.length === 0 ? (
          <EmptyState title="Belum ada rekam medis selesai" description="Catatan yang telah diselesaikan dokter tampil di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="text-small text-muted">
                  <th className="px-5 py-3 font-normal">Pasien</th>
                  <th className="px-3 py-3 font-normal">No. RM</th>
                  <th className="px-3 py-3 font-normal">Dokter</th>
                  <th className="px-3 py-3 font-normal">Tanggal</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="w-10 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {data.recentRecords.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-raised">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
                          {initials(item.patient.fullName)}
                        </span>
                        <span className="truncate text-body font-medium text-ink">{item.patient.fullName}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-small text-muted">{item.patient.noRm}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-body text-muted">{item.doctor.fullName}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-small tabular-nums text-muted">{formatDate(item.visitDate)}</td>
                    <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/records/${item.id}`}
                        aria-label={`Buka rekam medis ${item.patient.fullName}`}
                        className="inline-flex rounded p-1 text-muted hover:bg-active hover:text-ink"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
