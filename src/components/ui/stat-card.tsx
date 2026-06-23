import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <div className="surface-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {loading ? '—' : value}
          </p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
