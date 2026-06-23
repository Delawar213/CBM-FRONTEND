'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  number: string;
  title: string;
  status: string;
  total: number;
  amountPaid: number;
  dueDate: string;
  customer: { name: string };
}

const columnDefs: ColDef<Invoice>[] = [
  { field: 'number', headerName: 'Number' },
  { field: 'title', headerName: 'Title' },
  {
    headerName: 'Customer',
    valueGetter: (p) => p.data?.customer?.name,
  },
  { field: 'status', headerName: 'Status' },
  {
    field: 'total',
    headerName: 'Total',
    valueFormatter: (p) => formatCurrency(Number(p.value ?? 0)),
  },
  {
    field: 'amountPaid',
    headerName: 'Paid',
    valueFormatter: (p) => formatCurrency(Number(p.value ?? 0)),
  },
  {
    field: 'dueDate',
    headerName: 'Due',
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ''),
  },
];

export default function InvoicesPage() {
  return (
    <ModuleListPage
      title="Invoices"
      description="Manage invoices, payments, and outstanding balances"
      endpoint="/invoices"
      queryKey="invoices"
      columnDefs={columnDefs}
      createLabel="New invoice"
    />
  );
}
