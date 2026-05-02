import type { InvoiceTemplateId } from "@/lib/invoice-draft";

export type InvoiceTemplateOption = {
  id: InvoiceTemplateId;
  name: string;
  subtitle: string;
  accent: string;
  surface: string;
  highlight: string;
  border: string;
  mood: string;
};

export const INVOICE_TEMPLATE_OPTIONS: InvoiceTemplateOption[] = [
  {
    id: "branded",
    name: "Clean Invoice",
    subtitle: "Simple, professional layout",
    accent: "#000000",
    surface: "#FFFFFF",
    highlight: "#F4F4F5",
    border: "#E7E7E7",
    mood: "Professional, premium, and concise.",
  },
];

export function invoiceTemplateMeta(templateId: InvoiceTemplateId): InvoiceTemplateOption {
  return (
    INVOICE_TEMPLATE_OPTIONS.find((template) => template.id === templateId) ??
    INVOICE_TEMPLATE_OPTIONS[0]
  );
}

export function invoiceTemplatePreviewStyles(templateId: InvoiceTemplateId) {
  const styles = {
    branded: {
      cardBg: "#FFFFFF",
      borderColor: "#E7E7E7",
      badgeBg: "#0A0A0A",
      badgeText: "#FFFFFF",
      headingColor: "#050505",
      accent: "#0A0A0A",
      mutedText: "#4B5563",
      sectionBg: "#F8F8F8",
      inverseText: "#FFFFFF",
    },
    clean: {
      cardBg: "#FFFFFF",
      borderColor: "#ECECEC",
      badgeBg: "#171717",
      badgeText: "#FFFFFF",
      headingColor: "#171717",
      accent: "#171717",
      mutedText: "#71717A",
      sectionBg: "#F4F4F5",
      inverseText: "#FFFFFF",
    },
    modern: {
      cardBg: "#FFFFFF",
      borderColor: "#E5E7EB",
      badgeBg: "#171717",
      badgeText: "#FFFFFF",
      headingColor: "#111827",
      accent: "#171717",
      mutedText: "#6B7280",
      sectionBg: "#F9FAFB",
      inverseText: "#FFFFFF",
    },
    studio: {
      cardBg: "#FFFFFF",
      borderColor: "#E5E7EB",
      badgeBg: "#171717",
      badgeText: "#FFFFFF",
      headingColor: "#171717",
      accent: "#171717",
      mutedText: "#71717A",
      sectionBg: "#FAFAFA",
      inverseText: "#FFFFFF",
    },
  } as const;

  // If a template is deleted but still exists in a draft, fallback to branded styles
  return styles[templateId] || styles.branded;
}
