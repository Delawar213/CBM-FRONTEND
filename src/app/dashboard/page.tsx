'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Receipt, TrendingUp, FileText, DollarSign } from 'lucide-react';

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

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/kpis');
      return (data.data || data) as Kpis;
    },
  });

  const netMonthly = (data?.revenue.monthly ?? 0) - (data?.expenses.monthly ?? 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Executive Overview"
          description="Real-time snapshot of company performance, financials, and operational activity."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Customers" value={data?.customers.total ?? 0} icon={Users} loading={isLoading} />
          <StatCard title="Active Projects" value={data?.projects.active ?? 0} icon={Briefcase} loading={isLoading} />
          <StatCard title="Pending Quotations" value={data?.quotations.pending ?? 0} icon={FileText} loading={isLoading} />
          <StatCard
            title="Outstanding Invoices"
            value={formatCurrency(data?.invoices.outstandingAmount ?? 0)}
            icon={Receipt}
            trend={`${data?.invoices.outstandingCount ?? 0} open invoices`}
            loading={isLoading}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(data?.revenue.monthly ?? 0)}
            icon={TrendingUp}
            trend={`YTD ${formatCurrency(data?.revenue.ytd ?? 0)}`}
            loading={isLoading}
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(data?.expenses.monthly ?? 0)}
            icon={DollarSign}
            trend={`Net ${formatCurrency(netMonthly)}`}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Monthly Revenue', value: formatCurrency(data?.revenue.monthly ?? 0) },
                { label: 'Year to Date', value: formatCurrency(data?.revenue.ytd ?? 0) },
                { label: 'Monthly Expenses', value: formatCurrency(data?.expenses.monthly ?? 0) },
                { label: 'Net Position', value: formatCurrency(netMonthly), highlight: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={row.highlight ? 'text-sm font-semibold text-foreground' : 'text-sm font-medium tabular-nums'}>
                    {isLoading ? '—' : row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && (
                  <p className="text-sm text-muted-foreground">Loading activity feed…</p>
                )}
                {data?.recentActivities?.map((activity) => (
                  <div key={activity.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.user ? `${activity.user.firstName} ${activity.user.lastName} · ` : ''}
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {!isLoading && !data?.recentActivities?.length && (
                  <p className="text-sm text-muted-foreground">No recent activity recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
