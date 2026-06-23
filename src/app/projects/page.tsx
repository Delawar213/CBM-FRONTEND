'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatCurrency } from '@/lib/utils';

interface Project {
  id: string;
  code: string;
  name: string;
  status: string;
  progress: number;
  budget: number | null;
  customer: { name: string } | null;
}

const columnDefs: ColDef<Project>[] = [
  { field: 'code', headerName: 'Code' },
  { field: 'name', headerName: 'Name' },
  {
    headerName: 'Customer',
    valueGetter: (p) => p.data?.customer?.name ?? '-',
  },
  { field: 'status', headerName: 'Status' },
  {
    field: 'progress',
    headerName: 'Progress',
    valueFormatter: (p) => `${p.value ?? 0}%`,
  },
  {
    field: 'budget',
    headerName: 'Budget',
    valueFormatter: (p) => (p.value ? formatCurrency(Number(p.value)) : '-'),
  },
];

export default function ProjectsPage() {
  return (
    <ModuleListPage
      title="Projects"
      description="Manage projects, tasks, milestones, and team assignments"
      endpoint="/projects"
      queryKey="projects"
      columnDefs={columnDefs}
      createLabel="New project"
    />
  );
}
