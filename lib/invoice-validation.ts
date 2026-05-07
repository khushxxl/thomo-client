import { parseDateInputValue, parseDecimal, type InvoiceDraft } from "@/lib/invoice-draft";

export type InvoiceFieldErrorMap = {
  invoice_number?: string;
  sender_name?: string;
  client_name?: string;
  issue_date?: string;
  due_date?: string;
  line_items: Record<
    string,
    {
      description?: string;
      quantity?: string;
      unit_price?: string;
    }
  >;
};

export type InvoiceValidationResult = {
  isValid: boolean;
  message: string | null;
  fields: InvoiceFieldErrorMap;
};

export function validateInvoiceDraft(draft: InvoiceDraft): InvoiceValidationResult {
  const fields: InvoiceFieldErrorMap = {
    line_items: {},
  };

  if (!draft.invoice_number.trim()) {
    fields.invoice_number = "Invoice number is required.";
  }
  if (!draft.sender_name.trim()) {
    fields.sender_name = "Business name is required.";
  }
  if (!draft.client_name.trim()) {
    fields.client_name = "Client name is required.";
  }
  if (!draft.issue_date.trim()) {
    fields.issue_date = "Issue date is required.";
  }
  if (!draft.due_date.trim()) {
    fields.due_date = "Due date is required.";
  } else if (
      draft.issue_date.trim() &&
      parseDateInputValue(draft.due_date).getTime() < parseDateInputValue(draft.issue_date).getTime()
    ) {
      fields.due_date = "Due date must be after the issue date.";
    }

  const hasCompletedLineItem = draft.line_items.some(
    (item) =>
      item.description.trim().length > 0 &&
      parseDecimal(item.quantity) > 0 &&
      parseDecimal(item.unit_price) > 0,
  );

  draft.line_items.forEach((item, index) => {
    const itemErrors: { description?: string; quantity?: string; unit_price?: string } = {};
    const hasStartedItem =
      item.description.trim().length > 0 ||
      item.quantity.trim().length > 0 ||
      item.unit_price.trim().length > 0;
    const shouldValidateItem = hasStartedItem || (!hasCompletedLineItem && index === 0);

    if (!shouldValidateItem) {
      return;
    }

    if (!item.description.trim()) {
      itemErrors.description = "Add a description.";
    }
    if (!(parseDecimal(item.quantity) > 0)) {
      itemErrors.quantity = "Enter a quantity greater than zero.";
    }
    if (!(parseDecimal(item.unit_price) > 0)) {
      itemErrors.unit_price = "Enter an amount greater than zero.";
    }
    if (Object.keys(itemErrors).length > 0) {
      fields.line_items[item.id] = itemErrors;
    }
  });

  const hasFieldErrors =
    Boolean(fields.invoice_number) ||
    Boolean(fields.sender_name) ||
    Boolean(fields.client_name) ||
    Boolean(fields.issue_date) ||
    Boolean(fields.due_date) ||
    Object.keys(fields.line_items).length > 0;

  return {
    isValid: !hasFieldErrors,
    message: hasFieldErrors
      ? "A few required invoice details still need attention."
      : null,
    fields,
  };
}
