'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { ColDef, GridOptions } from 'ag-grid-community';
import type { LucideIcon } from 'lucide-react';
import {
  Plus, ChevronLeft, ChevronRight, Search, Download,
  SlidersHorizontal, RefreshCw, Users, FileText, Receipt,
  Quote, Briefcase, FolderOpen,
} from 'lucide-react';
import { api, PaginatedResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AgDataGrid } from '@/components/ui/ag-grid';
import { StatusCellRenderer } from '@/components/ui/grid-status-cell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ModuleListPageProps<T> {
  title: string;
  description: string;
  endpoint: string;
  columnDefs: ColDef<T>[];
  queryKey: string;
  icon?: LucideIcon;
  createLabel?: string;
  createHref?: string;
  detailHref?: (row: T) => string;
  extraColumnDefs?: ColDef<T>[];
  gridOptions?: GridOptions<T>;
}

const moduleIcons: Record<string, LucideIcon> = {
  customers: Users,
  documents: FolderOpen,
  quotations: Quote,
  invoices: Receipt,
  expenses: FileText,
  projects: Briefcase,
};

function enhanceColumns<T>(columnDefs: ColDef<T>[]): ColDef<T>[] {
  return columnDefs.map((col) => {
    if (col.field === 'status' || col.headerName === 'Status') {
      return {
        ...col,
        cellRenderer: StatusCellRenderer,
        minWidth: 130,
        maxWidth: 160,
      };
    }
    return col;
  });
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export function ModuleListPage<T extends object>({
  title,
  description,
  endpoint,
  columnDefs,
  queryKey,
  icon,
  createLabel = 'New record',
  createHref,
  detailHref,
  extraColumnDefs,
  gridOptions: gridOptionsProp,
}: ModuleListPageProps<T>) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const Icon = icon ?? moduleIcons[queryKey] ?? FileText;
  const enhancedCols = useMemo(
    () => [...enhanceColumns(columnDefs), ...(extraColumnDefs ?? [])],
    [columnDefs, extraColumnDefs],
  );

  const gridOptions = useMemo<GridOptions<T> | undefined>(() => {
    const rowNav = detailHref
      ? {
          onRowClicked: (e: { data?: T; event?: Event }) => {
            const target = e.event?.target as HTMLElement | undefined;
            if (target?.closest('[data-row-action]')) return;
            if (e.data) router.push(detailHref(e.data));
          },
          rowStyle: { cursor: 'pointer' as const },
        }
      : {};
    return { ...rowNav, ...gridOptionsProp };
  }, [detailHref, gridOptionsProp, router]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, page, search],
    queryFn: async () => {
      const { data } = await api.get(endpoint, { params: { page, limit: 20, search: search || undefined } });
      return (data.data || data) as PaginatedResponse<T>;
    },
  });

  const total = data?.meta?.total ?? 0;
  const shown = data?.data?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground max-w-xl">{description}</p>
            </div>
          </div>
          {createHref ? (
            <Link href={createHref}>
              <Button size="sm" className="shrink-0 shadow-sm">
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            </Link>
          ) : (
            <Button size="sm" className="shrink-0 shadow-sm">
              <Plus className="h-4 w-4" />
              {createLabel}
            </Button>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:max-w-lg">
          <StatPill label="Total records" value={isLoading ? '—' : total} />
          <StatPill label="On this page" value={isLoading ? '—' : shown} />
          <StatPill
            label="Page"
            value={data?.meta ? `${data.meta.page} / ${data.meta.totalPages}` : '—'}
          />
        </div>

        {/* Data table shell */}
        <div className="data-table-shell">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/25 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search records…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 border-border/60 bg-background pl-9 text-sm shadow-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 bg-background">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="h-9 bg-background">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className="px-1 pb-1 pt-0">
            <AgDataGrid
              columnDefs={enhancedCols}
              rowData={data?.data ?? []}
              isLoading={isLoading}
              emptyTitle={`No ${title.toLowerCase()} yet`}
              emptyDescription="Create your first record to get started, or adjust your search filters."
              gridOptions={gridOptions}
            />
          </div>

          {/* Footer / pagination */}
          {data?.meta && (
            <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">{shown}</span>
                {' '}of{' '}
                <span className="font-medium text-foreground">{total}</span>
                {' '}records
              </p>
              <div className="flex items-center gap-2">
                <span className="mr-1 hidden text-xs text-muted-foreground sm:inline">
                  Page {data.meta.page} of {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-background"
                  disabled={!data.meta.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 bg-background"
                  disabled={!data.meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
