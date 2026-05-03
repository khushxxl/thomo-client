import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
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

type Props = {
  draft: InvoiceDraft;
  onEdit: () => void;
  onCreate: () => void;
  saving: boolean;
};

function BrandedInvoicePreview({ draft }: { draft: InvoiceDraft }) {
  const [logoLoading, setLogoLoading] = useState(false);
  const styles = invoiceTemplatePreviewStyles("branded");
  const totals = calculateInvoiceTotals(draft);
  const signature = draft.signature_name.trim();
  const brandMark = draft.brand_mark.trim();
  const invoiceNumber = draft.invoice_number.trim().replace(/^#/, "");
  const clientLines = [
    draft.client_company,
    draft.client_name,
    draft.client_address,
    draft.client_vat_number ? `VAT: ${draft.client_vat_number}` : "",
  ].filter((line) => line.trim().length > 0);
  const metaRows = [
    { label: "Due date", value: formatDraftDate(draft.due_date) },
    { label: "Project", value: draft.project_name },
    { label: "PO number", value: draft.purchase_order },
    ...draft.custom_fields
      .filter((field) => field.label.trim() && field.value.trim())
      .map((field) => ({ label: field.label.trim(), value: field.value.trim() })),
  ].filter((row) => row.value.trim().length > 0 && row.value !== "—");
  const paymentLines = [
    draft.payment_terms ? `Terms: ${draft.payment_terms}` : "",
    draft.payment_method ? `Method: ${draft.payment_method}` : "",
    draft.payment_reference ? `Reference: ${draft.payment_reference}` : "",
    draft.payment_details,
  ].filter((line) => line.trim().length > 0);

  return (
    <View
      style={{
        minHeight: 820,
        borderRadius: INVOICE_RADIUS.surface,
        backgroundColor: styles.cardBg,
        borderWidth: 1,
        borderColor: styles.borderColor,
        paddingHorizontal: 30,
        paddingTop: 28,
        paddingBottom: 30,
      }}
    >
      <View style={{ alignItems: "flex-end", minHeight: 24 }}>
        {invoiceNumber ? (
          <TextWrapper weight="medium" style={{ fontSize: 17, color: styles.headingColor }}>
            #{invoiceNumber}
          </TextWrapper>
        ) : null}
      </View>

      <View style={{ alignItems: "center", marginTop: 12 }}>
        {draft.brand_logo_url ? (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: INVOICE_RADIUS.surface,
              overflow: "hidden",
              marginBottom: 18,
            }}
          >
            <Image
              source={{ uri: draft.brand_logo_url }}
              style={{ width: "100%", height: "100%", backgroundColor: "#FFFFFF" }}
              contentFit="contain"
              onLoadStart={() => setLogoLoading(true)}
              onLoadEnd={() => setLogoLoading(false)}
            />
            {logoLoading ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.82)",
                }}
              >
                <ActivityIndicator color={styles.headingColor} />
              </View>
            ) : null}
          </View>
        ) : brandMark ? (
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: INVOICE_RADIUS.surface,
              backgroundColor: styles.accent,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <TextWrapper weight="bold" style={{ color: "#FFFFFF", fontSize: 30 }}>
              {brandMark.slice(0, 4)}
            </TextWrapper>
          </View>
        ) : null}

        <TextWrapper weight="bold" style={{ fontSize: 42, color: styles.headingColor }}>
          Invoice
        </TextWrapper>
        <TextWrapper
          weight="regular"
          style={{ fontSize: 18, color: styles.headingColor, marginTop: 18 }}
        >
          {formatDraftDate(draft.issue_date)}
        </TextWrapper>
      </View>

      <View style={{ marginTop: 58, maxWidth: "72%" }}>
        <TextWrapper weight="bold" style={{ fontSize: 11, color: styles.headingColor }}>
          BILLED TO:
        </TextWrapper>
        {(clientLines.length ? clientLines : ["Client name"]).map((line, index) => (
          <TextWrapper
            key={`${line}-${index}`}
            weight={index === 0 ? "medium" : "regular"}
            style={{
              fontSize: 14,
              color: styles.headingColor,
              lineHeight: 20,
              marginTop: index === 0 ? 10 : 2,
            }}
          >
            {line}
          </TextWrapper>
        ))}
      </View>

      {metaRows.length ? (
        <View
          style={{
            marginTop: 28,
            borderTopWidth: 1,
            borderTopColor: "#E7E7E7",
            paddingTop: 14,
            gap: 8,
          }}
        >
          {metaRows.map((row) => (
            <View
              key={row.label}
              style={{ flexDirection: "row", justifyContent: "space-between", gap: 18 }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 12, color: "#737373" }}>
                {row.label}
              </TextWrapper>
              <TextWrapper
                weight="medium"
                style={{ flex: 1, fontSize: 12, color: styles.headingColor, textAlign: "right" }}
              >
                {row.value}
              </TextWrapper>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: 46 }}>
        <View style={{ height: 1.5, backgroundColor: styles.headingColor, marginBottom: 12 }} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 4,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(5,5,5,0.32)",
          }}
        >
          <TextWrapper weight="regular" style={{ fontSize: 12, color: styles.headingColor }}>
            Item
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 12, color: styles.headingColor }}>
            Total
          </TextWrapper>
        </View>

        {draft.line_items.map((item) => (
          <View
            key={item.id}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: styles.headingColor,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 18,
              paddingHorizontal: 4,
            }}
          >
            <View style={{ flex: 1, paddingRight: 16 }}>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 14, color: styles.headingColor, lineHeight: 20 }}
              >
                {item.description || "Untitled item"}
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 11, color: "#737373", lineHeight: 16, marginTop: 3 }}
              >
                {item.quantity || "0"} x{" "}
                {formatInvoiceAmount(parseDecimal(item.unit_price), draft.currency)}
              </TextWrapper>
            </View>
            <TextWrapper weight="medium" style={{ fontSize: 14, color: styles.headingColor }}>
              {formatInvoiceAmount(lineItemTotal(item), draft.currency)}
            </TextWrapper>
          </View>
        ))}

        <View style={{ alignItems: "flex-end", marginTop: 26 }}>
          <View style={{ width: "50%", minWidth: 188 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <TextWrapper weight="medium" style={{ fontSize: 15, color: styles.headingColor }}>
                Due Now
              </TextWrapper>
              <TextWrapper weight="medium" style={{ fontSize: 15, color: styles.headingColor }}>
                {formatInvoiceAmount(totals.total, draft.currency)}
              </TextWrapper>
            </View>
            <View style={{ height: 1.5, backgroundColor: styles.headingColor, marginBottom: 16 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TextWrapper weight="bold" style={{ fontSize: 20, color: styles.headingColor }}>
                Total
              </TextWrapper>
              <TextWrapper weight="bold" style={{ fontSize: 20, color: styles.headingColor }}>
                {formatInvoiceAmount(totals.total, draft.currency)}
              </TextWrapper>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, minHeight: 72 }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 18,
        }}
      >
        <View style={{ flex: 1.35 }}>
          {paymentLines.length ? (
            <>
              <TextWrapper weight="bold" style={{ fontSize: 14, color: styles.headingColor }}>
                Payment Information
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{
                  fontSize: 12.5,
                  color: styles.headingColor,
                  lineHeight: 18,
                  marginTop: 8,
                }}
              >
                {paymentLines.join("\n")}
              </TextWrapper>
            </>
          ) : null}
        </View>

        {signature ? (
          <View style={{ alignItems: "flex-end", flex: 1 }}>
            <TextWrapper
              weight="regular"
              style={{
                fontSize: 16,
                color: styles.headingColor,
                fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "serif",
                marginBottom: -4,
              }}
            >
              {signature.toLowerCase().replace(/\s+/g, "")}
            </TextWrapper>
            <TextWrapper
              weight="bold"
              style={{ fontSize: 15, color: styles.headingColor, textAlign: "right" }}
            >
              {signature}
            </TextWrapper>
          </View>
        ) : null}
      </View>

      {draft.notes.trim() ? (
        <View style={{ marginTop: 26, borderTopWidth: 1, borderTopColor: "#E7E7E7", paddingTop: 14 }}>
          <TextWrapper weight="regular" style={{ fontSize: 12, lineHeight: 18, color: "#525252" }}>
            {draft.notes.trim()}
          </TextWrapper>
        </View>
      ) : null}
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
