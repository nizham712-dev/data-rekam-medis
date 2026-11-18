import { cn } from '@/lib/cn';

export interface StatItem {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'accent';
}

export function StatStrip({ items, className }: { items: StatItem[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 divide-x divide-y divide-rule rounded-card border border-line bg-surface md:grid-cols-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0 px-5 py-4">
          <p className="text-small text-muted">{item.label}</p>
          <p
            className={cn(
              'mt-1 font-normal tabular-nums text-ink text-kpi',
              item.tone === 'accent' && 'text-accent',
            )}
          >
            {item.value}
          </p>
          {item.hint && <p className="mt-0.5 text-small text-faint">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}
