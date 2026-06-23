'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Users, Briefcase, Receipt, TrendingUp, FileText, DollarSign, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Kpis {
  customers: { total: number };
  projects: { active: number };
  quotations: { pending: number };
  invoices: { outstandingCount: number; outstandingAmount: number };
  revenue: { monthly: number; ytd: number };
  expenses: { monthly: number };
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    module: string;
    createdAt: string;
    user?: { firstName: string; lastName: string };
  }>;
}

const MODULE_STYLES: Record<string, { border: string; bg: string; label: string }> = {
  quotations: { border: 'border-l-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/40', label: 'text-violet-700 dark:text-violet-300' },
  invoices: { border: 'border-l-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/40', label: 'text-sky-700 dark:text-sky-300' },
  customers: { border: 'border-l-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/40', label: 'text-teal-700 dark:text-teal-300' },
  projects: { border: 'border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'text-amber-700 dark:text-amber-300' },
  expenses: { border: 'border-l-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/40', label: 'text-rose-700 dark:text-rose-300' },
  auth: { border: 'border-l-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40', label: 'text-indigo-700 dark:text-indigo-300' },
  default: { border: 'border-l-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/40', label: 'text-slate-700 dark:text-slate-300' },
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/kpis');
      return (data.data || data) as Kpis;
    },
  });

  const netMonthly = (data?.revenue.monthly ?? 0) - (data?.expenses.monthly ?? 0);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const financeRows = [
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.revenue.monthly ?? 0),
      gradient: 'from-emerald-500 to-green-600',
      text: 'text-white',
    },
    {
      label: 'Year to Date',
      value: formatCurrency(data?.revenue.ytd ?? 0),
      gradient: 'from-blue-500 to-indigo-600',
      text: 'text-white',
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(data?.expenses.monthly ?? 0),
      gradient: 'from-rose-500 to-red-600',
      text: 'text-white',
    },
    {
      label: 'Net Position',
      value: formatCurrency(netMonthly),
      gradient: netMonthly >= 0 ? 'from-amber-400 to-orange-500' : 'from-red-500 to-rose-600',
      text: 'text-white',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Vibrant welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 px-6 py-6 shadow-xl shadow-blue-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
          <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-yellow-400/20 blur-2xl" />
          <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-pink-400/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-yellow-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">{greeting}</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                {user ? `${user.firstName} ${user.lastName}` : 'Welcome back'} 👋
              </h1>
              <p className="mt-1 text-sm font-medium text-blue-100">
                Your business at a glance — live numbers, no blur.
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Customers', val: data?.customers.total ?? 0, color: 'bg-white/20' },
                { label: 'Projects', val: data?.projects.active ?? 0, color: 'bg-white/20' },
                { label: 'Quotes', val: data?.quotations.pending ?? 0, color: 'bg-white/20' },
              ].map((chip) => (
                <div key={chip.label} className={cn('rounded-xl px-4 py-2 text-center backdrop-blur-sm', chip.color)}>
                  <p className="text-xl font-bold text-white">{isLoading ? '—' : chip.val}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{chip.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bold gradient stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Customers" value={data?.customers.total ?? 0} icon={Users} accent="teal" loading={isLoading} />
          <StatCard title="Active Projects" value={data?.projects.active ?? 0} icon={Briefcase} accent="amber" loading={isLoading} />
          <StatCard title="Pending Quotations" value={data?.quotations.pending ?? 0} icon={FileText} accent="violet" loading={isLoading} />
          <StatCard
            title="Outstanding Invoices"
            value={formatCurrency(data?.invoices.outstandingAmount ?? 0)}
            icon={Receipt}
            accent="blue"
            trend={`${data?.invoices.outstandingCount ?? 0} open invoices`}
            loading={isLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(data?.revenue.monthly ?? 0)}
            icon={TrendingUp}
            accent="emerald"
            trend={`YTD ${formatCurrency(data?.revenue.ytd ?? 0)}`}
            loading={isLoading}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(data?.expenses.monthly ?? 0)}
            icon={DollarSign}
            accent="rose"
            trend={`Net ${formatCurrency(netMonthly)}`}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* Colorful financial blocks */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <DollarSign className="h-4 w-4 text-amber-500" />
              Financial Summary
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {financeRows.map((row) => (
                <div
                  key={row.label}
                  className={cn(
                    'flex items-center justify-between rounded-xl bg-gradient-to-r px-5 py-4 shadow-md',
                    row.gradient,
                  )}
                >
                  <span className={cn('text-sm font-semibold', row.text, 'opacity-90')}>{row.label}</span>
                  <span className={cn('text-lg font-bold tabular-nums', row.text)}>
                    {isLoading ? '—' : row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity with color chips */}
          <div className="lg:col-span-3 rounded-xl border-2 border-indigo-200 bg-white p-5 shadow-md dark:border-indigo-900 dark:bg-card">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
              <Activity className="h-4 w-4 text-indigo-500" />
              Recent Activity
            </h2>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {isLoading && (
                <p className="text-sm text-muted-foreground py-4">Loading activity feed…</p>
              )}
              {data?.recentActivities?.map((activity) => {
                const style = MODULE_STYLES[activity.module] ?? MODULE_STYLES.default;
                return (
                  <div
                    key={activity.id}
                    className={cn(
                      'flex gap-3 rounded-lg border-l-4 px-3 py-3 transition-all hover:shadow-sm',
                      style.border,
                      style.bg,
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className={cn('mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase', style.bg, style.label)}>
                        {activity.module}
                      </span>
                      <p className="text-sm font-medium text-foreground">{activity.description}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {activity.user ? `${activity.user.firstName} ${activity.user.lastName} · ` : ''}
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {!isLoading && !data?.recentActivities?.length && (
                <p className="text-sm text-muted-foreground py-4">No recent activity recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
