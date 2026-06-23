'use client';

import { useEffect } from 'react';
import { QuotationPrintView } from '@/components/quotations/quotation-print-view';
import { Button } from '@/components/ui/button';
import type { Quotation, QuotationPricing } from '@/types/quotation';
import { Eye, Printer, X } from 'lucide-react';

interface QuotationPreviewModalProps {
  open: boolean;
  onClose: () => void;
  quotation: Quotation;
}

export function QuotationPreviewModal({ open, onClose, quotation }: QuotationPreviewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Quotation preview</p>
            <p className="text-xs text-muted-foreground">
              Live preview — check layout before saving or printing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-[220mm] shadow-lg print:shadow-none">
          <QuotationPrintView quotation={quotation} />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .quotation-print, .quotation-print * { visibility: visible; }
          .quotation-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export function buildPreviewQuotation(input: {
  existing?: Quotation | null;
  customerId: string;
  toName: string;
  customers?: { id: string; name: string }[];
  title: string;
  subject: string;
  attn: string;
  contact: string;
  location: string;
  projectName: string;
  fromName: string;
  fromDesignation: string;
  issueDate: string;
  salutation: string;
  introText: string;
  paymentTerms: string;
  generalTerms: string;
  tableNote: string;
  document: Quotation['document'];
  pricing: QuotationPricing;
  subtotal: number;
  discount: number;
  total: number;
}): Quotation {
  const customer = input.customers?.find((c) => c.id === input.customerId);
  const displayName = input.toName.trim() || customer?.name || '— Enter customer —';

  return {
    id: input.existing?.id ?? 'preview',
    number: input.existing?.number ?? 'CBM/2026/Q-DRAFT',
    revision: input.existing?.revision ?? 0,
    customerId: input.customerId || undefined,
    toName: input.toName.trim() || undefined,
    title: input.title,
    status: input.existing?.status ?? 'DRAFT',
    version: input.existing?.version ?? 1,
    issueDate: input.issueDate,
    subtotal: input.subtotal,
    taxAmount: 0,
    discount: input.discount,
    total: input.total,
    currency: 'AED',
    attn: input.attn,
    subject: input.subject,
    contact: input.contact,
    location: input.location,
    fromName: input.fromName,
    fromDesignation: input.fromDesignation,
    projectName: input.projectName,
    salutation: input.salutation,
    introText: input.introText,
    paymentTerms: input.paymentTerms,
    generalTerms: input.generalTerms,
    tableNote: input.tableNote,
    preparedByName: input.fromName,
    preparedByDesignation: input.fromDesignation,
    discountMode: input.pricing.discountMode,
    showDiscountColumn: input.pricing.showDiscountColumn,
    globalDiscountAmount: input.pricing.globalDiscountAmount ?? 0,
    globalDiscountPercent: input.pricing.globalDiscountPercent ?? 0,
    document: input.document,
    customer: customer
      ? { id: customer.id, name: displayName }
      : { id: '', name: displayName },
  };
}
