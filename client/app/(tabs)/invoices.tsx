import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import {
  CalendarIcon,
  PlusIcon,
  DocIcon,
  ThomoSmallIcon,
} from "@/components/icons";
import * as Haptics from "expo-haptics";
import Svg, { Line } from "react-native-svg";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { InvoiceStatusBadge } from "@/components/invoice/status-badge";
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import {
  formatInvoiceAmount,
  invoiceDueText,
  listInvoices,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices";
import { parseInvoiceDraftFromNotes } from "@/lib/invoice-draft";

const TABS = ["All", "Paid", "Pending", "Overdue", "Drafts",] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function avatarTheme(name: string): { bg: string; fg: string } {
  const themes = [
    { bg: "#4867F7", fg: "#FFFFFF" },
    { bg: "#0B0B0F", fg: "#FFFFFF" },
    { bg: "#E8D1BF", fg: "#3B2419" },
    { bg: "#D9E8FF", fg: "#1D3557" },
  ];
  const code = name.charCodeAt(0) || 0;
  return themes[code % themes.length];
}

function invoiceSubtitle(invoice: Invoice): string {
  const draft = parseInvoiceDraftFromNotes(invoice);
  const date = new Date(invoice.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${draft.invoice_number} • ${date}`;
}

function dueLabel(invoice: Invoice): string | null {
  const due = invoiceDueText(invoice);
  return due ? due.replace(/^Due /, "Due ") : null;
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
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
                <CalendarIcon  />
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

type CreateOption = "thomo" | "manual";

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const translateX = useSharedValue(0);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["38%"], []);

  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (layout) {
      translateX.value = withTiming(layout.x + (layout.width - 64) / 2, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smooth ease-in-out
      });
    }
  }, [activeTab, tabLayouts, translateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: tabLayouts[activeTab] ? 1 : 0,
  }));

  const visibleInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        if (activeTab === "All") return true;
        const status = activeTab === "Drafts" ? "draft" : activeTab.toLowerCase();
        return invoice.status === status;
      }),
    [activeTab, invoices],
  );

  const loadInvoices = useCallback(async () => {
    try {
      const status = activeTab === "Drafts" ? "draft" : activeTab.toLowerCase();
      const filter =
        activeTab === "All"
          ? undefined
          : (status as InvoiceStatus);
      const data = await listInvoices(filter);
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setInvoices([]);
      setError("Could not load invoices right now.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadInvoices();
  }, [loadInvoices]);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  }, [loadInvoices]);

  const openCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sheetRef.current?.expand();
  };

  const handleOptionSelect = (option: CreateOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sheetRef.current?.close();
    if (option === "thomo") {
      router.push("/thomo-invoice-chat");
    } else {
      router.push("/create-invoice");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F5" }}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 10, 22),
          paddingBottom: Math.max(insets.bottom + 98, 116),
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 24, color: "#171717" }}>
            Invoices
          </TextWrapper>

          <Pressable
            onPress={openCreate}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: INVOICE_RADIUS.control,
              paddingHorizontal: 12,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusIcon size={14} color="#000000" />
            <TextWrapper weight="regular" style={{ fontSize: 12, color: "#1F1F1F" }}>
              Invoice
            </TextWrapper>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", paddingHorizontal: 20, marginTop: 18, gap: 4 }}>
          {TABS.map((tab) => {
            const selected = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  setTabLayouts((prev) => ({ ...prev, [tab]: { x, width } }));
                }}
                style={{ paddingBottom: 12, minWidth: 60, paddingHorizontal: 12, alignItems: "center" }}
              >
                <TextWrapper
                  weight={selected ? "medium" : "regular"}
                  style={{
                    fontSize: 16,
                    color: selected ? "#1F1F1F" : "#8C8C92",
                  }}
                >
                  {tab}
                </TextWrapper>
              </Pressable>
            );
          })}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                height: 3,
                width: 64,
                backgroundColor: "#1F1F1F",
                borderRadius: 6,
              },
              animatedIndicatorStyle,
            ]}
          />
        </View>

        <View style={{ height: 1, backgroundColor: "#ECECEC" }} />

        {loading ? (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <ActivityIndicator color="#171717" />
          </View>
        ) : error ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 60 }}>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 15, color: "#8C8C92", textAlign: "center" }}
            >
              {error}
            </TextWrapper>
          </View>
        ) : (
          <>
            <View style={{ paddingHorizontal: 20, marginTop: 14, marginBottom: 14 }}>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#71717A" }}>
                Recent Activity
              </TextWrapper>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              {visibleInvoices.length > 0 ? (
                visibleInvoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))
              ) : (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: INVOICE_RADIUS.surface,
                    paddingHorizontal: 18,
                    paddingVertical: 28,
                    alignItems: "center",
                  }}
                >
                  <TextWrapper weight="medium" style={{ fontSize: 16, color: "#171717" }}>
                    No invoices here
                  </TextWrapper>
                  <TextWrapper
                    weight="regular"
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      lineHeight: 20,
                      color: "#8C8C92",
                      textAlign: "center",
                    }}
                  >
                    {activeTab === "All"
                      ? "Create your first invoice to start tracking receivables."
                      : `No ${activeTab.toLowerCase()} invoices right now.`}
                  </TextWrapper>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          right: 28,
          bottom: 28,
        }}
      >
        <Pressable3D shadowColor="transparent" onPress={openCreate}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "#262626",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon size={24} color="#FFFFFF" />
          </View>
        </Pressable3D>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
          />
        )}
        backgroundStyle={{ backgroundColor: "#FFFFFF" }}
        handleIndicatorStyle={{ backgroundColor: "#D4D4D4" }}
      >
        <BottomSheetView
          style={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 40,
          }}
        >
          <TextWrapper weight="medium" style={{ fontSize: 20, color: "#1A1A1A" }}>
            Create an invoice
          </TextWrapper>
          <TextWrapper
            weight="regular"
            style={{
              fontSize: 14,
              color: "#999",
              marginTop: 4,
              marginBottom: 24,
            }}
          >
            Choose how you want to get started
          </TextWrapper>

          <Pressable
            onPress={() => handleOptionSelect("thomo")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#E5E5E5",
              borderRadius: INVOICE_RADIUS.surface,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <ThomoSmallIcon size={32} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextWrapper weight="medium" style={{ fontSize: 15, color: "#1A1A1A" }}>
                Thomo AI
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999", marginTop: 2 }}
              >
                Type once, Thomo takes over
              </TextWrapper>
            </View>
            <TextWrapper weight="regular" style={{ fontSize: 18, color: "#999" }}>
              ›
            </TextWrapper>
          </Pressable>

          <Pressable
            onPress={() => handleOptionSelect("manual")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#E5E5E5",
              borderRadius: INVOICE_RADIUS.surface,
              padding: 16,
            }}
          >
            <DocIcon size={28} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextWrapper weight="medium" style={{ fontSize: 15, color: "#1A1A1A" }}>
                Create manually
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999", marginTop: 2 }}
              >
                Fill in the details yourself
              </TextWrapper>
            </View>
            <TextWrapper weight="regular" style={{ fontSize: 18, color: "#999" }}>
              ›
            </TextWrapper>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
