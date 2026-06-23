'use client';

import { use } from 'react';
import { QuotationForm } from '@/components/quotations/quotation-form';

export default function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <QuotationForm quotationId={id} />;
}
