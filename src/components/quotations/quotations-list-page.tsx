'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Plus, Eye, Printer, Pencil, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, Send,
  CheckCircle2, XCircle, Clock, List,
} from 'lucide-react';
import { api, PaginatedResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Quotation {
  id: string;
  number: string;
  title: string;
  status: string;
  total: number;
  issueDate: string;
  revision?: number;
  toName?: string;
  projectName?: string;
  customer: { name: string } | null;
}

type StatusTab = 'ALL' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'PENDING_APPROVAL';

const STATUS_TABS: { key: StatusTab; label: string; icon: typeof List }[] = [
  { key: 'ALL', label: 'All', icon: List },
  { key: 'DRAFT', label: 'Draft', icon: FileText },
  { key: 'SENT', label: 'Sent', icon: Send },
  { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle },
  { key: 'EXPIRED', label: 'Expired', icon: Clock },
];

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'text-muted-foreground',
  PENDING_APPROVAL: 'text-amber-700 dark:text-amber-500',
  APPROVED: 'text-primary',
  REJECTED: 'text-destructive',
  SENT: 'text-foreground',
  ACCEPTED: 'text-emerald-700 dark:text-emerald-500',
  EXPIRED: 'text-orange-700 dark:text-orange-500',
  CANCELLED: 'text-muted-foreground',
};

const TH = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground';
const TD = 'px-3 py-2.5 text-sm text-foreground';
const FILTER_CELL = 'px-2 py-1.5';

function formatTableDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return Number(value ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function RowAction({
  href, title, icon: Icon, external,
}: {
  href: string;
  title: string;
  icon: typeof Eye;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      title={title}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </Link>
  );
}

export function QuotationsListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [filters, setFilters] = useState({
    date: '',
    number: '',
    customer: '',
    subject: '',
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['quotations', page, pageSize, statusTab, filters.number, filters.customer, filters.subject],
    queryFn: async () => {
      const search = [filters.number, filters.customer, filters.subject].filter(Boolean).join(' ') || undefined;
      const { data: res } = await api.get('/quotations', {
        params: {
          page,
          limit: pageSize,
          search,
          status: statusTab === 'ALL' ? undefined : statusTab,
        },
      });
      return (res.data || res) as PaginatedResponse<Quotation>;
    },
  });

  const rows = useMemo(() => {
    const list = data?.data ?? [];
    if (!filters.date) return list;
    return list.filter((q) => formatTableDate(q.issueDate) === filters.date);
  }, [data?.data, filters.date]);

  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <DashboardLayout fullWidth>
      <div className="flex h-full min-h-0 flex-col gap-3">
        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Quotations</h1>
            <p className="text-xs text-muted-foreground">
              Manage quotations, revisions, and print
            </p>
          </div>
          <Link href="/quotations/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New quotation
            </Button>
          </Link>
        </div>

        {/* Main panel — full width */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
          {/* Status tabs */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
            {STATUS_TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setStatusTab(key); setPage(1); }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  statusTab === key
                    ? 'bg-card text-primary shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 text-muted-foreground"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            </Button>
          </div>

          {/* Table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                <tr className="border-b border-border">
                  <th className={TH}>Date</th>
                  <th className={TH}>Quotation Code</th>
                  <th className={TH}>Customer</th>
                  <th className={TH}>Subject</th>
                  <th className={TH}>Status</th>
                  <th className={cn(TH, 'text-right')}>Total (AED)</th>
                  <th className={cn(TH, 'text-center w-[110px]')}>Actions</th>
                </tr>
                <tr className="border-b border-border bg-card">
                  <th className={FILTER_CELL}>
                    <Input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilter('date', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </th>
                  <th className={FILTER_CELL}>
                    <Input
                      placeholder="Filter"
                      value={filters.number}
                      onChange={(e) => setFilter('number', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </th>
                  <th className={FILTER_CELL}>
                    <Input
                      placeholder="Filter"
                      value={filters.customer}
                      onChange={(e) => setFilter('customer', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </th>
                  <th className={FILTER_CELL}>
                    <Input
                      placeholder="Filter"
                      value={filters.subject}
                      onChange={(e) => setFilter('subject', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </th>
                  <th className={FILTER_CELL} />
                  <th className={FILTER_CELL} />
                  <th className={FILTER_CELL} />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center text-sm text-muted-foreground">
                      Loading quotations…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-12 text-center">
                      <p className="text-sm font-medium text-foreground">No quotations found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Adjust filters or create a new quotation.
                      </p>
                      <Link href="/quotations/new" className="mt-3 inline-block">
                        <Button size="sm">
                          <Plus className="h-4 w-4" />
                          New quotation
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const customer = row.toName || row.customer?.name || '—';
                    const status = row.status?.toUpperCase() ?? 'DRAFT';
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer"
                        onClick={() => router.push(`/quotations/${row.id}`)}
                      >
                        <td className={cn(TD, 'tabular-nums')}>{formatTableDate(row.issueDate)}</td>
                        <td className={cn(TD, 'font-medium')}>{row.number}</td>
                        <td className={cn(TD, 'max-w-[200px] truncate')} title={customer}>{customer}</td>
                        <td className={cn(TD, 'max-w-[260px] truncate')} title={row.title}>{row.title}</td>
                        <td className={cn(TD, 'font-medium', STATUS_COLOR[status])}>
                          {STATUS_LABEL[status] ?? status}
                        </td>
                        <td className={cn(TD, 'text-right tabular-nums font-medium')}>
                          {formatMoney(Number(row.total))}
                        </td>
                        <td className={TD} onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <RowAction href={`/quotations/${row.id}`} title="View" icon={Eye} />
                            <RowAction href={`/quotations/${row.id}/print`} title="Print" icon={Printer} external />
                            <RowAction href={`/quotations/${row.id}`} title="Edit" icon={Pencil} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5">
                <span>Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
                >
                  {[10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
              <span>
                {from}–{to} of {total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7 bg-background" disabled={page <= 1} onClick={() => setPage(1)}>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 bg-background" disabled={!data?.meta?.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="icon" className="h-7 w-7 bg-background" disabled={!data?.meta?.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7 bg-background" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
