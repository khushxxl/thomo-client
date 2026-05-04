import { formatDraftDate, lineItemTotal, type InvoiceDraft } from "@/lib/invoice-draft";
import { formatInvoiceAmount, type Invoice } from "@/lib/invoices";

export function buildInvoiceEmail(invoice: Invoice, draft: InvoiceDraft): {
  to: string;
  subject: string;
  body: string;
} {
  const to = draft.client_email || "";
  const subject = `${draft.sender_name || "Invoice"} - ${draft.invoice_number}`;
  const total = draft.line_items.reduce((sum, item) => sum + lineItemTotal(item), 0);

  const lines = draft.line_items
    .map(
      (item) =>
        `- ${item.description || "Service"}: ${item.quantity || "0"} x ${formatInvoiceAmount(
          Number(item.unit_price || 0),
          invoice.currency,
        )} = ${formatInvoiceAmount(lineItemTotal(item), invoice.currency)}`,
    )
    .join("\n");

  const body = [
    `Hi ${draft.client_name || "there"},`,
    "",
    `Please find invoice ${draft.invoice_number} details below.`,
    "",
    `Issue date: ${formatDraftDate(draft.issue_date)}`,
    `Due date: ${formatDraftDate(draft.due_date)}`,
    draft.payment_terms ? `Payment terms: ${draft.payment_terms}` : null,
    "",
    "Invoice summary:",
    lines,
    "",
    `Subtotal: ${formatInvoiceAmount(total, invoice.currency)}`,
    draft.notes ? "" : null,
    draft.notes ? `Notes: ${draft.notes}` : null,
    "",
    `Thanks,`,
    draft.sender_name || "Thomo user",
  ]
    .filter(Boolean)
    .join("\n");

  return { to, subject, body };
}

export function buildMailtoUrl({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}): string {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}
