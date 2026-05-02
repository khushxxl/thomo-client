import { View } from "react-native";
import { TextWrapper } from "@/components/text-wrapper";
import { INVOICE_RADIUS, INVOICE_STATUS_THEME } from "@/lib/invoice-ui";
import type { InvoiceStatus } from "@/lib/invoices";
import { invoiceStatusLabel } from "@/lib/invoice-draft";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const theme = INVOICE_STATUS_THEME[status];

  return (
    <View
      style={{
        backgroundColor: theme.bg,
        borderRadius: INVOICE_RADIUS.chip,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 12, color: theme.text }}>
        {invoiceStatusLabel(status)}
      </TextWrapper>
    </View>
  );
}
