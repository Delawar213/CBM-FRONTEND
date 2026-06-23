'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Expense {
  id: string;
  number: string;
  title: string;
  status: string;
  amount: number;
  expenseDate: string;
  category: { name: string };
}

const columnDefs: ColDef<Expense>[] = [
  { field: 'number', headerName: 'Number' },
  { field: 'title', headerName: 'Title' },
  {
    headerName: 'Category',
    valueGetter: (p) => p.data?.category?.name,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    valueFormatter: (p) => formatCurrency(Number(p.value ?? 0)),
  },
  { field: 'status', headerName: 'Status' },
  {
    field: 'expenseDate',
    headerName: 'Date',
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ''),
  },
];

export default function ExpensesPage() {
  return (
    <ModuleListPage
      title="Expenses"
      description="Track expenses, approvals, and monthly summaries"
      endpoint="/expenses"
      queryKey="expenses"
      columnDefs={columnDefs}
      createLabel="Add expense"
    />
  );
}
