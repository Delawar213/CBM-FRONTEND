'use client';

import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CustomerOption {
  id: string;
  name: string;
}

interface CustomerToFieldProps {
  customers?: CustomerOption[];
  customerId: string;
  toName: string;
  mode: 'list' | 'manual';
  onModeChange: (mode: 'list' | 'manual') => void;
  onCustomerIdChange: (id: string) => void;
  onToNameChange: (name: string) => void;
}

export function CustomerToField({
  customers = [],
  customerId,
  toName,
  mode,
  onModeChange,
  onCustomerIdChange,
  onToNameChange,
}: CustomerToFieldProps) {
  const hasList = customers.length > 0;

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Customer (To)</Label>
        {hasList && (
          <div className="flex rounded-md border border-border p-0.5 text-xs">
            <button
              type="button"
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                mode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onModeChange('list')}
            >
              From list
            </button>
            <button
              type="button"
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => onModeChange('manual')}
            >
              Type name
            </button>
          </div>
        )}
      </div>

      {mode === 'list' && hasList ? (
        <select
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={customerId}
          onChange={(e) => {
            onCustomerIdChange(e.target.value);
            const picked = customers.find((c) => c.id === e.target.value);
            if (picked) onToNameChange(picked.name);
          }}
        >
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      ) : (
        <Input
          value={toName}
          onChange={(e) => onToNameChange(e.target.value)}
          placeholder="e.g. M/S MOON LINK BUILDING CONTRACTING LLC"
        />
      )}

      {!hasList && (
        <p className="text-xs text-muted-foreground">No customers in system yet — type the company name for this quotation.</p>
      )}
    </div>
  );
}

export function getQuotationToName(quotation: {
  toName?: string | null;
  customer?: { name: string } | null;
}): string {
  return quotation.toName?.trim() || quotation.customer?.name || '';
}
