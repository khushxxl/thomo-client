import { View, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { formatCurrency } from "@/lib/money";
import * as Haptics from "expo-haptics";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <View
        className="flex-row items-center justify-between"
        style={{ paddingVertical: 14 }}
      >
        <TextWrapper
          weight="regular"
          style={{ fontSize: 15, color: "#999" }}
        >
          {label}
        </TextWrapper>
        <TextWrapper
          weight="medium"
          style={{ fontSize: 15, color: "#1A1A1A" }}
        >
          {value}
        </TextWrapper>
      </View>
      <View style={{ height: 1, backgroundColor: "#EFEFEF" }} />
    </>
  );
}

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams<{
    name: string;
    amount: string;
    category: string;
    tag: string;
    time: string;
    isIncome: string;
    date: string;
    currency: string;
    description: string;
    transactionId: string;
  }>();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const isIncome = params.isIncome === "true";
  const amount = parseFloat(params.amount || "0");
  const currency = (params.currency || "GBP").toUpperCase();
  const formattedAmount = `${isIncome ? "+" : "-"}${formatCurrency(amount, currency, { decimals: true })}`;

  const txType = isIncome ? "credit" : "debit";
  const category = params.category || "Uncategorised";
  const accountName = params.tag || "Account";
  const merchantName = params.name || "Transaction";
  const description = params.description || merchantName;
  const time = params.time || "";
  const date = params.date || "";
  const transactionId = params.transactionId || "";

  const badgeColor = isIncome ? "#00A281" : "#F2A41B";
  const badgeBg = isIncome
    ? "rgba(0, 162, 129, 0.1)"
    : "rgba(242, 164, 27, 0.1)";

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: 70,
            paddingBottom: 16,
            paddingHorizontal: 20,
          }}
        >
          <View
            className="flex-row items-center justify-center"
            style={{ position: "relative" }}
          >
            <Pressable
              onPress={handleBack}
              hitSlop={12}
              style={{ position: "absolute", left: 0 }}
            >
              <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.5} />
            </Pressable>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 17, color: "#1A1A1A" }}
            >
              {merchantName}
            </TextWrapper>
          </View>
        </View>

        {/* Account badge */}
        <View className="items-center mt-4">
          <View
            style={{
              backgroundColor: badgeBg,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <TextWrapper
              weight="medium"
              style={{ fontSize: 13, color: badgeColor }}
            >
              {accountName}
            </TextWrapper>
          </View>
        </View>

        {/* Amount */}
        <View className="items-center mt-6">
          <TextWrapper
            weight="medium"
            style={{ fontSize: 46, color: "#1A1A1A" }}
          >
            {formattedAmount}
          </TextWrapper>
          <TextWrapper
            weight="regular"
            style={{ fontSize: 14, color: "#999", marginTop: 6 }}
          >
            {txType}
          </TextWrapper>
        </View>

        {/* Details */}
        <View className="mx-5 mt-10" style={{ paddingHorizontal: 4 }}>
          {merchantName !== description && (
            <DetailRow label="Description" value={description} />
          )}
          <DetailRow label="Merchant" value={merchantName} />
          <DetailRow label="Category" value={category} />
          <DetailRow label="Account" value={accountName} />
          <DetailRow label="Type" value={txType} />
          {date !== "" && <DetailRow label="Date" value={date} />}
          {time !== "" && <DetailRow label="Time" value={time} />}
          <DetailRow
            label="Amount"
            value={formatCurrency(amount, currency, { decimals: true })}
          />
          <DetailRow label="Currency" value={currency} />
          {transactionId !== "" && (
            <DetailRow
              label="Transaction ID"
              value={
                transactionId.length > 12
                  ? `${transactionId.slice(0, 8)}**${transactionId.slice(-3)}`
                  : transactionId
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
