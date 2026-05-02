import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Path } from "react-native-svg";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { InvoiceStatusBadge } from "@/components/invoice/status-badge";
import { getErrorMessage } from "@/lib/api";
import { buildInvoiceEmail, buildMailtoUrl } from "@/lib/invoice-email";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import {
  formatInvoiceAmount,
  getInvoice,
  sendInvoice,
  type Invoice,
} from "@/lib/invoices";
import { extractInvoiceDetails, formatDraftDate } from "@/lib/invoice-draft";

type SuccessState = "created" | "sent" | "paid";

function SuccessIcon({ tint }: { tint: string }) {
  return (
    <Svg width={52} height={52} viewBox="0 0 52 52" fill="none">
      <Circle cx={26} cy={26} r={26} fill="hsl(0 0% 100%)" />
      <Path
        d="M16 26.5L22.5 33L36.5 19"
        stroke={tint}
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function summaryForState(state: SuccessState, clientName: string): string {
  if (state === "paid") return `${clientName} has been marked as paid.`;
  if (state === "sent") return `${clientName} has been marked as sent and moved into tracking.`;
  return `${clientName} is ready. You can open an email draft now or keep it as a draft and continue to invoices.`;
}

export default function InvoiceCreatedScreen() {
  const params = useLocalSearchParams<{ id?: string; state?: SuccessState }>();
  const successState = (params.state || "created") as SuccessState;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preparedEmail, setPreparedEmail] = useState(false);
  const [actionLoading, setActionLoading] = useState<"open-email" | "confirm-sent" | null>(null);

  const load = useCallback(async () => {
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
      setError(getErrorMessage(err, "Could not load created invoice."));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  useEffect(() => {
    if (successState === "sent" || successState === "paid") {
      const timer = setTimeout(() => {
        router.replace("/(tabs)/invoices");
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [successState]);

  const details = invoice ? extractInvoiceDetails(invoice) : null;

  const handleOpenEmailDraft = async () => {
    if (!invoice || !details) return;
    setActionLoading("open-email");
    setError(null);
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
      setError(getErrorMessage(err, "Could not open email composer."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmSent = async () => {
    if (!invoice) return;
    setActionLoading("confirm-sent");
    setError(null);
    try {
      const updated = await sendInvoice(invoice.id);
      setInvoice(updated);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/invoice-created",
        params: {
          id: updated.id,
          state: "sent",
        },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not mark this invoice as sent."));
    } finally {
      setActionLoading(null);
    }
  };

  const iconTint = useMemo(() => {
    if (successState === "paid") return "hsl(157 70% 35%)";
    if (successState === "sent") return "hsl(218 79% 45%)";
    return "hsl(157 70% 35%)";
  }, [successState]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F5" }}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingTop: 70, paddingBottom: 16, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace("/(tabs)/invoices");
              }}
              hitSlop={12}
              style={{ position: "absolute", left: 0 }}
            >
              <ChevronLeftIcon size={24} color="#171717" strokeWidth={2.5} />
            </Pressable>
            <TextWrapper weight="medium" style={{ fontSize: 17, color: "#171717" }}>
              Invoice success
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
            <View style={{ alignItems: "center", marginTop: 18 }}>
              <View
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 39,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SuccessIcon tint={iconTint} />
              </View>
              <TextWrapper weight="medium" style={{ fontSize: 24, color: "#171717", marginTop: 16 }}>
                {successState === "paid"
                  ? "Invoice paid"
                  : successState === "sent"
                    ? "Invoice sent"
                    : "Invoice created"}
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#8A8A8F",
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 34,
                }}
              >
                {summaryForState(successState, details.draft.client_name)}
              </TextWrapper>
              <View style={{ marginTop: 14 }}>
                <InvoiceStatusBadge status={invoice.status} />
              </View>
            </View>

            <View
              style={{
                marginHorizontal: 20,
                marginTop: 28,
                borderRadius: INVOICE_RADIUS.surface,
                backgroundColor: "#FFFFFF",
                padding: 18,
              }}
            >
              <SummaryRow label="Invoice number" value={details.draft.invoice_number} />
              <SummaryRow label="Client" value={details.draft.client_name} />
              <SummaryRow label="Due date" value={formatDraftDate(details.draft.due_date)} />
              <SummaryRow label="Total" value={formatInvoiceAmount(details.total, invoice.currency)} />
            </View>

            {preparedEmail && successState === "created" ? (
              <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
                <View
                  style={{
                    borderRadius: INVOICE_RADIUS.surface,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#ECECEC",
                    padding: 14,
                  }}
                >
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#4B5563" }}>
                    Email draft opened. Once you have actually sent it from your mail app, confirm below.
                  </TextWrapper>
                </View>
              </View>
            ) : null}

            <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 12 }}>
              {successState === "created" ? (
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

              <Pressable
                onPress={() => router.replace("/(tabs)/invoices")}
                style={{
                  backgroundColor: successState === "created" ? "#FFFFFF" : "#171717",
                  borderRadius: INVOICE_RADIUS.control,
                  borderWidth: successState === "created" ? 1 : 0,
                  borderColor: "#ECECEC",
                  paddingVertical: 18,
                  alignItems: "center",
                }}
              >
                <TextWrapper
                  weight="medium"
                  style={{
                    fontSize: 16,
                    color: successState === "created" ? "#171717" : "#FFFFFF",
                  }}
                >
                  Continue to invoices
                </TextWrapper>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <TextWrapper weight="regular" style={{ fontSize: 14, color: "#8A8A8F" }}>
        {label}
      </TextWrapper>
      <TextWrapper weight="medium" style={{ fontSize: 14, color: "#171717" }}>
        {value}
      </TextWrapper>
    </View>
  );
}
