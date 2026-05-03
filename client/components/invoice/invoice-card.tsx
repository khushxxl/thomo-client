import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import Svg, { Line } from "react-native-svg";
import { TextWrapper } from "@/components/text-wrapper";
import { CalendarIcon } from "@/components/icons";
import { InvoiceStatusBadge } from "./status-badge";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import { formatInvoiceAmount, type Invoice } from "@/lib/invoices";
import { avatarTheme, initials, invoiceSubtitle, dueLabel } from "./helpers";

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const theme = avatarTheme(invoice.client_name);
  const dueText = dueLabel(invoice);
  const showReminder = Boolean(
    dueText && (invoice.status === "pending" || invoice.status === "overdue"),
  );

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/invoice-detail",
          params: {
            id: invoice.id,
            clientName: invoice.client_name,
            amount: String(invoice.amount),
            status: invoice.status,
            invoiceNumber: invoice.id,
            date: new Date(invoice.created_at).toISOString(),
          },
        })
      }
      style={{ marginBottom: 14 }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: INVOICE_RADIUS.surface,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextWrapper weight="medium" style={{ fontSize: 16, color: theme.fg }}>
              {initials(invoice.client_name)}
            </TextWrapper>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TextWrapper weight="medium" style={{ fontSize: 16, color: "#111111" }}>
                {invoice.client_name}
              </TextWrapper>
              <TextWrapper weight="medium" style={{ fontSize: 16, color: "#09090BCC" }}>
                {formatInvoiceAmount(invoice.amount, invoice.currency)}
              </TextWrapper>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 12, color: "#71717A" }}>
                {invoiceSubtitle(invoice)}
              </TextWrapper>
              <InvoiceStatusBadge status={invoice.status} />
            </View>
          </View>
        </View>

        {showReminder ? (
          <>
            <Svg height="1" width="100%" style={{ marginTop: 14, marginBottom: 12 }}>
              <Line
                x1="0"
                y1="0"
                x2="1000"
                y2="0"
                stroke="#EFEFEF"
                strokeWidth="2"
                strokeDasharray="4, 4"
              />
            </Svg>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <CalendarIcon />
                <TextWrapper weight="regular" style={{ fontSize: 14, color: "#4A4A4E" }}>
                  {dueText}
                </TextWrapper>
              </View>

              <Pressable
                style={{
                  backgroundColor: "#262626",
                  borderRadius: INVOICE_RADIUS.control,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 13, color: "#FFFFFF" }}>
                  Email Reminder
                </TextWrapper>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}
