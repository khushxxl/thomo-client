import { apiJson } from "@/lib/api";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type Invoice = {
  id: string;
  user_id: string;
  client_name: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateInvoiceInput = {
  client_name: string;
  amount: number;
  currency?: string;
  status?: InvoiceStatus;
  due_date?: string;
  notes?: string;
};

export type UpdateInvoiceInput = Partial<
  Pick<
    Invoice,
    | "client_name"
    | "amount"
    | "currency"
    | "status"
    | "due_date"
    | "notes"
    | "sent_at"
    | "paid_at"
  >
>;

export async function listInvoices(
  statusFilter?: InvoiceStatus,
): Promise<Invoice[]> {
  const qs = statusFilter ? `?status=${statusFilter}` : "";
  const data = await apiJson<{ invoices: Invoice[] }>(`/invoices${qs}`);
  return data.invoices;
}

export async function getInvoice(id: string): Promise<Invoice> {
  return apiJson<Invoice>(`/invoices/${id}`);
}

export async function createInvoice(
  input: CreateInvoiceInput,
): Promise<Invoice> {
  return apiJson<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput,
): Promise<Invoice> {
  return apiJson<Invoice>(`/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  await apiJson<void>(`/invoices/${id}`, { method: "DELETE" });
}

export function formatInvoiceAmount(
  amount: number,
  currency: string = "GBP",
): string {
  const symbol = currency === "GBP" ? "\u00a3" : currency === "USD" ? "$" : "";
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function invoiceDueText(invoice: Invoice): string | null {
  if (!invoice.due_date) return null;
  if (invoice.status === "paid") return null;

  const now = new Date();
  const due = new Date(invoice.due_date);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return `Due ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
  if (diffDays === 0) return "Due today";
  return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}
