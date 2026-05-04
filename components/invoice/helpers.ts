import { parseInvoiceDraftFromNotes } from "@/lib/invoice-draft";
import { invoiceDueText, type Invoice } from "@/lib/invoices";

export function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function avatarTheme(name: string): { bg: string; fg: string } {
  const themes = [
    { bg: "#4867F7", fg: "#FFFFFF" },
    { bg: "#0B0B0F", fg: "#FFFFFF" },
    { bg: "#E8D1BF", fg: "#3B2419" },
    { bg: "#D9E8FF", fg: "#1D3557" },
  ];
  const code = name.charCodeAt(0) || 0;
  return themes[code % themes.length];
}

export function invoiceSubtitle(invoice: Invoice): string {
  const draft = parseInvoiceDraftFromNotes(invoice);
  const date = new Date(invoice.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${draft.invoice_number} • ${date}`;
}

export function dueLabel(invoice: Invoice): string | null {
  const due = invoiceDueText(invoice);
  return due ? due.replace(/^Due /, "Due ") : null;
}
