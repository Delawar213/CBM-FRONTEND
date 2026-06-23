'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/input';
import type { DiscountMode, QuotationDocument, QuotationPricing, QuotationRow } from '@/types/quotation';
import {
  DEFAULT_PRICING, calcLineTotal, calcQuotationSummary, newLineItem, newNoteRow,
  newProduct, newSectionHeader, newSubtotalRow, uid,
} from '@/types/quotation';
import { cn } from '@/lib/utils';
import {
  Plus, Trash2, GripVertical, Layers, StickyNote, Calculator, ListTree,
} from 'lucide-react';

interface QuotationRowsEditorProps {
  document: QuotationDocument;
  pricing: QuotationPricing;
  onDocumentChange: (doc: QuotationDocument) => void;
  onPricingChange: (pricing: QuotationPricing) => void;
}

function updateRow(rows: QuotationRow[], id: string, patch: Partial<QuotationRow>) {
  return rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function QuotationRowsEditor({
  document, pricing, onDocumentChange, onPricingChange,
}: QuotationRowsEditorProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const settings = { ...DEFAULT_PRICING, ...pricing };
  const rows = [...document.rows].sort((a, b) => a.sortOrder - b.sortOrder);
  const summary = calcQuotationSummary(document, settings);

  const setRows = (next: QuotationRow[]) => {
    onDocumentChange({ rows: next.map((r, i) => ({ ...r, sortOrder: i })) });
  };

  const patchPricing = (patch: Partial<QuotationPricing>) => {
    onPricingChange({ ...settings, ...patch });
  };

  const addRow = (row: QuotationRow) => setRows([...rows, row]);

  const removeRow = (id: string) => setRows(rows.filter((r) => r.id !== id));

  const patchRow = (id: string, patch: Partial<QuotationRow>) => {
    setRows(updateRow(rows, id, patch));
  };

  const moveRow = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = rows.findIndex((r) => r.id === fromId);
    const to = rows.findIndex((r) => r.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
  };

  const showItemDiscount = settings.discountMode === 'item' && settings.showDiscountColumn;

  return (
    <div className="space-y-4">
      {/* Discount & row tools */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount</Label>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            value={settings.discountMode}
            onChange={(e) => patchPricing({
              discountMode: e.target.value as DiscountMode,
              showDiscountColumn: e.target.value === 'item' ? settings.showDiscountColumn : false,
            })}
          >
            <option value="none">No discount</option>
            <option value="item">Item-wise discount</option>
            <option value="full">Overall discount</option>
          </select>
          {settings.discountMode === 'item' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.showDiscountColumn}
                onChange={(e) => patchPricing({ showDiscountColumn: e.target.checked })}
                className="rounded border-input"
              />
              Show discount column in print/preview
            </label>
          )}
        </div>
        {settings.discountMode === 'full' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Overall discount amount (AED)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={settings.globalDiscountAmount ?? 0}
                onChange={(e) => patchPricing({
                  globalDiscountAmount: Number(e.target.value),
                  globalDiscountPercent: 0,
                })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Or discount %</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={settings.globalDiscountPercent ?? 0}
                onChange={(e) => patchPricing({
                  globalDiscountPercent: Number(e.target.value),
                  globalDiscountAmount: 0,
                })}
              />
            </div>
          </div>
        )}
        {(summary.hasItemDiscounts || summary.hasGlobalDiscount) && (
          <p className="text-xs text-muted-foreground">
            Subtotal AED {summary.subtotal.toFixed(2)}
            {summary.hasItemDiscounts && ` · Item discount −${summary.itemDiscountTotal.toFixed(2)}`}
            {summary.hasGlobalDiscount && ` · Overall discount −${summary.globalDiscount.toFixed(2)}`}
            {' · '}<span className="font-semibold text-primary">Net AED {summary.grandTotal.toFixed(2)}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(newLineItem(rows.length, String(rows.filter((r) => r.type === 'line_item').length + 1)))}>
          <Plus className="h-3.5 w-3.5" /> Line item
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(newSectionHeader(rows.length, 'Section title'))}>
          <Layers className="h-3.5 w-3.5" /> Section header
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(newNoteRow(rows.length))}>
          <StickyNote className="h-3.5 w-3.5" /> Note row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addRow(newSubtotalRow(rows.length, 'Section Total', 0))}>
          <Calculator className="h-3.5 w-3.5" /> Subtotal
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">Drag the grip handle to reorder rows.</p>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No rows yet. Add line items, sections, or notes above.
          </p>
        )}

        {rows.map((row, idx) => (
          <div
            key={row.id}
            draggable
            onDragStart={() => setDragId(row.id)}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) moveRow(dragId, row.id); setDragId(null); }}
            className={cn(
              'data-table-shell p-4 transition-opacity',
              dragId === row.id && 'opacity-40 ring-2 ring-primary/30',
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
                {row.type.replace('_', ' ')} · #{idx + 1}
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveRow(row.id, rows[idx - 1].id)}>
                  ↑
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={idx === rows.length - 1} onClick={() => moveRow(row.id, rows[idx + 1].id)}>
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRow(row.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {row.type === 'section_header' && (
              <div className="space-y-2">
                <Label>Section title (yellow header row)</Label>
                <Input value={row.sectionTitle ?? ''} onChange={(e) => patchRow(row.id, { sectionTitle: e.target.value })} />
              </div>
            )}

            {row.type === 'note' && (
              <div className="space-y-2">
                <Label>Note text (inside table)</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={row.noteText ?? ''}
                  onChange={(e) => patchRow(row.id, { noteText: e.target.value })}
                />
              </div>
            )}

            {row.type === 'subtotal' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input value={row.subtotalLabel ?? ''} onChange={(e) => patchRow(row.id, { subtotalLabel: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" value={row.subtotalAmount ?? 0} onChange={(e) => patchRow(row.id, { subtotalAmount: Number(e.target.value) })} />
                </div>
              </div>
            )}

            {row.type === 'line_item' && (
              <LineItemEditor row={row} showDiscount={showItemDiscount} onPatch={(p) => patchRow(row.id, p)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LineItemEditor({
  row,
  showDiscount,
  onPatch,
}: {
  row: QuotationRow;
  showDiscount: boolean;
  onPatch: (p: Partial<QuotationRow>) => void;
}) {
  const hasOptions = Boolean(row.options?.length);
  const products = row.products ?? [newProduct()];

  const updatePricing = (unit: string, qty: number, rate: number) => {
    onPatch({ unit, quantity: qty, unitRate: rate, total: calcLineTotal(qty, rate) });
  };

  const toggleOptions = () => {
    if (hasOptions) {
      onPatch({ options: undefined, products: [newProduct()], unit: 'm2', quantity: 1, unitRate: 0, total: 0, discount: 0 });
    } else {
      onPatch({
        options: [
          { id: uid(), label: 'Option 1', products: [newProduct()], unit: row.unit ?? 'm2', quantity: row.quantity ?? 1, unitRate: row.unitRate ?? 0, total: row.total ?? 0, discount: 0 },
          { id: uid(), label: 'Option 2', products: [newProduct()], unit: 'm2', quantity: 1, unitRate: 0, total: 0, discount: 0 },
        ],
        products: undefined,
        discount: undefined,
      });
    }
  };

  const priceCols = showDiscount ? 5 : 4;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>S.No</Label>
          <Input value={row.serialNo ?? ''} onChange={(e) => onPatch({ serialNo: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Input value={row.description ?? ''} onChange={(e) => onPatch({ description: e.target.value })} />
        </div>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={toggleOptions}>
        <ListTree className="h-3.5 w-3.5" />
        {hasOptions ? 'Use single price' : 'Add Option 1 / Option 2'}
      </Button>

      {!hasOptions ? (
        <>
          <ProductList products={products} onChange={(p) => onPatch({ products: p })} />
          <div className={cn('grid gap-3', priceCols === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4')}>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={row.unit ?? ''} onChange={(e) => updatePricing(e.target.value, row.quantity ?? 1, row.unitRate ?? 0)} />
            </div>
            <div className="space-y-2">
              <Label>Qty</Label>
              <Input type="number" step="0.01" value={row.quantity ?? 1} onChange={(e) => updatePricing(row.unit ?? 'm2', Number(e.target.value), row.unitRate ?? 0)} />
            </div>
            <div className="space-y-2">
              <Label>Unit rate</Label>
              <Input type="number" step="0.01" value={row.unitRate ?? 0} onChange={(e) => updatePricing(row.unit ?? 'm2', row.quantity ?? 1, Number(e.target.value))} />
            </div>
            {showDiscount && (
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" step="0.01" min={0} value={row.discount ?? 0} onChange={(e) => onPatch({ discount: Number(e.target.value) })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Total</Label>
              <Input readOnly value={row.total ?? 0} className="bg-muted font-semibold" />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {row.options!.map((opt, optIdx) => (
            <div key={opt.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="mb-3 flex items-center justify-between">
                <Input className="max-w-[140px] font-semibold text-red-600" value={opt.label} onChange={(e) => {
                  onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, label: e.target.value } : o) });
                }} />
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => onPatch({ options: row.options!.filter((_, i) => i !== optIdx) })}>
                  Remove option
                </Button>
              </div>
              <ProductList products={opt.products} onChange={(p) => {
                onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, products: p } : o) });
              }} />
              <div className={cn('mt-3 grid gap-3', priceCols === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4')}>
                <div className="space-y-2"><Label>Unit</Label><Input value={opt.unit} onChange={(e) => {
                  onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, unit: e.target.value } : o) });
                }} /></div>
                <div className="space-y-2"><Label>Qty</Label><Input type="number" value={opt.quantity} onChange={(e) => {
                  const qty = Number(e.target.value);
                  onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, quantity: qty, total: calcLineTotal(qty, o.unitRate) } : o) });
                }} /></div>
                <div className="space-y-2"><Label>Rate</Label><Input type="number" value={opt.unitRate} onChange={(e) => {
                  const rate = Number(e.target.value);
                  onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, unitRate: rate, total: calcLineTotal(o.quantity, rate) } : o) });
                }} /></div>
                {showDiscount && (
                  <div className="space-y-2"><Label>Discount</Label><Input type="number" min={0} value={opt.discount ?? 0} onChange={(e) => {
                    onPatch({ options: row.options!.map((o, i) => i === optIdx ? { ...o, discount: Number(e.target.value) } : o) });
                  }} /></div>
                )}
                <div className="space-y-2"><Label>Total</Label><Input readOnly value={opt.total} className="bg-muted font-semibold" /></div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onPatch({
            options: [...row.options!, { id: uid(), label: `Option ${row.options!.length + 1}`, products: [newProduct()], unit: 'm2', quantity: 1, unitRate: 0, total: 0, discount: 0 }],
          })}>
            <Plus className="h-3.5 w-3.5" /> Add option
          </Button>
        </div>
      )}
    </div>
  );
}

function ProductList({
  products,
  onChange,
}: {
  products: { id: string; productName: string; coats: string }[];
  onChange: (p: { id: string; productName: string; coats: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Products / materials</Label>
      {products.map((prod, idx) => (
        <div key={prod.id} className="flex gap-2">
          <Input className="flex-1" placeholder="Product name" value={prod.productName} onChange={(e) => {
            onChange(products.map((p, i) => i === idx ? { ...p, productName: e.target.value } : p));
          }} />
          <Input className="w-24" placeholder="Coats" value={prod.coats} onChange={(e) => {
            onChange(products.map((p, i) => i === idx ? { ...p, coats: e.target.value } : p));
          }} />
          <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive" disabled={products.length <= 1} onClick={() => onChange(products.filter((_, i) => i !== idx))}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...products, newProduct()])}>
        <Plus className="h-3.5 w-3.5" /> Add product row
      </Button>
    </div>
  );
}
