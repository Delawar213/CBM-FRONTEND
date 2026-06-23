import type { QuotationDocument, QuotationRow, QuotationLineOption } from './quotation';

export type DiscountMode = 'none' | 'item' | 'full';

export interface QuotationPricing {
  discountMode: DiscountMode;
  showDiscountColumn: boolean;
  globalDiscountAmount?: number;
  globalDiscountPercent?: number;
}

export interface QuotationSummary {
  subtotal: number;
  itemDiscountTotal: number;
  globalDiscount: number;
  totalDiscount: number;
  grandTotal: number;
  hasItemDiscounts: boolean;
  hasGlobalDiscount: boolean;
  showDiscountColumn: boolean;
}

export const DEFAULT_PRICING: QuotationPricing = {
  discountMode: 'none',
  showDiscountColumn: false,
  globalDiscountAmount: 0,
  globalDiscountPercent: 0,
};

export function getQuotationPricing(source: {
  discountMode?: DiscountMode | string | null;
  showDiscountColumn?: boolean | null;
  globalDiscountAmount?: number | null;
  globalDiscountPercent?: number | null;
  document?: QuotationDocument | null;
}): QuotationPricing {
  const legacy = (source.document as { settings?: QuotationPricing } | undefined)?.settings;
  return {
    discountMode: (source.discountMode ?? legacy?.discountMode ?? 'none') as DiscountMode,
    showDiscountColumn: source.showDiscountColumn ?? legacy?.showDiscountColumn ?? false,
    globalDiscountAmount: Number(source.globalDiscountAmount ?? legacy?.globalDiscountAmount ?? 0),
    globalDiscountPercent: Number(source.globalDiscountPercent ?? legacy?.globalDiscountPercent ?? 0),
  };
}

function lineGross(row: QuotationRow): number {
  if (row.type !== 'line_item') return 0;
  if (row.options?.length) {
    return row.options.reduce((s, o) => s + (o.total ?? 0), 0);
  }
  return row.total ?? 0;
}

function optionDiscount(opt: QuotationLineOption): number {
  return Math.max(0, opt.discount ?? 0);
}

function lineItemDiscount(row: QuotationRow): number {
  if (row.type !== 'line_item') return 0;
  if (row.options?.length) {
    return row.options.reduce((s, o) => s + optionDiscount(o), 0);
  }
  return Math.max(0, row.discount ?? 0);
}

export function calcQuotationSummary(
  document: QuotationDocument,
  pricing: QuotationPricing = DEFAULT_PRICING,
): QuotationSummary {
  const settings = { ...DEFAULT_PRICING, ...pricing };
  let subtotal = 0;
  let itemDiscountTotal = 0;

  for (const row of document.rows ?? []) {
    if (row.type === 'line_item') {
      subtotal += lineGross(row);
      if (settings.discountMode === 'item') {
        itemDiscountTotal += lineItemDiscount(row);
      }
    }
    if (row.type === 'subtotal') {
      subtotal += row.subtotalAmount ?? 0;
    }
  }

  let globalDiscount = 0;
  if (settings.discountMode === 'full') {
    const afterItem = subtotal - itemDiscountTotal;
    const pct = settings.globalDiscountPercent ?? 0;
    const amt = settings.globalDiscountAmount ?? 0;
    if (pct > 0) {
      globalDiscount = Math.round(afterItem * (pct / 100) * 100) / 100;
    } else if (amt > 0) {
      globalDiscount = amt;
    }
  }

  const totalDiscount = itemDiscountTotal + globalDiscount;
  const grandTotal = Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);
  const hasItemDiscounts = settings.discountMode === 'item' && itemDiscountTotal > 0;
  const hasGlobalDiscount = settings.discountMode === 'full' && globalDiscount > 0;
  const showDiscountColumn =
    settings.showDiscountColumn &&
    settings.discountMode === 'item' &&
    (document.rows ?? []).some((r) => r.type === 'line_item' && lineItemDiscount(r) > 0);

  return {
    subtotal,
    itemDiscountTotal,
    globalDiscount,
    totalDiscount,
    grandTotal,
    hasItemDiscounts,
    hasGlobalDiscount,
    showDiscountColumn,
  };
}

export function calcDocumentTotal(document: QuotationDocument, pricing?: QuotationPricing): number {
  return calcQuotationSummary(document, pricing).grandTotal;
}

export function getLineNetAmount(row: QuotationRow, discountMode: DiscountMode): number {
  const gross = lineGross(row);
  if (discountMode !== 'item') return gross;
  return Math.max(0, gross - lineItemDiscount(row));
}

export function getOptionNetAmount(opt: QuotationLineOption, discountMode: DiscountMode): number {
  const gross = opt.total ?? 0;
  if (discountMode !== 'item') return gross;
  return Math.max(0, gross - optionDiscount(opt));
}

/** Persist only table rows in document JSON */
export function normalizeDocument(document: QuotationDocument | null | undefined): QuotationDocument {
  return { rows: document?.rows ?? [] };
}
