'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatDate } from '@/lib/utils';

interface Quotation {
  id: string;
  number: string;
  title: string;
  status: string;
  total: number;
  issueDate: string;
  revision?: number;
  toName?: string;
  customer: { name: string } | null;
}

const columnDefs: ColDef<Quotation>[] = [
  { field: 'number', headerName: 'Ref No.' },
  { field: 'title', headerName: 'Subject' },
  {
    headerName: 'Customer',
    valueGetter: (p) => p.data?.toName || p.data?.customer?.name || '—',
  },
  { field: 'status', headerName: 'Status' },
  {
    field: 'total',
    headerName: 'Total (AED)',
    valueFormatter: (p) => Number(p.value ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2 }),
  },
  {
    field: 'issueDate',
    headerName: 'Date',
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ''),
  },
];

export default function QuotationsPage() {
  return (
    <ModuleListPage
      title="Quotations"
      description="Create and manage dynamic quotations with revisions and print"
      endpoint="/quotations"
      queryKey="quotations"
      columnDefs={columnDefs}
      createLabel="New quotation"
      createHref="/quotations/new"
      detailHref={(row) => `/quotations/${row.id}`}
    />
  );
}
