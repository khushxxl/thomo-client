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
import { shareInvoicePdf } from "@/lib/invoice-pdf";
import {
  formatInvoiceAmount,
  getInvoice,
  markInvoicePaid,
  sendInvoice,
  type Invoice,
} from "@/lib/invoices";
import { extractInvoiceDetails, formatDraftDate } from "@/lib/invoice-draft";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function DetailRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TextWrapper weight="regular" style={{ fontSize: 16, color: "#838383" }}>
        {label}
      </TextWrapper>
      <TextWrapper weight="regular" style={{ fontSize: 16, color: "#4C4C4C", textAlign: "right" }}>
        {value}
      </TextWrapper>
    </View>
  );
}

export default function InvoiceDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"open-email" | "confirm-sent" | "paid" | "pdf" | null>(null);
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
      if (!supported) throw new Error("No mail app is available on this device.");
      await Linking.openURL(mailto);
      setPreparedEmail(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not open email composer."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice || !details) return;
    setActionError(null);
    setActionLoading("pdf");
    try {
      await shareInvoicePdf(invoice, details.draft);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not prepare the invoice PDF."));
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
      router.replace({ pathname: "/invoice-created", params: { id: updated.id, state: "paid" } });
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
      setInvoice(updated);
      setPreparedEmail(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/invoice-created", params: { id: updated.id, state: "sent" } });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not mark this invoice as sent."));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top + 10, paddingBottom: 16, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Pressable onPress={handleBack} hitSlop={12} style={{ position: "absolute", left: 0 }}>
            <ChevronLeftIcon size={24} color="#171717" strokeWidth={2.2} />
          </Pressable>
          <TextWrapper weight="medium" style={{ fontSize: 17, color: "#171717" }}>
            {details?.draft.client_name || "Invoice"}
          </TextWrapper>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#171717" />
        </View>
      ) : error || !invoice || !details ? (
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: "center", alignItems: "center" }}>
          <TextWrapper weight="regular" style={{ fontSize: 15, color: "#71717A", textAlign: "center" }}>
            {error || "Invoice not found."}
          </TextWrapper>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
            <View style={{ alignItems: "center", marginTop: 24 }}>
              <InvoiceStatusBadge status={invoice.status} />
              <TextWrapper weight="medium" style={{ fontSize: 46, color: "#282321", marginTop: 16 }}>
                {formatInvoiceAmount(details.total, invoice.currency)}
              </TextWrapper>
              <TextWrapper weight="regular" style={{ fontSize: 15, color: "#71717A", marginTop: 8 }}>
                {invoice.status === "paid" ? "Invoice Paid" : "Invoice Unpaid"}
              </TextWrapper>
            </View>

            <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  padding: 18,
                  gap: 12,
                }}
              >
                <DetailRow label="Invoice number" value={details.draft.invoice_number} />
                <DetailRow label="Person name" value={details.draft.client_name} />
                <DetailRow label="Company" value={details.draft.project_name || "—"} />
                <DetailRow label="Invoice date" value={formatDraftDate(details.draft.issue_date)} />
                <DetailRow label="Due date" value={formatDraftDate(details.draft.due_date)} />
                <DetailRow label="Income tax" value={formatInvoiceAmount(details.taxAmount, invoice.currency)} />
                <DetailRow label="Total Due" value={formatInvoiceAmount(details.total, invoice.currency)} isLast />
              </View>

              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18, marginTop: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1F1F1F" }}>
                  Invoice #{details.draft.invoice_number.replace(/[^0-9]/g, "") || "Draft"}
                </TextWrapper>
                <Pressable onPress={handleDownloadPdf} disabled={actionLoading !== null}>
                  <TextWrapper weight="medium" style={{ fontSize: 16, color: "#1F1F1F" }}>
                    {actionLoading === "pdf" ? "Preparing..." : "Download PDF"}
                  </TextWrapper>
                </Pressable>
              </View>
              {actionError ? (
                <TextWrapper weight="regular" style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>
                  {actionError}
                </TextWrapper>
              ) : null}
            </View>
          </ScrollView>

          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#F9F9F9", paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 }}>
            {invoice.status === "draft" ? (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => router.push({ pathname: "/create-invoice", params: { id: invoice.id, draft: JSON.stringify(details.draft), source: "detail" } })}
                    style={{ flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#1F1F1F", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center" }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                      Edit Invoice
                    </TextWrapper>
                  </Pressable>

                  <Pressable
                    onPress={handleOpenEmailDraft}
                    disabled={actionLoading !== null}
                    style={{ flex: 1, backgroundColor: "#1F1F1F", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: actionLoading !== null ? 0.7 : 1 }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 16, color: "#FFFFFF" }}>
                      {actionLoading === "open-email" ? "Opening..." : "Send Email"}
                    </TextWrapper>
                  </Pressable>
                </View>
                {preparedEmail ? (
                  <Pressable
                    onPress={handleConfirmSent}
                    disabled={actionLoading !== null}
                    style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#ECECEC", borderRadius: 16, height: 54, alignItems: "center", justifyContent: "center", opacity: actionLoading !== null ? 0.7 : 1 }}
                  >
                    <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                      {actionLoading === "confirm-sent" ? "Updating..." : "I've sent it"}
                    </TextWrapper>
                  </Pressable>
                ) : null}
              </View>
            ) : invoice.status === "paid" ? (
              <View
                style={{ backgroundColor: "rgba(0, 162, 129, 0.05)", borderWidth: 1, borderColor: "#00A281", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: 0.8 }}
              >
                <TextWrapper weight="medium" style={{ fontSize: 16, color: "#00A281" }}>
                  Invoice Paid
                </TextWrapper>
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={handleOpenEmailDraft}
                  disabled={actionLoading !== null}
                  style={{ flex: 1, backgroundColor: "rgba(0, 162, 129, 0.08)", borderWidth: 1, borderColor: "#00A281", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: actionLoading !== null ? 0.7 : 1 }}
                >
                  <TextWrapper weight="medium" style={{ fontSize: 15, color: "#00A281" }}>
                    {actionLoading === "open-email" ? "Opening..." : "Send reminder"}
                  </TextWrapper>
                </Pressable>
                <Pressable
                  onPress={handleMarkPaid}
                  disabled={actionLoading !== null}
                  style={{ flex: 1, backgroundColor: "#1F1F1F", borderRadius: 16, height: 56, alignItems: "center", justifyContent: "center", opacity: actionLoading !== null ? 0.7 : 1 }}
                >
                  <TextWrapper weight="medium" style={{ fontSize: 15, color: "#FFFFFF" }}>
                    {actionLoading === "paid" ? "Updating..." : "Mark paid"}
                  </TextWrapper>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
