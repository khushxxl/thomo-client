import type { InvoiceStatus } from "@/lib/invoices";

export const INVOICE_RADIUS = {
  surface: 18,
  control: 18,
  chip: 999,
} as const;

export const INVOICE_STATUS_THEME: Record<
  InvoiceStatus,
  { text: string; bg: string }
> = {
  draft: {
    text: "hsl(220 9% 46%)",
    bg: "hsl(220 17% 96%)",
  },
  sent: {
    text: "hsl(218 79% 45%)",
    bg: "hsl(214 100% 96%)",
  },
  pending: {
    text: "hsl(37 92% 42%)",
    bg: "hsl(46 100% 96%)",
  },
  overdue: {
    text: "hsl(7 78% 54%)",
    bg: "hsl(10 100% 97%)",
  },
  paid: {
    text: "hsl(157 70% 35%)",
    bg: "hsl(153 75% 95%)",
  },
  cancelled: {
    text: "hsl(220 9% 46%)",
    bg: "hsl(220 17% 96%)",
  },
};
