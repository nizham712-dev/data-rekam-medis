import { cn } from '@/lib/cn';

const clinicName = (import.meta.env.VITE_CLINIC_NAME ?? '').trim() || 'Klinik Sehat Bersama';

export function clinicLabel(): string {
  return clinicName;
}

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-accent">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5V14.5H3v-5h6.5z" fill="#fff" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-body font-semibold text-ink">RekamMedis</span>
        {!compact && <span className="block truncate text-small text-muted">{clinicName}</span>}
      </span>
    </div>
  );
}
