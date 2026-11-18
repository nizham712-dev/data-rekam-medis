import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AllergyAlertProps {
  allergies: string | null;
  className?: string;
  compact?: boolean;
}

/** Peringatan alergi WAJIB muncul di halaman pemeriksaan bila data alergi tidak kosong. */
export function AllergyAlert({ allergies, className, compact = false }: AllergyAlertProps) {
  if (!allergies?.trim()) return null;
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-card bg-rose-50 text-rose-900',
        compact ? 'px-3 py-2' : 'px-4 py-3',
        className,
      )}
    >
      <AlertTriangle className={compact ? 'mt-0.5 h-4 w-4 shrink-0' : 'mt-0.5 h-5 w-5 shrink-0'} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-body font-semibold">Peringatan alergi</p>
        <p className="text-body">{allergies}</p>
      </div>
    </div>
  );
}
