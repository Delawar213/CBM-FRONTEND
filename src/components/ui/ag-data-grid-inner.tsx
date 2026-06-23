'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { useTheme } from 'next-themes';
import { Inbox } from 'lucide-react';
import { useMounted } from '@/components/providers';
import { cn } from '@/lib/utils';

import 'ag-grid-community/styles/ag-grid.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface AgDataGridProps<T> {
  columnDefs: ColDef<T>[];
  rowData: T[];
  isLoading?: boolean;
  className?: string;
  gridOptions?: GridOptions<T>;
  emptyTitle?: string;
  emptyDescription?: string;
}

const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  flex: 1,
  minWidth: 120,
};

function GridEmptyOverlay({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Inbox className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function makeEmptyOverlay(title: string, description: string) {
  return function EmptyOverlay() {
    return <GridEmptyOverlay title={title} description={description} />;
  };
}

export default function AgDataGridInner<T>({
  columnDefs,
  rowData,
  isLoading = false,
  className,
  gridOptions,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or create a new record.',
}: AgDataGridProps<T>) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const gridTheme = useMemo(
    () =>
      themeQuartz.withParams({
        accentColor: resolvedTheme === 'dark' ? '#3d8fd4' : '#0f4c75',
        backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#ffffff',
        borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#e8edf3',
        browserColorScheme: resolvedTheme === 'dark' ? 'dark' : 'light',
        chromeBackgroundColor: resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc',
        fontFamily: 'inherit',
        fontSize: 13,
        headerFontSize: 11,
        headerFontWeight: 600,
        headerTextColor: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b',
        rowHeight: 48,
        headerHeight: 44,
        spacing: 8,
        wrapperBorderRadius: 0,
        oddRowBackgroundColor: resolvedTheme === 'dark' ? '#111827' : '#fafbfc',
        rowHoverColor: resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9',
      }),
    [resolvedTheme],
  );

  const noRowsOverlay = useMemo(
    () => makeEmptyOverlay(emptyTitle, emptyDescription),
    [emptyTitle, emptyDescription],
  );

  if (!mounted) {
    return <div className={cn('h-[480px] animate-pulse rounded-lg bg-muted/40', className)} />;
  }

  return (
    <div className={cn('ag-grid-modern h-[480px] w-full', className)}>
      <AgGridReact<T>
        theme={gridTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        loading={isLoading}
        animateRows
        suppressCellFocus
        pagination={false}
        domLayout="normal"
        noRowsOverlayComponent={noRowsOverlay}
        overlayLoadingTemplate='<span class="text-sm text-muted-foreground">Loading records…</span>'
        {...gridOptions}
      />
    </div>
  );
}
