import { useCallback, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { InvoiceStatusBadge } from "@/components/invoice/status-badge";
import { getErrorMessage } from "@/lib/api";
import { buildInvoiceEmail, buildMailtoUrl } from "@/lib/invoice-email";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import {
  formatInvoiceAmount,
  getInvoice,
  markInvoicePaid,
  sendInvoice,
  type Invoice,
} from "@/lib/invoices";
import { extractInvoiceDetails, formatDraftDate } from "@/lib/invoice-draft";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 10,
      }}
    >
      <TextWrapper weight="regular" style={{ fontSize: 14, color: "#8A8A8F", flex: 1 }}>
        {label}
      </TextWrapper>
      <TextWrapper
        weight="medium"
        style={{ fontSize: 14, color: "#171717", flex: 1, textAlign: "right" }}
      >
        {value}
      </TextWrapper>
    </View>
  );
}

export default function InvoiceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<
    "open-email" | "confirm-sent" | "paid" | null
  >(null);
  const [preparedEmail, setPreparedEmail] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!params.id) {
      setError("Missing invoice id.");
      setLoading(false);
      return;
    }
    try {
      const data = await getInvoice(params.id);
      setInvoice(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load invoice."));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadInvoice();
    }, [loadInvoice]),
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const details = invoice ? extractInvoiceDetails(invoice) : null;

  const handleOpenEmailDraft = async () => {
    if (!invoice || !details) return;
    setActionError(null);
    setActionLoading("open-email");
    try {
      const mailto = buildMailtoUrl(buildInvoiceEmail(invoice, details.draft));
      const supported = await Linking.canOpenURL(mailto);
      if (!supported) {
        throw new Error("No mail app is available on this device.");
      }
      await Linking.openURL(mailto);
      setPreparedEmail(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not open email composer."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    setActionError(null);
    setActionLoading("paid");
    try {
      const updated = await markInvoicePaid(invoice.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/invoice-created",
        params: {
          id: updated.id,
          state: "paid",
        },
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not mark this invoice as paid."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmSent = async () => {
    if (!invoice) return;
    setActionError(null);
    setActionLoading("confirm-sent");
    try {
      const updated = await sendInvoice(invoice.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/invoice-created",
        params: {
          id: updated.id,
          state: "sent",
        },
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not mark this invoice as sent."));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F5" }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ paddingTop: 70, paddingBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Pressable onPress={handleBack} hitSlop={12} style={{ position: "absolute", left: 0 }}>
              <ChevronLeftIcon size={24} color="#171717" strokeWidth={2.5} />
            </Pressable>
            <TextWrapper weight="medium" style={{ fontSize: 17, color: "#171717" }}>
              Invoice details
            </TextWrapper>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingTop: 80, alignItems: "center" }}>
            <ActivityIndicator color="#171717" />
          </View>
        ) : error || !invoice || !details ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 80 }}>
            <TextWrapper weight="regular" style={{ fontSize: 15, color: "#8A8A8F", textAlign: "center" }}>
              {error || "Invoice not found."}
            </TextWrapper>
          </View>
        ) : (
          <>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <InvoiceStatusBadge status={invoice.status} />
            </View>

            <View style={{ alignItems: "center", marginTop: 20 }}>
              <TextWrapper weight="medium" style={{ fontSize: 42, color: "#171717" }}>
                {formatInvoiceAmount(details.total, invoice.currency)}
              </TextWrapper>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#8A8A8F", marginTop: 6 }}>
                {details.draft.client_name}
              </TextWrapper>
            </View>

            {(preparedEmail || actionError || invoice.sent_at || invoice.paid_at) ? (
              <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
                <View
                  style={{
                    borderRadius: INVOICE_RADIUS.surface,
                    backgroundColor: actionError ? "#FEF2F2" : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: actionError ? "#FECACA" : "#ECECEC",
                    padding: 14,
                  }}
                >
                  {actionError ? (
                    <TextWrapper weight="medium" style={{ fontSize: 13, color: "#B91C1C" }}>
                      {actionError}
                    </TextWrapper>
                  ) : preparedEmail ? (
                    <TextWrapper weight="regular" style={{ fontSize: 13, color: "#4B5563" }}>
                      Email draft opened. Once you actually send it from your mail app, confirm it here to move the invoice into sent state.
                    </TextWrapper>
                  ) : invoice.status === "paid" ? (
                    <TextWrapper weight="regular" style={{ fontSize: 13, color: "#4B5563" }}>
                      Paid on {formatDraftDate(invoice.paid_at || "")}
                    </TextWrapper>
                  ) : invoice.sent_at ? (
                    <TextWrapper weight="regular" style={{ fontSize: 13, color: "#4B5563" }}>
                      Marked sent on {formatDraftDate(invoice.sent_at)}
                    </TextWrapper>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                borderRadius: INVOICE_RADIUS.surface,
                backgroundColor: "#FFFFFF",
                padding: 18,
              }}
            >
              <DetailRow label="Invoice number" value={details.draft.invoice_number} />
              <DetailRow label="Issue date" value={formatDraftDate(details.draft.issue_date)} />
              <DetailRow label="Due date" value={formatDraftDate(details.draft.due_date)} />
              <DetailRow label="Client" value={details.draft.client_name} />
              <DetailRow label="Client email" value={details.draft.client_email || "—"} />
              <DetailRow label="Project" value={details.draft.project_name || "—"} />
              <DetailRow label="Payment terms" value={details.draft.payment_terms || "—"} />
              <DetailRow label="Payment method" value={details.draft.payment_method || "—"} />
              {details.draft.custom_fields
                .filter((field) => field.label.trim() && field.value.trim())
                .map((field) => (
                  <DetailRow key={field.id} label={field.label.trim()} value={field.value.trim()} />
                ))}
            </View>

            <View
              style={{
                marginHorizontal: 20,
                marginTop: 14,
                borderRadius: INVOICE_RADIUS.surface,
                backgroundColor: "#FFFFFF",
                padding: 18,
              }}
            >
              <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717", marginBottom: 12 }}>
                Line items
              </TextWrapper>
              {details.draft.line_items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
                      {item.description || "Untitled item"}
                    </TextWrapper>
                    <TextWrapper weight="regular" style={{ fontSize: 12, color: "#8A8A8F", marginTop: 4 }}>
                      {item.quantity || "0"} x {formatInvoiceAmount(Number(item.unit_price || 0), invoice.currency)}
                    </TextWrapper>
                  </View>
                  <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
                    {formatInvoiceAmount((Number(item.quantity || 0) || 0) * (Number(item.unit_price || 0) || 0), invoice.currency)}
                  </TextWrapper>
                </View>
              ))}

              <View style={{ height: 1, backgroundColor: "#ECECEC", marginVertical: 8 }} />
              <DetailRow label="Subtotal" value={formatInvoiceAmount(details.subtotal, invoice.currency)} />
              <DetailRow label={`Tax (${details.draft.tax_rate || "0"}%)`} value={formatInvoiceAmount(details.taxAmount, invoice.currency)} />
              <DetailRow label="Total" value={formatInvoiceAmount(details.total, invoice.currency)} />
            </View>

            {details.draft.notes.trim() ? (
              <View
                style={{
                  marginHorizontal: 20,
                  marginTop: 14,
                  borderRadius: INVOICE_RADIUS.surface,
                  backgroundColor: "#FFFFFF",
                  padding: 18,
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717", marginBottom: 10 }}>
                  Notes
                </TextWrapper>
                <TextWrapper weight="regular" style={{ fontSize: 14, lineHeight: 20, color: "#666B74" }}>
                  {details.draft.notes}
                </TextWrapper>
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 12 }}>
              {invoice.status === "draft" ? (
                <>
                  <Pressable
                    onPress={handleOpenEmailDraft}
                    disabled={actionLoading === "open-email"}
                    style={{
                      backgroundColor: "#171717",
                      borderRadius: INVOICE_RADIUS.control,
                      paddingVertical: 18,
                      alignItems: "center",
                      opacity: actionLoading === "open-email" ? 0.7 : 1,
                    }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
                      {actionLoading === "open-email" ? "Opening email..." : "Open email draft"}
                    </TextWrapper>
                  </Pressable>

                  {preparedEmail ? (
                    <Pressable
                      onPress={handleConfirmSent}
                      disabled={actionLoading === "confirm-sent"}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: INVOICE_RADIUS.control,
                        borderWidth: 1,
                        borderColor: "#ECECEC",
                        paddingVertical: 18,
                        alignItems: "center",
                        opacity: actionLoading === "confirm-sent" ? 0.7 : 1,
                      }}
                    >
                      <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                        {actionLoading === "confirm-sent" ? "Updating..." : "I've sent it"}
                      </TextWrapper>
                    </Pressable>
                  ) : null}
                </>
              ) : null}

              {invoice.status === "sent" || invoice.status === "pending" || invoice.status === "overdue" ? (
                <Pressable
                  onPress={handleMarkPaid}
                  disabled={actionLoading === "paid"}
                  style={{
                    backgroundColor: "#171717",
                    borderRadius: INVOICE_RADIUS.control,
                    paddingVertical: 18,
                    alignItems: "center",
                    opacity: actionLoading === "paid" ? 0.7 : 1,
                  }}
                >
                  <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
                    {actionLoading === "paid" ? "Updating..." : "Mark as paid"}
                  </TextWrapper>
                </Pressable>
              ) : null}

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/create-invoice",
                    params: {
                      id: invoice.id,
                      draft: JSON.stringify(details.draft),
                      source: "detail",
                    },
                  })
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: INVOICE_RADIUS.control,
                  borderWidth: 1,
                  borderColor: "#ECECEC",
                  paddingVertical: 18,
                  alignItems: "center",
                }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                  Edit invoice
                </TextWrapper>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
