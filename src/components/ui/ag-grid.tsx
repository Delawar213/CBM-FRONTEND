'use client';

import dynamic from 'next/dynamic';
import type { ColDef, GridOptions } from 'ag-grid-community';
import type { AgDataGridProps } from './ag-data-grid-inner';

const AgDataGridInner = dynamic(() => import('./ag-data-grid-inner'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full animate-pulse rounded-lg bg-muted/40" />
  ),
}) as <T extends object>(props: AgDataGridProps<T>) => React.JSX.Element;

export type { AgDataGridProps };

export function AgDataGrid<T extends object>(props: AgDataGridProps<T>) {
  return <AgDataGridInner {...props} />;
}

export type { ColDef, GridOptions };
