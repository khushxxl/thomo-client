import { memo, useMemo, useRef, useState } from "react";
import {
  View,
  SectionList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  type SectionListData,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { Pressable3D } from "@/components/pressable-3d";
import { ThomoFabIcon } from "@/components/icons/thomo-fab-icon";
import {
  ConnectBankSheet,
  type ConnectBankSheetRef,
} from "@/components/connect-bank-sheet";
import { type ApiTransaction } from "@/lib/api";
import { useThomo } from "@/lib/thomo-context";
import { formatCurrency } from "@/lib/money";
import Svg, { Path, Circle as SvgCircle } from "react-native-svg";

type Section = {
  title: string;
  dateKey: string;
  data: ApiTransaction[];
};

function formatAmount(amount: number, currency: string): string {
  return formatCurrency(Math.abs(amount), currency, { decimals: true });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayHeader(timestamp: string): { label: string; key: string } {
  const d = new Date(timestamp);
  const key = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return { label, key };
}

function buildSections(txs: ApiTransaction[]): Section[] {
  const map = new Map<string, Section>();
  for (const tx of txs) {
    const { label, key } = formatDayHeader(tx.timestamp);
    let section = map.get(key);
    if (!section) {
      section = { title: label, dateKey: key, data: [] };
      map.set(key, section);
    }
    section.data.push(tx);
  }
  return Array.from(map.values()).sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey),
  );
}

const TransactionRow = memo(function TransactionRow({
  tx,
}: {
  tx: ApiTransaction;
}) {
  const isIncome = tx.amount > 0;
  const name = tx.merchant_name || tx.description || "Transaction";

  const handlePress = () => {
    router.push({
      pathname: "/transaction-detail",
      params: {
        name,
        amount: Math.abs(tx.amount).toFixed(2),
        category: tx.transaction_category || tx.transaction_type,
        tag: tx.account_name,
        time: formatTime(tx.timestamp),
        isIncome: String(isIncome),
        date: new Date(tx.timestamp).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        currency: tx.currency,
        description: tx.description,
        transactionId: tx.transaction_id,
      },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        className="mx-5 rounded-2xl bg-white"
        style={{ padding: 16, marginBottom: 10 }}
      >
        <View className="flex-row items-start justify-between">
          <TextWrapper
            weight="medium"
            style={{
              fontSize: 17,
              color: "#1A1A1A",
              flex: 1,
              marginRight: 12,
            }}
            numberOfLines={1}
          >
            {name}
          </TextWrapper>
          <TextWrapper
            weight="medium"
            style={{ fontSize: 17, color: "#1A1A1A" }}
          >
            {isIncome ? "+ " : "- "}
            {formatAmount(tx.amount, tx.currency)}
          </TextWrapper>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <TextWrapper
            weight="regular"
            style={{ fontSize: 13, color: "#999" }}
            numberOfLines={1}
          >
            {(tx.transaction_category || tx.transaction_type) +
              "  •  " +
              tx.account_name}
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 13, color: "#999" }}>
            {formatTime(tx.timestamp)}
          </TextWrapper>
        </View>
      </View>
    </Pressable>
  );
});

function SectionHeader({
  section,
}: {
  section: SectionListData<ApiTransaction, Section>;
}) {
  return (
    <View
      className="flex-row items-center justify-between px-6 pt-4 pb-3"
      style={{ backgroundColor: "#F9F9F9" }}
    >
      <TextWrapper weight="medium" style={{ fontSize: 15, color: "#1A1A1A" }}>
        {section.title}
      </TextWrapper>
    </View>
  );
}

const FILTERS = ["All", "Income", "Expenses"] as const;
type Filter = (typeof FILTERS)[number];

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 8,
        backgroundColor: "#F0F0F0",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        height: 42,
      }}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
        <SvgCircle cx={11} cy={11} r={7} stroke="#999" strokeWidth={2} />
        <Path d="M16 16L21 21" stroke="#999" strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search transactions"
        placeholderTextColor="#AAA"
        returnKeyType="search"
        autoCorrect={false}
        style={{
          flex: 1,
          fontSize: 15,
          color: "#1A1A1A",
          fontFamily: "NeueMontreal-Regular",
          paddingVertical: 0,
        }}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange("")} hitSlop={8}>
          <TextWrapper weight="regular" style={{ fontSize: 16, color: "#999" }}>
            ✕
          </TextWrapper>
        </Pressable>
      )}
    </View>
  );
}

function FilterTabs({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <>
      <View className="flex-row px-6 mt-2" style={{ gap: 24 }}>
        {FILTERS.map((tab) => (
          <Pressable key={tab} onPress={() => onChange(tab)}>
            <TextWrapper
              weight={active === tab ? "medium" : "regular"}
              style={{
                fontSize: 15,
                color: active === tab ? "#1A1A1A" : "#999",
                paddingBottom: 10,
              }}
            >
              {tab}
            </TextWrapper>
            {active === tab && (
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
    </>
  );
}

function InsightButtons() {
  return (
    <View
      className="flex-row px-5"
      style={{ gap: 10, paddingTop: 12, paddingBottom: 4 }}
    >
      <Pressable3D
        onPress={() =>
          router.push({ pathname: "/ai-insights", params: { period: "week" } })
        }
        shadowColor="#000"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A1A1A",
          borderRadius: 12,
          paddingVertical: 12,
        }}
      >
        <TextWrapper weight="medium" style={{ fontSize: 13, color: "#FFFFFF" }}>
          Weekly AI insights
        </TextWrapper>
      </Pressable3D>
      <Pressable3D
        onPress={() =>
          router.push({ pathname: "/ai-insights", params: { period: "month" } })
        }
        shadowColor="#000"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A1A1A",
          borderRadius: 12,
          paddingVertical: 12,
        }}
      >
        <TextWrapper weight="medium" style={{ fontSize: 13, color: "#FFFFFF" }}>
          Monthly AI insights
        </TextWrapper>
      </Pressable3D>
    </View>
  );
}

export default function TransactionsScreen() {
  const sheetRef = useRef<ConnectBankSheetRef>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const {
    connected,
    transactions,
    transactionsLoading,
    refreshing,
    error,
    refresh,
    markConnected,
  } = useThomo();

  const filtered = useMemo(() => {
    let result = transactions;

    if (activeFilter === "Income")
      result = result.filter((tx) => tx.amount > 0);
    else if (activeFilter === "Expenses")
      result = result.filter((tx) => tx.amount < 0);

    const q = search.trim().toLowerCase();
    if (q.length > 0) {
      result = result.filter(
        (tx) =>
          tx.merchant_name?.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.account_name.toLowerCase().includes(q) ||
          tx.transaction_category?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [transactions, activeFilter, search]);

  const sections = useMemo(() => buildSections(filtered), [filtered]);

  // Status-level states render without the list at all
  const renderStatusState = () => {
    if (connected === null) {
      return (
        <View style={{ paddingTop: 60, alignItems: "center" }}>
          <ActivityIndicator color="#1A1A1A" />
        </View>
      );
    }

    if (connected === false) {
      return (
        <View className="items-center px-6" style={{ paddingTop: 60 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <TextWrapper weight="regular" style={{ fontSize: 36 }}>
              🏦
            </TextWrapper>
          </View>
          <TextWrapper
            weight="medium"
            style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 8 }}
          >
            Connect your bank
          </TextWrapper>
          <TextWrapper
            weight="regular"
            style={{
              fontSize: 14,
              color: "#888",
              textAlign: "center",
              marginBottom: 28,
              lineHeight: 20,
            }}
          >
            Link your business account to see{"\n"}your real transactions here.
          </TextWrapper>
          <Pressable3D
            shadowColor="#000"
            onPress={() => sheetRef.current?.open()}
            className="rounded-2xl bg-[#1A1A1A]"
            style={{
              paddingHorizontal: 32,
              paddingVertical: 16,
            }}
          >
            <TextWrapper
              weight="medium"
              style={{ fontSize: 15, color: "#fff" }}
            >
              Connect your bank
            </TextWrapper>
          </Pressable3D>
        </View>
      );
    }

    if (transactionsLoading && transactions.length === 0) {
      return (
        <View style={{ paddingTop: 60, alignItems: "center" }}>
          <ActivityIndicator color="#1A1A1A" />
          <TextWrapper
            weight="regular"
            style={{ fontSize: 13, color: "#888", marginTop: 12 }}
          >
            Loading transactions...
          </TextWrapper>
        </View>
      );
    }

    if (error) {
      return (
        <View
          style={{
            paddingTop: 60,
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <TextWrapper
            weight="regular"
            style={{ fontSize: 14, color: "#DC2626", textAlign: "center" }}
          >
            {error}
          </TextWrapper>
        </View>
      );
    }

    if (filtered.length === 0) {
      return (
        <View style={{ paddingTop: 60, alignItems: "center" }}>
          <TextWrapper weight="regular" style={{ fontSize: 14, color: "#888" }}>
            {activeFilter === "All"
              ? "No transactions yet"
              : `No ${activeFilter.toLowerCase()} transactions`}
          </TextWrapper>
        </View>
      );
    }

    return null;
  };

  const statusState = renderStatusState();

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      {statusState ? (
        <View className="flex-1">
          <View className="px-6 pt-20 pb-4">
            <TextWrapper
              weight="medium"
              style={{ fontSize: 24, color: "#1A1A1A" }}
            >
              Transactions
            </TextWrapper>
          </View>
          {connected === true && (
            <>
              <SearchBar value={search} onChange={setSearch} />
              <FilterTabs active={activeFilter} onChange={setActiveFilter} />
              <InsightButtons />
            </>
          )}
          {statusState}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.transaction_id}
          renderItem={({ item }) => <TransactionRow tx={item} />}
          renderSectionHeader={({ section }) => (
            <SectionHeader section={section} />
          )}
          ListHeaderComponent={() => (
            <View>
              <View className="px-6 pt-20 pb-4">
                <TextWrapper
                  weight="medium"
                  style={{ fontSize: 24, color: "#1A1A1A" }}
                >
                  Transactions
                </TextWrapper>
              </View>
              <SearchBar value={search} onChange={setSearch} />
              <FilterTabs active={activeFilter} onChange={setActiveFilter} />
              <InsightButtons />
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          // Virtualization tuning — only render a few screens worth at a time
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      {/* Thomo FAB */}
      <View style={{ position: "absolute", bottom: 16, right: 20 }}>
        <Pressable3D
          shadowColor="#000"
          onPress={() => router.push("/thomo-chat")}
        >
          <ThomoFabIcon size={52} />
        </Pressable3D>
      </View>

      <ConnectBankSheet ref={sheetRef} onConnected={markConnected} />
    </View>
  );
}
