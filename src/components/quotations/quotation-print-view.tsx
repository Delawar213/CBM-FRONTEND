'use client';

import { useMemo } from 'react';
import type { Quotation, QuotationRow } from '@/types/quotation';
import {
  calcQuotationSummary, getLineNetAmount, getOptionNetAmount, getQuotationPricing,
} from '@/types/quotation-calc';
import { getQuotationToName } from '@/components/quotations/customer-to-field';

interface QuotationPrintViewProps {
  quotation: Quotation;
  className?: string;
}

function formatPrintDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

function formatNum(n: number) {
  return n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function LineItemRows({
  row,
  currency,
  showDiscountCol,
  discountMode,
}: {
  row: QuotationRow;
  currency: string;
  showDiscountCol: boolean;
  discountMode: string;
}) {
  if (row.options?.length) {
    const totalSpan = row.options.reduce((s, o) => s + o.products.length, 0);
    return (
      <>
        {row.options.map((opt, optIdx) => {
          const span = opt.products.length || 1;
          const disc = showDiscountCol ? (opt.discount ?? 0) : 0;
          const net = getOptionNetAmount(opt, discountMode as 'none' | 'item' | 'full');
          return opt.products.map((prod, pIdx) => (
            <tr key={`${opt.id}-${prod.id}`} className="border-b border-black">
              {optIdx === 0 && pIdx === 0 && (
                <>
                  <td rowSpan={totalSpan} className="border border-black px-2 py-1 align-top text-center font-medium">{row.serialNo}</td>
                  <td rowSpan={totalSpan} className="border border-black px-2 py-1 align-top">{row.description}</td>
                </>
              )}
              {pIdx === 0 && (
                <td rowSpan={span} className="border border-black px-2 py-1 align-top text-center font-semibold qp-amount-red">{opt.label}</td>
              )}
              <td className="border border-black px-2 py-1">{prod.productName}</td>
              <td className="border border-black px-2 py-1 text-center">{prod.coats}</td>
              {pIdx === 0 && (
                <>
                  <td rowSpan={span} className="border border-black px-2 py-1 text-center">{opt.unit}</td>
                  <td rowSpan={span} className="border border-black px-2 py-1 text-center">{formatNum(opt.quantity)}</td>
                  <td rowSpan={span} className="border border-black px-2 py-1 text-right">{formatNum(opt.unitRate)}</td>
                  {showDiscountCol && (
                    <td rowSpan={span} className="border border-black px-2 py-1 text-right qp-amount-red">
                      {disc > 0 ? formatNum(disc) : '—'}
                    </td>
                  )}
                  <td rowSpan={span} className="border border-black px-2 py-1 text-right font-semibold qp-amount-red">
                    {formatAmount(net, currency)}
                  </td>
                </>
              )}
            </tr>
          ));
        })}
      </>
    );
  }

  const products = row.products?.length ? row.products : [{ id: '0', productName: '', coats: '-' }];
  const span = products.length;
  const disc = showDiscountCol ? (row.discount ?? 0) : 0;
  const net = getLineNetAmount(row, discountMode as 'none' | 'item' | 'full');

  return (
    <>
      {products.map((prod, pIdx) => (
        <tr key={prod.id} className="border-b border-black">
          {pIdx === 0 && (
            <>
              <td rowSpan={span} className="border border-black px-2 py-1 align-top text-center font-medium">{row.serialNo}</td>
              <td rowSpan={span} className="border border-black px-2 py-1 align-top">{row.description}</td>
            </>
          )}
          <td className="border border-black px-2 py-1">{prod.productName}</td>
          <td className="border border-black px-2 py-1 text-center">{prod.coats}</td>
          {pIdx === 0 && (
            <>
              <td rowSpan={span} className="border border-black px-2 py-1 text-center">{row.unit}</td>
              <td rowSpan={span} className="border border-black px-2 py-1 text-center">{formatNum(row.quantity ?? 0)}</td>
              <td rowSpan={span} className="border border-black px-2 py-1 text-right">{formatNum(row.unitRate ?? 0)}</td>
              {showDiscountCol && (
                <td rowSpan={span} className="border border-black px-2 py-1 text-right qp-amount-red">
                  {disc > 0 ? formatNum(disc) : '—'}
                </td>
              )}
              <td rowSpan={span} className="border border-black px-2 py-1 text-right font-semibold qp-amount-red">
                {formatAmount(net, currency)}
              </td>
            </>
          )}
        </tr>
      ))}
    </>
  );
}

export function QuotationPrintView({ quotation, className }: QuotationPrintViewProps) {
  const document = quotation.document ?? { rows: [] };
  const pricing = getQuotationPricing(quotation);
  const rows = useMemo(() => [...(document.rows ?? [])].sort((a, b) => a.sortOrder - b.sortOrder), [document.rows]);
  const summary = useMemo(() => calcQuotationSummary(document, pricing), [document, pricing]);
  const currency = quotation.currency || 'AED';
  const showDiscountCol = summary.showDiscountColumn;
  const colSpan = showDiscountCol ? 9 : 8;
  const priceColSpan = showDiscountCol ? 8 : 7;
  const discountMode = pricing.discountMode;

  return (
    <div className={className}>
      <div className="quotation-print mx-auto max-w-[210mm] bg-white p-8 text-[11px] leading-snug text-black print:p-6">
        <div className="mb-0 border-2 border-black qp-title-bar px-4 py-2 text-center text-sm font-bold tracking-widest">
          QUOTATION
        </div>

        <table className="mb-0 w-full border-collapse border-2 border-t-0 border-black text-[11px]">
          <tbody>
            <tr>
              <td className="w-1/2 border border-black px-3 py-1.5 align-top">
                <p><span className="font-bold">To:</span> {getQuotationToName(quotation)}</p>
                <p><span className="font-bold">Attn:</span> {quotation.attn}</p>
                <p><span className="font-bold">Subject:</span> {quotation.subject}</p>
                <p><span className="font-bold">Contact:</span> {quotation.contact}</p>
                {quotation.location && <p><span className="font-bold">Location:</span> {quotation.location}</p>}
              </td>
              <td className="w-1/2 border border-black px-3 py-1.5 align-top">
                <p><span className="font-bold">From:</span> {quotation.fromName}</p>
                <p><span className="font-bold">Designation:</span> {quotation.fromDesignation}</p>
                <p><span className="font-bold">Date:</span> {formatPrintDate(quotation.issueDate)}</p>
                <p><span className="font-bold">Ref No.:</span> {quotation.number}</p>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-black px-3 py-1.5 font-bold qp-project-row">
                Project: {quotation.projectName}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-3 mb-1">{quotation.salutation}</p>
        <p className="mb-4">{quotation.introText}</p>

        <table className="w-full border-collapse border-2 border-black text-[10px]">
          <thead className="qp-thead">
            <tr>
              <th className="border border-black px-2 py-1.5 w-12">S.No</th>
              <th className="border border-black px-2 py-1.5">DESCRIPTION</th>
              <th className="border border-black px-2 py-1.5">PRODUCT NAME</th>
              <th className="border border-black px-2 py-1.5 w-16">No Of Coats</th>
              <th className="border border-black px-2 py-1.5 w-14">Unit</th>
              <th className="border border-black px-2 py-1.5 w-16">QTY</th>
              <th className="border border-black px-2 py-1.5 w-20">Unit Rate</th>
              {showDiscountCol && (
                <th className="border border-black px-2 py-1.5 w-16">Discount</th>
              )}
              <th className="border border-black px-2 py-1.5 w-24">TOTAL AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.type === 'section_header') {
                return (
                  <tr key={row.id} className="qp-section-row">
                    <td colSpan={colSpan} className="border border-black px-2 py-1.5">{row.sectionTitle}</td>
                  </tr>
                );
              }
              if (row.type === 'note') {
                return (
                  <tr key={row.id}>
                    <td colSpan={colSpan} className="border border-black px-2 py-2 text-[10px] leading-relaxed">{row.noteText}</td>
                  </tr>
                );
              }
              if (row.type === 'subtotal') {
                return (
                  <tr key={row.id} className="font-bold">
                    <td colSpan={priceColSpan} className="border border-black px-2 py-1.5 text-right">{row.subtotalLabel}</td>
                    <td className="border border-black px-2 py-1.5 text-right qp-amount-red">
                      {formatAmount(row.subtotalAmount ?? 0, currency)}
                    </td>
                  </tr>
                );
              }
              return (
                <LineItemRows
                  key={row.id}
                  row={row}
                  currency={currency}
                  showDiscountCol={showDiscountCol}
                  discountMode={discountMode}
                />
              );
            })}
          </tbody>
        </table>

        {/* Summary totals */}
        <div className="mt-0 border-2 border-t-0 border-black">
          <div className="flex justify-end border-b border-black">
            <div className="flex min-w-[240px] items-center justify-between gap-6 border-l border-black px-4 py-1.5">
              <span className="font-semibold">SUBTOTAL</span>
              <span>{formatAmount(summary.subtotal, currency)}</span>
            </div>
          </div>
          {summary.hasItemDiscounts && (
            <div className="flex justify-end border-b border-black">
              <div className="flex min-w-[240px] items-center justify-between gap-6 border-l border-black px-4 py-1.5 qp-amount-red">
                <span className="font-semibold">ITEM DISCOUNT</span>
                <span>−{formatAmount(summary.itemDiscountTotal, currency)}</span>
              </div>
            </div>
          )}
          {summary.hasGlobalDiscount && (
            <div className="flex justify-end border-b border-black">
              <div className="flex min-w-[240px] items-center justify-between gap-6 border-l border-black px-4 py-1.5 qp-amount-red">
                <span className="font-semibold">OVERALL DISCOUNT</span>
                <span>−{formatAmount(summary.globalDiscount, currency)}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <div className="flex min-w-[240px] items-center justify-between gap-6 border-l border-black px-4 py-2 font-bold qp-total-row">
              <span>GRAND TOTAL</span>
              <span className="qp-amount-red">{formatAmount(summary.grandTotal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Table note — always below totals */}
        {quotation.tableNote?.trim() && (
          <p className="mt-3 text-[10px] italic leading-relaxed">{quotation.tableNote}</p>
        )}

        {quotation.paymentTerms && (
          <div className="mt-5">
            <p className="mb-1 font-bold underline">Payment Terms:</p>
            <pre className="whitespace-pre-wrap font-sans text-[10px] leading-relaxed">{quotation.paymentTerms}</pre>
          </div>
        )}

        {quotation.generalTerms && (
          <div className="mt-4">
            <p className="mb-1 font-bold underline">General Terms and Conditions:</p>
            <pre className="whitespace-pre-wrap font-sans text-[10px] leading-relaxed">{quotation.generalTerms}</pre>
          </div>
        )}

        <div className="mt-8">
          <p className="mb-6">Thanking you and assuring you of our best services at all times.</p>
          <p className="font-bold">Prepared by:</p>
          <p>{quotation.preparedByName}</p>
          <p>{quotation.preparedByDesignation}</p>
          <p className="mt-2 font-bold">CONCRETE BUILDING MAINTENANCE LLC</p>
        </div>
      </div>
    </div>
  );
}
