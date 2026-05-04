import type { ApiTransaction, Profile } from "@/lib/api";
import {
  createCustomField,
  createEmptyInvoiceDraft,
  createLineItem,
  parseInvoiceDraftFromNotes,
  type InvoiceDraft,
} from "@/lib/invoice-draft";
import type { Invoice } from "@/lib/invoices";

export type InvoiceClientSuggestion = {
  id: string;
  name: string;
  email?: string;
  company?: string;
  source: "invoice" | "transaction" | "combined";
  lastAmount?: number;
  lastSeen?: string;
  note?: string;
  draftSeed: Partial<InvoiceDraft>;
};

function normalizedName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function candidateNameFromTransaction(transaction: ApiTransaction): string | null {
  const raw = normalizedName(
    transaction.merchant_name || transaction.description || "",
  );

  if (!raw) return null;
  if (raw.length < 3) return null;
  if (/^(transfer|bank transfer|payment|debit|credit|card purchase)$/i.test(raw)) {
    return null;
  }
  if (/^\d+$/.test(raw)) return null;
  return raw;
}

function senderSeed(profile: Profile | null): Partial<InvoiceDraft> {
  return {
    sender_name: profile?.business_name || profile?.full_name || "",
    sender_email: profile?.email || "",
    sender_phone: profile?.phone || "",
    currency: profile?.currency || "GBP",
  };
}

export function buildInvoiceClientSuggestions(
  invoices: Invoice[],
  transactions: ApiTransaction[],
  profile: Profile | null,
): InvoiceClientSuggestion[] {
  const map = new Map<string, InvoiceClientSuggestion>();

  invoices.forEach((invoice) => {
    const draft = parseInvoiceDraftFromNotes(invoice);
    const name = normalizedName(draft.client_name || invoice.client_name);
    if (!name) return;

    const key = name.toLowerCase();
    const existing = map.get(key);
    const lastSeen = invoice.updated_at || invoice.created_at;
    const baseSeed: Partial<InvoiceDraft> = {
      ...senderSeed(profile),
      client_name: name,
      client_email: draft.client_email,
      client_company: draft.client_company,
      client_address: draft.client_address,
      client_vat_number: draft.client_vat_number,
      payment_terms: draft.payment_terms,
      payment_method: draft.payment_method,
      payment_reference: draft.payment_reference,
      tax_rate: draft.tax_rate,
      notes: draft.notes,
      project_name: draft.project_name,
      purchase_order: draft.purchase_order,
      line_items: draft.line_items.map((item) => createLineItem({ ...item })),
      custom_fields: draft.custom_fields.map((field) =>
        createCustomField({ ...field }),
      ),
    };

    const suggestion: InvoiceClientSuggestion = {
      id: `invoice_${invoice.id}`,
      name,
      email: draft.client_email || undefined,
      company: draft.client_company || undefined,
      source: existing ? "combined" : "invoice",
      lastAmount: invoice.amount,
      lastSeen,
      note: `Last invoiced ${new Date(lastSeen).toLocaleDateString()}`,
      draftSeed: baseSeed,
    };

    if (!existing || new Date(lastSeen).getTime() > new Date(existing.lastSeen || 0).getTime()) {
      map.set(key, suggestion);
    }
  });

  transactions
    .filter((transaction) => transaction.amount > 0)
    .forEach((transaction) => {
      const name = candidateNameFromTransaction(transaction);
      if (!name) return;

      const key = name.toLowerCase();
      const existing = map.get(key);
      const note = transaction.timestamp
        ? `Recent credit on ${new Date(transaction.timestamp).toLocaleDateString()}`
        : "Recent credit";

      const txSuggestion: InvoiceClientSuggestion = existing
        ? {
            ...existing,
            source: existing.source === "invoice" ? "combined" : existing.source,
            lastSeen:
              existing.lastSeen &&
              new Date(existing.lastSeen).getTime() > new Date(transaction.timestamp).getTime()
                ? existing.lastSeen
                : transaction.timestamp,
            note: existing.note || note,
          }
        : {
            id: `transaction_${transaction.transaction_id}`,
            name,
            source: "transaction",
            lastAmount: Math.abs(transaction.amount),
            lastSeen: transaction.timestamp,
            note,
            draftSeed: {
              ...senderSeed(profile),
              client_name: name,
              line_items: [
                createLineItem({
                  description: "Services",
                  quantity: "1",
                  unit_price: Math.abs(transaction.amount).toFixed(2),
                }),
              ],
            },
          };

      map.set(key, txSuggestion);
    });

  return [...map.values()]
    .sort((a, b) => {
      const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
      const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);
}

export function buildInvoiceDraftFromSuggestion(
  suggestion: InvoiceClientSuggestion,
  profile: Profile | null,
): InvoiceDraft {
  const base = createEmptyInvoiceDraft({
    ...senderSeed(profile),
    ...suggestion.draftSeed,
  });

  if (suggestion.lastAmount && base.line_items.every((item) => !item.unit_price)) {
    base.line_items = [
      createLineItem({
        description: base.project_name || "Services",
        quantity: "1",
        unit_price: suggestion.lastAmount.toFixed(2),
      }),
    ];
  }

  return base;
}

export function buildManualClientDraft(
  clientName: string,
  profile: Profile | null,
): InvoiceDraft {
  return createEmptyInvoiceDraft({
    ...senderSeed(profile),
    client_name: normalizedName(clientName),
  });
}
