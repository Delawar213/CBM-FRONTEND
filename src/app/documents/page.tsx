'use client';

import type { ColDef } from 'ag-grid-community';
import { ModuleListPage } from '@/components/module-list-page';
import { formatDate } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  version: number;
  createdAt: string;
}

const columnDefs: ColDef<Document>[] = [
  { field: 'title', headerName: 'Title' },
  { field: 'fileName', headerName: 'File' },
  { field: 'mimeType', headerName: 'Type' },
  { field: 'version', headerName: 'Version' },
  {
    field: 'createdAt',
    headerName: 'Uploaded',
    valueFormatter: (p) => (p.value ? formatDate(String(p.value)) : ''),
  },
];

export default function DocumentsPage() {
  return (
    <ModuleListPage
      title="Documents"
      description="Upload, organize, and manage company documents"
      endpoint="/documents"
      queryKey="documents"
      columnDefs={columnDefs}
      createLabel="Upload document"
    />
  );
}
