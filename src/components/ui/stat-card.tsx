import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type StatAccent = 'blue' | 'teal' | 'amber' | 'emerald' | 'violet' | 'rose';

const accentStyles: Record<StatAccent, { card: string; icon: string }> = {
  blue: {
    card: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30',
    icon: 'bg-white/20 text-white',
  },
  teal: {
    card: 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-teal-500/30',
    icon: 'bg-white/20 text-white',
  },
  amber: {
    card: 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30',
    icon: 'bg-white/20 text-white',
  },
  emerald: {
    card: 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30',
    icon: 'bg-white/20 text-white',
  },
  violet: {
    card: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30',
    icon: 'bg-white/20 text-white',
  },
  rose: {
    card: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
    icon: 'bg-white/20 text-white',
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  loading?: boolean;
  accent?: StatAccent;
}

export function StatCard({ title, value, icon: Icon, trend, loading, accent = 'blue' }: StatCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl',
        style.card,
      )}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-2 h-20 w-20 rounded-full bg-black/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">{title}</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight drop-shadow-sm">
            {loading ? '—' : value}
          </p>
          {trend && <p className="text-xs font-medium text-white/75 truncate">{trend}</p>}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm', style.icon)}>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
