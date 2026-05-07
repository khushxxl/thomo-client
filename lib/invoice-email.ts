import { formatDraftDate, lineItemTotal, type InvoiceDraft } from "@/lib/invoice-draft";
import { createInvoicePdf } from "@/lib/invoice-pdf";
import { formatInvoiceAmount, type Invoice } from "@/lib/invoices";
import * as MailComposer from "expo-mail-composer";
import { Linking } from "react-native";

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

export async function openInvoiceEmailDraft(invoice: Invoice, draft: InvoiceDraft): Promise<void> {
  const { to, subject, body } = buildInvoiceEmail(invoice, draft);
  const isMailAvailable = await MailComposer.isAvailableAsync();

  if (!isMailAvailable) {
    throw new Error(
      "Apple Mail is not configured on this device. Please set up Apple Mail in Settings to send attachments, or use 'Download PDF' to share it via Gmail or other apps.",
    );
  }

  const pdfUri = await createInvoicePdf(invoice, draft);
  await MailComposer.composeAsync({
    recipients: to ? [to] : [],
    subject,
    body,
    attachments: [pdfUri],
  });
}
