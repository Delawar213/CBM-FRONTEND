'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

const columnDefs: ColDef<Customer>[] = [
  { field: 'code', headerName: 'Code' },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { field: 'phone', headerName: 'Phone' },
  { field: 'status', headerName: 'Status' },
  {
    field: 'createdAt',
    headerName: 'Created',
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ''),
  },
];

export default function CustomersPage() {
  return (
    <ModuleListPage
      title="Customers"
      description="Manage customer profiles, contacts, and history"
      endpoint="/customers"
      queryKey="customers"
      columnDefs={columnDefs}
      createLabel="Add customer"
    />
  );
}
