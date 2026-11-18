import { cn } from '@/lib/cn';

export interface TabItem<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange(value: T): void;
  className?: string;
}

export function Tabs<T extends string>({ items, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-6 overflow-x-auto border-b border-line', className)} role="tablist">
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={cn(
              'relative shrink-0 whitespace-nowrap pb-3 pt-1 text-body transition-colors',
              selected ? 'font-medium text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-1.5 text-small tabular-nums text-faint">({item.count})</span>
            )}
            {selected && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}
