import { useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import * as Haptics from "expo-haptics";
import { TextWrapper } from "@/components/text-wrapper";
import { SectionTitle } from "@/components/invoice-builder/shared";
import { formatInvoiceAmount } from "@/lib/invoices";
import {
  calculateInvoiceTotals,
  formatDraftDate,
  lineItemTotal,
  parseDecimal,
  type InvoiceDraft,
} from "@/lib/invoice-draft";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import {
  invoiceTemplateMeta,
  invoiceTemplatePreviewStyles,
} from "@/lib/invoice-templates";

function toTitleCase(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type Props = {
  draft: InvoiceDraft;
  onEdit: () => void;
  onCreate: () => void;
  saving: boolean;
};

function BrandedInvoicePreview({ draft }: { draft: InvoiceDraft }) {
  const totals = calculateInvoiceTotals(draft);
  const signature = draft.signature_name.trim();
  const invoiceNumber = draft.invoice_number.trim().replace(/^#/, "");
  
  const clientLines = [
    draft.client_company,
    toTitleCase(draft.client_name),
    draft.client_email,
    draft.client_address,
    draft.client_vat_number ? `VAT: ${draft.client_vat_number}` : "",
  ].filter((line) => line && line.trim().length > 0);

  const paymentLines = [
    `Name: ${toTitleCase(draft.sender_name || "Thomo user")}`,
    draft.sender_email,
    draft.sender_phone,
    draft.sender_address,
    draft.sender_company_number ? `Co. Reg: ${draft.sender_company_number}` : "",
    draft.sender_vat_number ? `VAT: ${draft.sender_vat_number}` : "",
    draft.payment_details,
  ].filter((line) => line && line.trim().length > 0);

  return (
    <View
      style={{
        aspectRatio: 1 / 1.414,
        borderRadius: INVOICE_RADIUS.surface,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E7E7E7",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
      }}
    >
      {/* Top Header: Invoice # (Right) */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        <View style={{ alignItems: "flex-end" }}>
          {invoiceNumber ? (
            <TextWrapper weight="medium" style={{ fontSize: 10, color: "#111111" }}>
              #{invoiceNumber}
            </TextWrapper>
          ) : null}
        </View>
      </View>

      {/* Main Header Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 20,
        }}
      >
        <View style={{ flex: 1.2, minWidth: 0, marginTop: 10 }}>
          <TextWrapper weight="medium" style={{ fontSize: 12, color: "#000000", marginBottom: 6 }}>
            BILLED TO:
          </TextWrapper>
          {(clientLines.length ? clientLines : ["Client Name"]).map((line, index) => (
            <TextWrapper
              key={`${line}-${index}`}
              weight="regular"
              style={{
                fontSize: 10,
                color: "#333333",
                lineHeight: 14,
                marginTop: index === 0 ? 0 : 2,
              }}
            >
              {line}
            </TextWrapper>
          ))}
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <TextWrapper weight="bold" style={{ fontSize: 30, color: "#000000", lineHeight: 34 }}>
            Invoice
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 10, color: "#111111", marginTop: 4 }}>
            {formatDraftDate(draft.issue_date)}
          </TextWrapper>
        </View>
      </View>

      {/* Thin Horizontal Divider */}
      <View style={{ height: 0.8, backgroundColor: "#EBEBEB", marginTop: 15, marginBottom: 10 }} />

      {/* Table Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 12,
        }}
      >
        <TextWrapper weight="bold" style={{ fontSize: 9, color: "#666666" }}>
          ITEM
        </TextWrapper>
        <TextWrapper weight="bold" style={{ fontSize: 9, color: "#666666" }}>
          TOTAL
        </TextWrapper>
      </View>
      <View style={{ height: 1.2, backgroundColor: "#000000" }} />

      {/* Line Items */}
      {draft.line_items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 6,
            borderBottomWidth: 0.8,
            borderBottomColor: "#000000",
          }}
        >
          <View style={{ flex: 1, paddingRight: 20 }}>
            <TextWrapper weight="regular" style={{ fontSize: 10, color: "#000000", lineHeight: 14 }}>
              {item.description || "Service Description"}
            </TextWrapper>
          </View>
          <TextWrapper weight="regular" style={{ fontSize: 10, color: "#000000" }}>
            {formatInvoiceAmount(lineItemTotal(item), draft.currency)}
          </TextWrapper>
        </View>
      ))}

      {/* Totals Section */}
      <View style={{ alignItems: "flex-end", marginTop: 12 }}>
        <View style={{ width: 120 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 4,
            }}
          >
            <TextWrapper weight="regular" style={{ fontSize: 10, color: "#000000" }}>
              Due Now
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 10, color: "#000000" }}>
              {formatInvoiceAmount(totals.total, draft.currency)}
            </TextWrapper>
          </View>
          <View style={{ height: 1, backgroundColor: "#000000", width: "100%" }} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
            }}
          >
            <TextWrapper weight="bold" style={{ fontSize: 16, color: "#000000" }}>
              Total
            </TextWrapper>
            <TextWrapper weight="bold" style={{ fontSize: 16, color: "#000000" }}>
              {formatInvoiceAmount(totals.total, draft.currency)}
            </TextWrapper>
          </View>
        </View>
      </View>

      {/* Footer Spacer */}
      <View style={{ flex: 1, minHeight: 10 }} />

      {/* Footer: Payment Info and Signature */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <View style={{ flex: 2 }}>
          <TextWrapper weight="medium" style={{ fontSize: 12, color: "#000000", marginBottom: 6 }}>
            Payment Information
          </TextWrapper>
          <View>
            {paymentLines.map((line, i) => (
              <TextWrapper key={i} weight="regular" style={{ fontSize: 9, color: "#444444", lineHeight: 12, marginBottom: 1 }}>
                {line}
              </TextWrapper>
            ))}
          </View>
        </View>

        {signature ? (
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <TextWrapper
              weight="regular"
              numberOfLines={1}
              style={{
                fontSize: 14,
                color: "#111111",
                fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "serif",
                marginBottom: -2,
              }}
            >
              {signature.toLowerCase().replace(/\s+/g, "")}
            </TextWrapper>
            <TextWrapper weight="medium" style={{ fontSize: 12, color: "#000000" }}>
              {toTitleCase(signature)}
            </TextWrapper>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function PreviewStep({ draft, onEdit, onCreate, saving }: Props) {
  const meta = invoiceTemplateMeta(draft.template);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle
          title="Preview"
          subtitle={`${meta.name} is ready. Review the live invoice before you create it.`}
        />

        <BrandedInvoicePreview draft={draft} />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 36,
          paddingTop: 10,
          flexDirection: "row",
          gap: 12,
          backgroundColor: "#F7F7F5",
        }}
      >
        <Pressable
          onPress={onEdit}
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: INVOICE_RADIUS.action,
            borderWidth: 1,
            borderColor: "#ECECEC",
            paddingVertical: 18,
            alignItems: "center",
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
            Edit
          </TextWrapper>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onCreate();
          }}
          disabled={saving}
          style={{
            flex: 1,
            backgroundColor: "#171717",
            borderRadius: INVOICE_RADIUS.action,
            paddingVertical: 18,
            alignItems: "center",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
            {saving ? "Creating..." : "Create invoice"}
          </TextWrapper>
        </Pressable>
      </View>
    </View>
  );
}
