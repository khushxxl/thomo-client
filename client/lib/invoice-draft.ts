import type { CreateInvoiceInput, Invoice } from "@/lib/invoices";

export type InvoiceTemplateId = "branded";

export type InvoiceLineItemDraft = {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
};

export type InvoiceCustomFieldDraft = {
  id: string;
  label: string;
  value: string;
};

export type InvoiceDraft = {
  template: InvoiceTemplateId;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  status: "draft" | "sent";
  brand_mark: string;
  brand_logo_url: string;
  signature_name: string;
  project_name: string;
  purchase_order: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_vat_number: string;
  sender_company_number: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_address: string;
  client_vat_number: string;
  notes: string;
  payment_terms: string;
  payment_method: string;
  payment_reference: string;
  payment_details: string;
  tax_rate: string;
  line_items: InvoiceLineItemDraft[];
  custom_fields: InvoiceCustomFieldDraft[];
};

export type ParsedInvoiceDetails = {
  draft: InvoiceDraft;
  subtotal: number;
  taxAmount: number;
  total: number;
};

const NOTE_PREFIX = "[thomo_invoice_v1]";

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function isoDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function createEmptyInvoiceDraft(seed?: Partial<InvoiceDraft>): InvoiceDraft {
  return {
    template: "branded",
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    issue_date: isoDate(0),
    due_date: isoDate(14),
    currency: "GBP",
    status: "draft",
    brand_mark: "",
    brand_logo_url: "",
    signature_name: "",
    project_name: "",
    purchase_order: "",
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    sender_address: "",
    sender_vat_number: "",
    sender_company_number: "",
    client_name: "",
    client_company: "",
    client_email: "",
    client_address: "",
    client_vat_number: "",
    notes: "",
    payment_terms: "",
    payment_method: "",
    payment_reference: "",
    payment_details: "",
    tax_rate: "0",
    line_items: [
      {
        id: makeId("item"),
        description: "",
        quantity: "1",
        unit_price: "",
      },
    ],
    custom_fields: [],
    ...seed,
  };
}

export function createLineItem(seed?: Partial<InvoiceLineItemDraft>): InvoiceLineItemDraft {
  return {
    id: makeId("item"),
    description: "",
    quantity: "1",
    unit_price: "",
    ...seed,
  };
}

export function createCustomField(seed?: Partial<InvoiceCustomFieldDraft>): InvoiceCustomFieldDraft {
  return {
    id: makeId("field"),
    label: "",
    value: "",
    ...seed,
  };
}

export function parseDecimal(value: string): number {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function lineItemTotal(item: InvoiceLineItemDraft): number {
  return parseDecimal(item.quantity) * parseDecimal(item.unit_price);
}

export function calculateInvoiceTotals(draft: InvoiceDraft): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = draft.line_items.reduce((sum, item) => sum + lineItemTotal(item), 0);
  const taxRate = parseDecimal(draft.tax_rate);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export function serializeInvoiceDraft(draft: InvoiceDraft): string {
  return `${NOTE_PREFIX}${JSON.stringify(draft)}`;
}

function fallbackDraftFromInvoice(invoice: Invoice): InvoiceDraft {
  return createEmptyInvoiceDraft({
    client_name: invoice.client_name,
    due_date: invoice.due_date ?? isoDate(14),
    status: invoice.status === "sent" ? "sent" : "draft",
    notes: invoice.notes ?? "",
    line_items: [
      createLineItem({
        description: invoice.client_name,
        quantity: "1",
        unit_price: String(invoice.amount),
      }),
    ],
  });
}

export function parseInvoiceDraftFromNotes(invoice: Invoice): InvoiceDraft {
  const raw = invoice.notes?.trim();
  if (!raw || !raw.startsWith(NOTE_PREFIX)) {
    return fallbackDraftFromInvoice(invoice);
  }

  try {
    const parsed = JSON.parse(raw.slice(NOTE_PREFIX.length)) as Partial<InvoiceDraft>;
    const draft = createEmptyInvoiceDraft(parsed);
    draft.line_items = (parsed.line_items ?? draft.line_items).map((item) =>
      createLineItem(item),
    );
    draft.custom_fields = (parsed.custom_fields ?? []).map((field) =>
      createCustomField(field),
    );
    return draft;
  } catch {
    return fallbackDraftFromInvoice(invoice);
  }
}

export function buildInvoiceCreateInput(draft: InvoiceDraft): CreateInvoiceInput {
  const totals = calculateInvoiceTotals(draft);
  return {
    client_name: draft.client_name.trim(),
    amount: totals.total,
    currency: draft.currency,
    status: draft.status,
    due_date: draft.due_date || undefined,
    notes: serializeInvoiceDraft(draft),
  };
}

export function extractInvoiceDetails(invoice: Invoice): ParsedInvoiceDetails {
  const draft = parseInvoiceDraftFromNotes(invoice);
  const totals = calculateInvoiceTotals(draft);
  return { draft, ...totals };
}

export function invoiceStatusLabel(status: Invoice["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDraftDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
