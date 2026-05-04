import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";

// Components
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import { PlusIcon } from "@/components/icons";
import { InvoiceCard } from "@/components/invoice/invoice-card";
import { CreateInvoiceSheet } from "@/components/invoice/create-invoice-sheet";
import { EmptyInvoicesState } from "@/components/invoice/empty-state";

// Lib & Types
import { INVOICE_RADIUS } from "@/lib/invoice-ui";
import { listInvoices, type Invoice, type InvoiceStatus } from "@/lib/invoices";

const TABS = ["All", "Paid", "Pending", "Overdue", "Drafts"] as const;

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const translateX = useSharedValue(0);

  const sheetRef = useRef<BottomSheetModal>(null);

  // Tab Indicator Animation
  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (layout) {
      translateX.value = withTiming(layout.x + (layout.width - 64) / 2, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [activeTab, tabLayouts, translateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: tabLayouts[activeTab] ? 1 : 0,
  }));

  const visibleInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (activeTab === "All") return true;
      const status = activeTab === "Drafts" ? "draft" : activeTab.toLowerCase();
      return invoice.status === status;
    });
  }, [activeTab, invoices]);

  const loadInvoices = useCallback(async () => {
    try {
      const status = activeTab === "Drafts" ? "draft" : activeTab.toLowerCase();
      const filter = activeTab === "All" ? undefined : (status as InvoiceStatus);
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
    sheetRef.current?.present();
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
            <TextWrapper weight="regular" style={{ fontSize: 15, color: "#8C8C92", textAlign: "center" }}>
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
                visibleInvoices.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)
              ) : (
                <EmptyInvoicesState activeTab={activeTab} />
              )}
            </View>
          </>
        )}
      </ScrollView>

      <View style={{ position: "absolute", bottom: 16, right: 20 }}>
        <Pressable3D shadowColor="transparent" onPress={openCreate}>
          <View
            style={{
              width: 52,
              height: 52,
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

      <CreateInvoiceSheet ref={sheetRef} />
    </View>
  );
}
