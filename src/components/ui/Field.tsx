import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-body font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-negative">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-small text-negative" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-small text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  'h-10 w-full rounded-control border border-control bg-white px-3 text-body text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-raised disabled:text-muted';

export const textareaClass =
  'w-full rounded-control border border-control bg-white px-3 py-2.5 text-body leading-relaxed text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-raised';
