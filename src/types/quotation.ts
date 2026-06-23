export type QuotationRowType = 'section_header' | 'line_item' | 'note' | 'subtotal';

export interface QuotationProduct {
  id: string;
  productName: string;
  coats: string;
}

export interface QuotationLineOption {
  id: string;
  label: string;
  products: QuotationProduct[];
  unit: string;
  quantity: number;
  unitRate: number;
  total: number;
  discount?: number;
}

export interface QuotationRow {
  id: string;
  type: QuotationRowType;
  sortOrder: number;
  sectionTitle?: string;
  serialNo?: string;
  description?: string;
  products?: QuotationProduct[];
  options?: QuotationLineOption[];
  unit?: string;
  quantity?: number;
  unitRate?: number;
  total?: number;
  discount?: number;
  noteText?: string;
  subtotalLabel?: string;
  subtotalAmount?: number;
}

import type { DiscountMode, QuotationPricing } from './quotation-calc';
export type { QuotationPricing, DiscountMode, QuotationSummary } from './quotation-calc';
export {
  calcQuotationSummary, DEFAULT_PRICING, getQuotationPricing, normalizeDocument,
} from './quotation-calc';

export interface QuotationDocument {
  rows: QuotationRow[];
}

export interface Quotation {
  id: string;
  number: string;
  baseNumber?: string;
  revision: number;
  customerId?: string | null;
  toName?: string | null;
  title: string;
  status: string;
  version: number;
  issueDate: string;
  validUntil?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  attn?: string;
  subject?: string;
  contact?: string;
  location?: string;
  fromName?: string;
  fromDesignation?: string;
  projectName?: string;
  salutation?: string;
  introText?: string;
  paymentTerms?: string;
  generalTerms?: string;
  tableNote?: string;
  preparedByName?: string;
  preparedByDesignation?: string;
  discountMode?: DiscountMode;
  showDiscountColumn?: boolean;
  globalDiscountAmount?: number;
  globalDiscountPercent?: number;
  document: QuotationDocument;
  notes?: string;
  customer?: { id: string; name: string; code?: string; email?: string; phone?: string };
  createdBy?: { firstName: string; lastName: string; email?: string };
  versions?: Array<{ id: string; version: number; createdAt: string }>;
}

export function uid() {
  return crypto.randomUUID();
}

export function calcLineTotal(qty: number, rate: number) {
  return Math.round(qty * rate * 100) / 100;
}

export { calcDocumentTotal } from './quotation-calc';

export const DEFAULT_PAYMENT_TERMS = `1. 40% advance payment upon approval of quotation.
2. 60% against running invoice.
3. Payment by CDC cheque in favour of CONCRETE BUILDING MAINTENANCE LLC.`;

export const DEFAULT_GENERAL_TERMS = `A. Electricity and water to be provided by the client free of charge.
B. Any variation in scope will be charged additionally.
C. All prices are exclusive of VAT (5%).
D. Quotation validity: 60 days from date of issue.
E. CBM shall not be liable for delays caused by third parties.
F. Site access and working hours as per client requirements.
G. Measurement is re-measurable unless stated otherwise.
H. Client to approve samples before bulk application.
I. Hidden defects discovered during work may incur extra cost.
J. Safety equipment and PPE as per site regulations.
K. Warranty as per manufacturer specifications.
L. Disputes subject to UAE jurisdiction.
M. This quotation supersedes all previous correspondence.`;

export const DEFAULT_INTRO =
  'With reference to your inquiry for the above-mentioned project, we are pleased to quote you our best price with the following specifications.';

export function newProduct(name = ''): QuotationProduct {
  return { id: uid(), productName: name, coats: '1' };
}

export function newLineItem(sortOrder: number, serialNo: string): QuotationRow {
  return {
    id: uid(),
    type: 'line_item',
    sortOrder,
    serialNo,
    description: '',
    products: [newProduct()],
    unit: 'm2',
    quantity: 1,
    unitRate: 0,
    total: 0,
  };
}

export function newSectionHeader(sortOrder: number, title: string): QuotationRow {
  return { id: uid(), type: 'section_header', sortOrder, sectionTitle: title };
}

export function newNoteRow(sortOrder: number): QuotationRow {
  return { id: uid(), type: 'note', sortOrder, noteText: '' };
}

export function newSubtotalRow(sortOrder: number, label: string, amount: number): QuotationRow {
  return { id: uid(), type: 'subtotal', sortOrder, subtotalLabel: label, subtotalAmount: amount };
}

export function defaultDocument(): QuotationDocument {
  return { rows: [newLineItem(0, '1')] };
}
