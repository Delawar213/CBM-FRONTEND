'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { QuotationRowsEditor } from '@/components/quotations/quotation-rows-editor';
import { buildPreviewQuotation, QuotationPreviewModal } from '@/components/quotations/quotation-preview-modal';
import { CustomerToField } from '@/components/quotations/customer-to-field';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import {
  Quotation, QuotationDocument, QuotationPricing, calcQuotationSummary,
  DEFAULT_GENERAL_TERMS, DEFAULT_INTRO, DEFAULT_PAYMENT_TERMS, defaultDocument,
  DEFAULT_PRICING, getQuotationPricing, normalizeDocument,
} from '@/types/quotation';
import { ArrowLeft, Eye, Printer, Save, GitBranch } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface QuotationFormProps {
  quotationId?: string;
}

export function QuotationForm({ quotationId }: QuotationFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isEdit = Boolean(quotationId);

  const [customerId, setCustomerId] = useState('');
  const [toName, setToName] = useState('');
  const [customerMode, setCustomerMode] = useState<'list' | 'manual'>('list');
  const [title, setTitle] = useState('Supply & Apply of Paint');
  const [subject, setSubject] = useState('Supply & Apply of Paint');
  const [attn, setAttn] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [projectName, setProjectName] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromDesignation, setFromDesignation] = useState('Quantity Surveyor');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [salutation, setSalutation] = useState('Dear Sir / Madam,');
  const [introText, setIntroText] = useState(DEFAULT_INTRO);
  const [paymentTerms, setPaymentTerms] = useState(DEFAULT_PAYMENT_TERMS);
  const [generalTerms, setGeneralTerms] = useState(DEFAULT_GENERAL_TERMS);
  const [tableNote, setTableNote] = useState('Note: Measurement is re-measurable');
  const [document, setDocument] = useState<QuotationDocument>(defaultDocument());
  const [pricing, setPricing] = useState<QuotationPricing>(DEFAULT_PRICING);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ['customers-select'],
    queryFn: async () => {
      const { data } = await api.get('/customers', { params: { limit: 200 } });
      const result = data.data || data;
      return (result.data ?? []) as Customer[];
    },
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['quotation', quotationId],
    enabled: isEdit,
    queryFn: async () => {
      const { data } = await api.get(`/quotations/${quotationId}`);
      return (data.data || data) as Quotation;
    },
  });

  useEffect(() => {
    if (user && !isEdit) {
      setFromName(`${user.firstName} ${user.lastName}`);
    }
  }, [user, isEdit]);

  useEffect(() => {
    if (!existing) return;
    setCustomerId(existing.customerId ?? '');
    setToName(existing.toName ?? existing.customer?.name ?? '');
    setCustomerMode(existing.customerId ? 'list' : 'manual');
    setTitle(existing.title);
    setSubject(existing.subject ?? existing.title);
    setAttn(existing.attn ?? '');
    setContact(existing.contact ?? '');
    setLocation(existing.location ?? '');
    setProjectName(existing.projectName ?? '');
    setFromName(existing.fromName ?? '');
    setFromDesignation(existing.fromDesignation ?? '');
    setIssueDate(existing.issueDate.slice(0, 10));
    setSalutation(existing.salutation ?? '');
    setIntroText(existing.introText ?? DEFAULT_INTRO);
    setPaymentTerms(existing.paymentTerms ?? DEFAULT_PAYMENT_TERMS);
    setGeneralTerms(existing.generalTerms ?? DEFAULT_GENERAL_TERMS);
    setTableNote(existing.tableNote ?? '');
    setDocument(normalizeDocument(existing.document));
    setPricing(getQuotationPricing(existing));
  }, [existing]);

  const summary = calcQuotationSummary(document, pricing);
  const total = summary.grandTotal;

  useEffect(() => {
    if (customers && customers.length === 0 && !isEdit) {
      setCustomerMode('manual');
    }
  }, [customers, isEdit]);

  const previewQuotation = useMemo(
    () => buildPreviewQuotation({
      existing,
      customerId,
      toName,
      customers,
      title,
      subject,
      attn,
      contact,
      location,
      projectName,
      fromName,
      fromDesignation,
      issueDate,
      salutation,
      introText,
      paymentTerms,
      generalTerms,
      tableNote,
      document,
      pricing,
      subtotal: summary.subtotal,
      discount: summary.totalDiscount,
      total: summary.grandTotal,
    }),
    [
      existing, customerId, toName, customers, title, subject, attn, contact, location,
      projectName, fromName, fromDesignation, issueDate, salutation, introText,
      paymentTerms, generalTerms, tableNote, document, pricing, summary,
    ],
  );

  const buildPayload = () => ({
    customerId: customerMode === 'list' && customerId ? customerId : undefined,
    toName: customerMode === 'manual' ? toName.trim() : undefined,
    title,
    subject,
    attn,
    contact,
    location,
    fromName,
    fromDesignation,
    projectName,
    issueDate,
    salutation,
    introText,
    paymentTerms,
    generalTerms,
    tableNote,
    preparedByName: fromName,
    preparedByDesignation: fromDesignation,
    currency: 'AED',
    document: normalizeDocument(document),
    discountMode: pricing.discountMode,
    showDiscountColumn: pricing.showDiscountColumn,
    globalDiscountAmount: pricing.globalDiscountAmount ?? 0,
    globalDiscountPercent: pricing.globalDiscountPercent ?? 0,
    discount: summary.totalDiscount,
  });

  const handleSave = async () => {
    setError('');
    if (customerMode === 'list' && !customerId) {
      setError('Please select a customer from the list');
      return;
    }
    if (customerMode === 'manual' && !toName.trim()) {
      setError('Please enter the customer name');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/quotations/${quotationId}`, buildPayload());
        router.push(`/quotations/${quotationId}`);
      } else {
        const { data } = await api.post('/quotations', buildPayload());
        const created = data.data || data;
        router.push(`/quotations/${created.id}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save quotation');
    } finally {
      setSaving(false);
    }
  };

  const handleRevise = async () => {
    if (!quotationId) return;
    setSaving(true);
    try {
      await api.post(`/quotations/${quotationId}/revise`);
      router.refresh();
      window.location.reload();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to create revision');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/quotations">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">
                {isEdit ? `Edit ${existing?.number ?? 'Quotation'}` : 'New Quotation'}
              </h1>
              {isEdit && existing && (
                <p className="text-xs text-muted-foreground">
                  Version {existing.version} · Revision {existing.revision > 0 ? `R${existing.revision}` : 'Original'}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            {isEdit && (
              <>
                <Link href={`/quotations/${quotationId}/print`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4" /> Print / PDF
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleRevise} disabled={saving}>
                  <GitBranch className="h-4 w-4" /> Revise (R+1)
                </Button>
              </>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Header fields */}
        <div className="data-table-shell p-5">
          <h2 className="mb-4 text-sm font-semibold">Quotation header</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CustomerToField
              customers={customers}
              customerId={customerId}
              toName={toName}
              mode={customerMode}
              onModeChange={(mode) => {
                setCustomerMode(mode);
                if (mode === 'manual') setCustomerId('');
                if (mode === 'list' && customerId) {
                  const picked = customers?.find((c) => c.id === customerId);
                  if (picked) setToName(picked.name);
                }
              }}
              onCustomerIdChange={setCustomerId}
              onToNameChange={setToName}
            />
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Attn</Label>
              <Input value={attn} onChange={(e) => setAttn(e.target.value)} placeholder="Mr. Ahmed Nasr" />
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+971 50 319 4621" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Project</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="PROPOSED WAREHOUSES (G+M)" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>From (prepared by)</Label>
              <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={fromDesignation} onChange={(e) => setFromDesignation(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Salutation</Label>
              <Input value={salutation} onChange={(e) => setSalutation(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>Introduction</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Dynamic table rows */}
        <div className="data-table-shell p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Quotation table (dynamic rows)</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-primary">
                Grand total: AED {summary.grandTotal.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Eye className="h-3.5 w-3.5" /> Preview table
              </Button>
            </div>
          </div>
          <QuotationRowsEditor
            document={document}
            pricing={pricing}
            onDocumentChange={setDocument}
            onPricingChange={setPricing}
          />
        </div>

        {/* Terms */}
        <div className="data-table-shell p-5">
          <h2 className="mb-4 text-sm font-semibold">Terms & notes</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Table note</Label>
              <Input value={tableNote} onChange={(e) => setTableNote(e.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Payment terms</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>General terms & conditions</Label>
              <textarea
                className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={generalTerms}
                onChange={(e) => setGeneralTerms(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <QuotationPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quotation={previewQuotation}
      />
    </DashboardLayout>
  );
}
