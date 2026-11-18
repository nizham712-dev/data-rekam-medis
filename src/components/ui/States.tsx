import type { ReactNode } from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function LoadingState({ label = 'Memuat data…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center gap-3 text-muted', className)}>
      <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden="true" />
      <p className="text-body">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-40 flex-col items-center justify-center gap-2 px-5 py-10 text-center', className)}>
      <Inbox className="h-6 w-6 text-faint" aria-hidden="true" />
      <p className="text-body font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-body text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-40 flex-col items-start justify-center gap-2 px-5 py-8', className)}>
      <div className="flex items-center gap-2 text-negative">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <p className="text-body font-medium">Gagal memuat data</p>
      </div>
      <p className="text-body text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-1 text-body font-medium text-accent hover:underline">
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function InlineNotice({
  tone = 'success',
  children,
}: {
  tone?: 'success' | 'error' | 'info';
  children: ReactNode;
}) {
  const tones = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-sky-50 border-sky-200 text-sky-900',
  } as const;
  return <div className={`rounded-card border px-3 py-2.5 text-body ${tones[tone]}`}>{children}</div>;
}
