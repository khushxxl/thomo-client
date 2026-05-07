import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { formatDraftDate, lineItemTotal, parseDecimal, type InvoiceDraft } from "@/lib/invoice-draft";
import { formatInvoiceAmount, type Invoice } from "@/lib/invoices";

function escapeHtml(value: string): string {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toTitleCase(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function safePdfFileName(value: string): string {
  const cleaned = value
    .trim()
    .replace(/^#/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `Invoice-${cleaned || "draft"}.pdf`;
}

/**
 * Calculates totals for the invoice PDF
 */
function calculateInvoiceTotals(draft: InvoiceDraft) {
  const subtotal = draft.line_items.reduce((sum, item) => sum + lineItemTotal(item), 0);
  const taxRate = parseDecimal(draft.tax_rate);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

function buildInvoiceHtml(invoice: Invoice, draft: InvoiceDraft): string {
  const totals = calculateInvoiceTotals(draft);
  const total = totals.total;
  const invoiceNumber = draft.invoice_number.trim().replace(/^#/, "") || invoice.id;
  const signature = draft.signature_name.trim();

  const clientLines = [
    draft.client_company,
    toTitleCase(draft.client_name),
    draft.client_email,
    draft.client_address,
    draft.client_vat_number ? `VAT: ${draft.client_vat_number}` : "",
  ].filter(Boolean);

  const paymentLines = [
    `Name: ${toTitleCase(draft.sender_name || "Thomo user")}`,
    draft.sender_email,
    draft.sender_phone,
    draft.sender_address,
    draft.sender_company_number ? `Co. Reg: ${draft.sender_company_number}` : "",
    draft.sender_vat_number ? `VAT: ${draft.sender_vat_number}` : "",
    draft.payment_details,
  ].filter((l) => l && l.trim());

  const rows = draft.line_items
    .map((item) => {
      const description = item.description.trim() || "Service";
      return `
        <tr>
          <td>${escapeHtml(description)}</td>
          <td class="amount">${formatInvoiceAmount(
            lineItemTotal(item),
            invoice.currency
          )}</td>
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
  @page {
  margin: 0;
  size: A4;
}

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial;
    color: #000;
    font-size: 13px;
  }

.container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 40px;
  box-sizing: border-box;
}
  /* TOP */
  .top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .invoice-number {
    font-size: 14px;
    font-weight: 500;
  }

  /* HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 50px;
    margin-bottom: 40px;
  }

  .billed {
    max-width: 60%;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: #000;
  }

  .billed div, .sender div {
    margin-bottom: 3px;
    font-weight: 400;
    font-size: 12px;
    color: #333;
  }

  .sender-info {
    margin-bottom: 15px;
  }

  .sender-name {
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 3px;
    color: #000;
  }

  .sender-line {
    font-size: 10px;
    color: #444;
    margin-bottom: 2px;
  }

  .title {
    text-align: right;
  }

  .title h1 {
    font-size: 38px;
    margin: 0;
    font-weight: 700;
  }

  .date {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 400;
  }

  .divider {
    height: 1px;
    background: #eee;
    margin: 30px 0 20px 0;
  }

  /* TABLE */
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-size: 11px;
    padding-bottom: 8px;
    font-weight: 600;
    text-transform: uppercase;
    color: #666;
  }

  th.amount {
    text-align: right;
  }

  td {
    padding: 10px 0;
    border-bottom: 1px solid #000;
    font-size: 13px;
    font-weight: 400;
  }

  td.amount {
    text-align: right;
  }

  /* TOTALS */
  .totals {
    width: 220px;
    margin-left: auto;
    margin-top: 15px;
  }

  .totals div {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
  }

  .totals .final {
    border-top: 1px solid #000;
    font-size: 18px;
    font-weight: 700;
    padding-top: 12px;
  }

  /* FOOTER */
 .footer {
  margin-top: auto;
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  page-break-inside: avoid;
}

  .footer-left {
    width: 70%;
  }

  .payment {
    max-width: 55%;
  }

  .payment-title {
    font-size: 16px;
    font-weight: 500;
    color: #000;
    margin-bottom: 8px;
    white-space: nowrap;
  }

  .payment div {
    font-size: 12px;
    color: #444;
    line-height: 1.5;
    margin-bottom: 2px;
    font-weight: 400;
  }

  .payment-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #000;
    white-space: nowrap;
  }

  .signature {
    text-align: right;
  }

  .signature-script {
    font-family: "Snell Roundhand", "Brush Script MT", cursive;
    font-size: 26px;
    margin-bottom: -4px;
  }

  .signature-name {
    font-size: 16px;
    font-weight: 500;
  }

</style>
</head>

<body>
<div class="container">

  <!-- TOP -->
  <div class="top">
    <div></div>
    <div class="invoice-number">#${escapeHtml(invoiceNumber)}</div>
  </div>

  <!-- HEADER -->
  <div class="header">
    <div class="billed">
      <div class="label">BILLED TO:</div>
      ${(clientLines.length ? clientLines : ["Client Name"])
  .map(l => `<div>${escapeHtml(l).replace(/\n/g, "<br/>")}</div>`)
  .join("")}
    </div>

    <div class="title">
      <h1>Invoice</h1>
      <div class="date">${formatDraftDate(draft.issue_date)}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- TABLE -->
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="amount">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals">
    <div>
      <span>Due Now</span>
      <span>${formatInvoiceAmount(total, invoice.currency)}</span>
    </div>
    <div class="final">
      <span>Total</span>
      <span>${formatInvoiceAmount(total, invoice.currency)}</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">

      <div class="payment">
        <div class="payment-title">Payment Information</div>
        ${paymentLines.map(l => `<div>${escapeHtml(l).replace(/\n/g, "<br/>")}</div>`).join("")}
      </div>
    </div>

    ${
      signature
        ? `
      <div class="signature">
        <div class="signature-script">
          ${escapeHtml(signature.toLowerCase().replace(/\s+/g, ""))}
        </div>
        <div class="signature-name">
          ${escapeHtml(toTitleCase(signature))}
        </div>
      </div>
    `
        : ""
    }
  </div>

</div>
</body>
</html>
`;
}

export async function createInvoicePdf(invoice: Invoice, draft: InvoiceDraft): Promise<string> {
  const { uri } = await Print.printToFileAsync({
    html: buildInvoiceHtml(invoice, draft),
    base64: false,
  });

  if (!FileSystem.cacheDirectory) {
    return uri;
  }

  const fileName = safePdfFileName(draft.invoice_number || invoice.id);
  const pdfUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.deleteAsync(pdfUri, { idempotent: true });
  await FileSystem.copyAsync({ from: uri, to: pdfUri });

  return pdfUri;
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
