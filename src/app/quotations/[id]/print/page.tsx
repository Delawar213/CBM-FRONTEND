'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { QuotationPrintView } from '@/components/quotations/quotation-print-view';
import { Button } from '@/components/ui/button';
import type { Quotation } from '@/types/quotation';
import { ArrowLeft, Printer } from 'lucide-react';

export default function QuotationPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation-print', id],
    queryFn: async () => {
      const { data } = await api.get(`/quotations/${id}`);
      return (data.data || data) as Quotation;
    },
  });

  useEffect(() => {
    document.title = quotation ? `Print — ${quotation.number}` : 'Print Quotation';
  }, [quotation]);

  if (isLoading || !quotation) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/30">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-4 py-3 print:hidden">
        <Link href={`/quotations/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back to edit
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Tip: enable <strong>Background graphics</strong> in print settings for colors
          </p>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>
      </div>
      <QuotationPrintView quotation={quotation} className="py-6 print:py-0" />
    </div>
  );
}
