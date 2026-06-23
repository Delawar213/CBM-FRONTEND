'use client';

import { Badge } from '@/components/ui/badge';
import type { CustomCellRendererProps } from 'ag-grid-react';

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  active: 'success',
  approved: 'success',
  paid: 'success',
  completed: 'success',
  accepted: 'success',
  pending: 'warning',
  pending_approval: 'warning',
  draft: 'default',
  sent: 'info',
  issued: 'info',
  overdue: 'danger',
  cancelled: 'danger',
  rejected: 'danger',
  inactive: 'default',
  void: 'danger',
};

export function StatusCellRenderer({ value }: CustomCellRendererProps) {
  const raw = String(value ?? '');
  const variant = statusVariantMap[raw.toLowerCase()] ?? 'default';
  const label = raw.replace(/_/g, ' ');

  return (
    <Badge variant={variant} className="capitalize">
      {label || '—'}
    </Badge>
  );
}
