import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { formatDraftDate, lineItemTotal, parseDecimal, type InvoiceDraft } from "@/lib/invoice-draft";
import { formatInvoiceAmount, type Invoice } from "@/lib/invoices";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function optionalLine(value: string): string {
  return value.trim() ? `<div>${escapeHtml(value.trim())}</div>` : "";
}

function buildInvoiceHtml(invoice: Invoice, draft: InvoiceDraft): string {
  const subtotal = draft.line_items.reduce((sum, item) => sum + lineItemTotal(item), 0);
  const taxRate = parseDecimal(draft.tax_rate);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const invoiceNumber = draft.invoice_number.trim().replace(/^#/, "") || invoice.id;
  const paymentLines = [
    draft.payment_terms ? `Terms: ${draft.payment_terms}` : "",
    draft.payment_method ? `Method: ${draft.payment_method}` : "",
    draft.payment_reference ? `Reference: ${draft.payment_reference}` : "",
    draft.payment_details,
  ].filter((line) => line.trim().length > 0);

  const rows = draft.line_items
    .map((item) => {
      const description = item.description.trim() || "Service";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(description)}</strong>
            <small>${escapeHtml(item.quantity || "0")} x ${formatInvoiceAmount(parseDecimal(item.unit_price), invoice.currency)}</small>
          </td>
          <td class="amount">${formatInvoiceAmount(lineItemTotal(item), invoice.currency)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { margin: 36px; }
          body {
            color: #111;
            font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
            line-height: 1.45;
          }
          .top { display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
          h1 { font-size: 44px; margin: 40px 0 10px; }
          h2 { font-size: 13px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .8px; }
          .muted { color: #666; }
          .section { margin-top: 34px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 42px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th { border-bottom: 2px solid #111; padding: 10px 0; text-align: left; font-size: 12px; }
          td { border-bottom: 1px solid #111; padding: 16px 0; vertical-align: top; }
          td small { display: block; color: #666; margin-top: 4px; }
          .amount { text-align: right; white-space: nowrap; }
          .totals { width: 260px; margin-left: auto; margin-top: 28px; }
          .totals div { display: flex; justify-content: space-between; padding: 7px 0; }
          .total { border-top: 2px solid #111; margin-top: 8px; padding-top: 12px !important; font-size: 20px; font-weight: 700; }
          .notes { color: #555; border-top: 1px solid #ddd; padding-top: 14px; margin-top: 34px; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <div class="brand">${escapeHtml(draft.sender_name || "Thomo user")}</div>
            ${optionalLine(draft.sender_email)}
            ${optionalLine(draft.sender_phone)}
            ${optionalLine(draft.sender_address)}
            ${draft.sender_vat_number ? `<div>VAT: ${escapeHtml(draft.sender_vat_number)}</div>` : ""}
          </div>
          <div class="amount">
            <strong>#${escapeHtml(invoiceNumber)}</strong><br />
            <span class="muted">${formatDraftDate(draft.issue_date)}</span>
          </div>
        </div>

        <h1>Invoice</h1>

        <div class="grid section">
          <div>
            <h2>Billed to</h2>
            ${optionalLine(draft.client_company)}
            ${optionalLine(draft.client_name)}
            ${optionalLine(draft.client_email)}
            ${optionalLine(draft.client_address)}
            ${draft.client_vat_number ? `<div>VAT: ${escapeHtml(draft.client_vat_number)}</div>` : ""}
          </div>
          <div>
            <h2>Details</h2>
            <div>Due date: ${formatDraftDate(draft.due_date)}</div>
            ${draft.project_name ? `<div>Project: ${escapeHtml(draft.project_name)}</div>` : ""}
            ${draft.purchase_order ? `<div>PO: ${escapeHtml(draft.purchase_order)}</div>` : ""}
          </div>
        </div>

        <div class="section">
          <table>
            <thead><tr><th>Item</th><th class="amount">Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <div class="totals">
          <div><span>Subtotal</span><strong>${formatInvoiceAmount(subtotal, invoice.currency)}</strong></div>
          <div><span>Tax (${taxRate}%)</span><strong>${formatInvoiceAmount(taxAmount, invoice.currency)}</strong></div>
          <div class="total"><span>Total</span><span>${formatInvoiceAmount(total, invoice.currency)}</span></div>
        </div>

        ${paymentLines.length ? `
          <div class="section">
            <h2>Payment information</h2>
            ${paymentLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
          </div>
        ` : ""}

        ${draft.notes.trim() ? `<div class="notes">${escapeHtml(draft.notes.trim())}</div>` : ""}
      </body>
    </html>
  `;
}

export async function createInvoicePdf(invoice: Invoice, draft: InvoiceDraft): Promise<string> {
  const { uri } = await Print.printToFileAsync({
    html: buildInvoiceHtml(invoice, draft),
    base64: false,
  });
  return uri;
}

export async function shareInvoicePdf(invoice: Invoice, draft: InvoiceDraft): Promise<void> {
  const uri = await createInvoicePdf(invoice, draft);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: `Invoice ${draft.invoice_number || invoice.id}`,
    UTI: "com.adobe.pdf",
  });
}
