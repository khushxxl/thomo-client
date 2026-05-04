import type { InvoiceStatus } from "@/lib/invoices";

export const INVOICE_RADIUS = {
  surface: 16,
  control: 16, // Matched to Figma button radius
  action: 16,
  chip: 8,
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
    text: "#00A281",
    bg: "rgba(0, 162, 129, 0.1)",
  },
  cancelled: {
    text: "hsl(220 9% 46%)",
    bg: "hsl(220 17% 96%)",
  },
};
