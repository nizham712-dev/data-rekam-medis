import type { RecordStatus } from '@/types';
import { STATUS_META, statusPillClass } from '@/utils/constants';
import { cn } from '@/lib/cn';

export function StatusBadge({ status, showDot = true }: { status: RecordStatus; showDot?: boolean }) {
  return (
    <span className={statusPillClass(status)}>
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[status].dot)} />}
      {STATUS_META[status].label}
    </span>
  );
}
