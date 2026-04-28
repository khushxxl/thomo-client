import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import * as Haptics from "expo-haptics";
import Svg, { Path, Rect, Line } from "react-native-svg";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  listInvoices,
  formatInvoiceAmount,
  invoiceDueText,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/invoices";
import { getErrorMessage } from "@/lib/api";

const TABS = ["All", "Paid", "Pending", "Overdue", "Draft"] as const;

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  overdue: "#F02E24",
  paid: "#00A281",
  pending: "#F2A41B",
  sent: "#F2A41B",
  draft: "#999",
  cancelled: "#999",
};

function CalendarIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x={2.5}
        y={4}
        width={15}
        height={13}
        rx={2}
        stroke="#999"
        strokeWidth={1.3}
      />
      <Line
        x1={2.5}
        y1={8}
        x2={17.5}
        y2={8}
        stroke="#999"
        strokeWidth={1.3}
      />
      <Line
        x1={6.5}
        y1={2.5}
        x2={6.5}
        y2={5.5}
        stroke="#999"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <Line
        x1={13.5}
        y1={2.5}
        x2={13.5}
        y2={5.5}
        stroke="#999"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlusIcon({
  size = 20,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 4V16M4 10H16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ThomoSmallIcon({ size = 28 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 11, color: "#fff" }}>
        th.
      </TextWrapper>
    </View>
  );
}

function DocIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={2}
        width={16}
        height={20}
        rx={2}
        stroke="#999"
        strokeWidth={1.5}
      />
      <Path
        d="M8 7H16M8 11H16M8 15H12"
        stroke="#999"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const statusLabel =
    invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1);
  const dueText = invoiceDueText(invoice);
  const statusColor = STATUS_COLORS[invoice.status] ?? "#999";

  const handlePress = () => {
    router.push({
      pathname: "/invoice-detail",
      params: {
        id: invoice.id,
        clientName: invoice.client_name,
        amount: String(invoice.amount),
        status: invoice.status,
        invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
        date: new Date(invoice.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <View className="mx-5 rounded-2xl bg-white" style={{ padding: 18 }}>
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#4A90D9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextWrapper
              weight="medium"
              style={{ fontSize: 16, color: "#fff" }}
            >
              {initials(invoice.client_name)}
            </TextWrapper>
          </View>

          <View style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between">
              <TextWrapper
                weight="medium"
                style={{ fontSize: 16, color: "#1A1A1A" }}
              >
                {invoice.client_name}
              </TextWrapper>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 16, color: "#1A1A1A" }}
              >
                {formatInvoiceAmount(invoice.amount, invoice.currency)}
              </TextWrapper>
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999" }}
              >
                {new Date(invoice.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TextWrapper>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 13, color: statusColor }}
              >
                {statusLabel}
              </TextWrapper>
            </View>
          </View>
        </View>

        {dueText && (
          <>
            <View
              style={{
                marginTop: 14,
                marginBottom: 14,
                borderStyle: "dashed",
                borderWidth: 0,
                borderTopWidth: 1,
                borderColor: "#DDD",
              }}
            />
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <CalendarIcon size={18} />
                <TextWrapper
                  weight="regular"
                  style={{ fontSize: 14, color: "#666" }}
                >
                  {dueText}
                </TextWrapper>
              </View>
              <Pressable
                style={{
                  backgroundColor: "#1A1A1A",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                <TextWrapper
                  weight="medium"
                  style={{ fontSize: 13, color: "#fff" }}
                >
                  Email Reminder
                </TextWrapper>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}

type CreateOption = "thomo" | "manual";

export default function InvoicesScreen() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["38%"], []);

  const loadInvoices = useCallback(async () => {
    try {
      const filter =
        activeTab === "All"
          ? undefined
          : (activeTab.toLowerCase() as InvoiceStatus);
      const data = await listInvoices(filter);
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setInvoices([]);
      setError(getErrorMessage(err, "Could not load invoices."));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadInvoices();
  }, [loadInvoices]);

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
      router.push("/thomo-chat");
    } else {
      router.push("/create-invoice");
    }
  };

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-20 pb-2">
          <TextWrapper
            weight="medium"
            style={{ fontSize: 24, color: "#1A1A1A" }}
          >
            Invoices
          </TextWrapper>
          <Pressable
            onPress={openCreate}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <PlusIcon size={14} color="#1A1A1A" />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 14, color: "#1A1A1A" }}
            >
              Invoice
            </TextWrapper>
          </Pressable>
        </View>

        {/* Filter tabs */}
        <View className="flex-row px-6 mt-4" style={{ gap: 24 }}>
          {TABS.map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <TextWrapper
                weight={activeTab === tab ? "medium" : "regular"}
                style={{
                  fontSize: 15,
                  color: activeTab === tab ? "#1A1A1A" : "#999",
                  paddingBottom: 10,
                }}
              >
                {tab}
              </TextWrapper>
              {activeTab === tab && (
                <View
                  style={{
                    height: 2.5,
                    backgroundColor: "#1A1A1A",
                    borderRadius: 2,
                  }}
                />
              )}
            </Pressable>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />

        {/* Content */}
        {loading ? (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <ActivityIndicator color="#1A1A1A" />
          </View>
        ) : error ? (
          <View style={{ paddingTop: 60, alignItems: "center", paddingHorizontal: 24 }}>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 15, color: "#888", textAlign: "center" }}
            >
              {error}
            </TextWrapper>
          </View>
        ) : invoices.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 15, color: "#888" }}
            >
              {activeTab === "All"
                ? "No invoices yet. Create one to get started."
                : `No ${activeTab.toLowerCase()} invoices.`}
            </TextWrapper>
          </View>
        ) : (
          <>
            <View className="px-6 pt-5 pb-3">
              <TextWrapper
                weight="regular"
                style={{ fontSize: 14, color: "#999" }}
              >
                {invoices.length} invoice{invoices.length !== 1 && "s"}
              </TextWrapper>
            </View>

            <View style={{ gap: 12 }}>
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add FAB */}
      <View style={{ position: "absolute", bottom: 16, right: 20 }}>
        <Pressable3D shadowColor="#000" onPress={openCreate}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#1A1A1A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon size={22} color="#fff" />
          </View>
        </Pressable3D>
      </View>

      {/* Create Invoice Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
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
          <TextWrapper
            weight="medium"
            style={{ fontSize: 20, color: "#1A1A1A" }}
          >
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
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <ThomoSmallIcon size={32} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 15, color: "#1A1A1A" }}
              >
                Thomo AI
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999", marginTop: 2 }}
              >
                Type once, Thomo takes over
              </TextWrapper>
            </View>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 18, color: "#999" }}
            >
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
              borderRadius: 14,
              padding: 16,
            }}
          >
            <DocIcon size={28} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 15, color: "#1A1A1A" }}
              >
                Create manually
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999", marginTop: 2 }}
              >
                Fill in the details yourself
              </TextWrapper>
            </View>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 18, color: "#999" }}
            >
              ›
            </TextWrapper>
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
