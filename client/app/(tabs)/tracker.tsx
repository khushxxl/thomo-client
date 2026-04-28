import { useMemo } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextWrapper } from "@/components/text-wrapper";
import { SavingsGoalIcon } from "@/components/icons/savings-goal-icon";
import { TaxIcon } from "@/components/icons/tax-icon";
import { Pressable3D } from "@/components/pressable-3d";
import { ThomoFabIcon } from "@/components/icons/thomo-fab-icon";
import { useThomo } from "@/lib/thomo-context";
import {
  annualisedProfit,
  calculateCorporationTax,
  calculateIncomeTax,
  countMissingReceipts,
  getNextVatDeadline,
} from "@/lib/tax";

function formatMoney(amount: number, currency: string = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : "";
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

function formatMoneyDecimal(amount: number, currency: string = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : "";
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function TrackerScreen() {
  const {
    vat,
    transactions,
    balance,
    transactionsLoading,
    refreshing,
    refresh,
  } = useThomo();

  const currency = balance?.currency ?? "GBP";

  // VAT deadline — pure date math, recalc each render is cheap
  const { daysUntil: vatDaysUntil } = getNextVatDeadline();

  // Derive annualised profit + taxes from the 90-day VAT breakdown
  const { annualProfit, corpTax, incomeTax, missingReceipts } = useMemo(() => {
    if (!vat) {
      return {
        annualProfit: 0,
        corpTax: 0,
        incomeTax: 0,
        missingReceipts: 0,
      };
    }
    const annual = annualisedProfit(vat.income, vat.expenses, 90);
    return {
      annualProfit: annual,
      corpTax: calculateCorporationTax(annual),
      incomeTax: calculateIncomeTax(annual),
      missingReceipts: countMissingReceipts(transactions),
    };
  }, [vat, transactions]);

  // Savings goal: recommended monthly set-aside to cover upcoming VAT
  const monthlyVatSetAside = vat ? vat.liability / 3 : 0;

  const hasData = !!vat && transactions.length > 0;
  const showSkeleton = !hasData;

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-20 pb-2">
          <TextWrapper
            weight="medium"
            style={{ fontSize: 24, color: "#1A1A1A" }}
          >
            Tax Tracker
          </TextWrapper>
        </View>

        {/* VAT Liability */}
        <View
          className="items-center"
          style={{ paddingVertical: 24, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <TextWrapper
            weight="medium"
            style={{
              fontSize: 12,
              color: "#888",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            ESTIMATED VAT LIABILITY
          </TextWrapper>

          {transactionsLoading && !hasData ? (
            <View
              style={{ height: 56, justifyContent: "center", marginTop: 8 }}
            >
              <ActivityIndicator color="#1A1A1A" />
            </View>
          ) : (
            <TextWrapper
              weight="medium"
              style={{ fontSize: 42, color: "#1A1A1A", marginTop: 8 }}
            >
              {vat ? formatMoney(vat.liability, currency) : "£—"}
            </TextWrapper>
          )}

          <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#F2A41B",
              }}
            />
            <TextWrapper
              weight="regular"
              style={{ fontSize: 14, color: "#888" }}
            >
              Days until submission:{" "}
            </TextWrapper>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 14, color: "#1A1A1A" }}
            >
              {vatDaysUntil} days
            </TextWrapper>
          </View>
        </View>

        {/* Savings Goal */}
        <View
          className="mx-5 rounded-2xl bg-white"
          style={{ padding: 18, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
            <SavingsGoalIcon size={18} color="#00A281" />
            <TextWrapper
              weight="medium"
              style={{ fontSize: 14, color: "#00A281" }}
            >
              Savings Goal
            </TextWrapper>
          </View>
          <TextWrapper
            weight="medium"
            style={{ fontSize: 18, color: "#1A1A1A", marginBottom: 6 }}
          >
            {vat
              ? `Set aside ${formatMoneyDecimal(monthlyVatSetAside, currency)} per month`
              : "Set aside for VAT"}
          </TextWrapper>
          <TextWrapper
            weight="regular"
            style={{ fontSize: 13, color: "#999", lineHeight: 20 }}
          >
            {vat
              ? `Based on your last 90 days of transactions and standard 20% VAT rate.`
              : "Connect your bank to see personalised targets."}
          </TextWrapper>
        </View>

        {/* Corporation Tax */}
        <View
          className="mx-5 rounded-2xl bg-white"
          style={{ padding: 18, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <TaxIcon size={20} color="#292D32" />
            <View
              className="rounded-lg"
              style={{
                backgroundColor: "rgba(0, 162, 129, 0.08)",
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <TextWrapper
                weight="medium"
                style={{
                  fontSize: 11,
                  color: "#00A281",
                  letterSpacing: 0.5,
                }}
              >
                ANNUALISED
              </TextWrapper>
            </View>
          </View>

          <View className="flex-row items-end justify-between mt-1">
            <View>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 18, color: "#1A1A1A", marginBottom: 4 }}
              >
                Corporation Tax
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999" }}
              >
                Estimated from 90-day trend
              </TextWrapper>
            </View>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 28, color: "#1A1A1A" }}
            >
              {vat ? formatMoney(corpTax, currency) : "—"}
            </TextWrapper>
          </View>

          {/* Profit reference */}
          <TextWrapper
            weight="regular"
            style={{ fontSize: 12, color: "#AAA", marginTop: 10 }}
          >
            Projected annual profit:{" "}
            {vat ? formatMoney(annualProfit, currency) : "—"}
          </TextWrapper>
        </View>

        {/* Income Tax */}
        <View
          className="mx-5 rounded-2xl bg-white"
          style={{ padding: 18, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <TaxIcon size={20} color="#292D32" />
            {missingReceipts > 0 ? (
              <View
                className="rounded-lg"
                style={{
                  backgroundColor: "rgba(240, 46, 36, 0.08)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <TextWrapper
                  weight="medium"
                  style={{
                    fontSize: 11,
                    color: "#F02E24",
                    letterSpacing: 0.5,
                  }}
                >
                  ACTION REQUIRED
                </TextWrapper>
              </View>
            ) : (
              <View
                className="rounded-lg"
                style={{
                  backgroundColor: "rgba(0, 162, 129, 0.08)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <TextWrapper
                  weight="medium"
                  style={{
                    fontSize: 11,
                    color: "#00A281",
                    letterSpacing: 0.5,
                  }}
                >
                  ESTIMATE
                </TextWrapper>
              </View>
            )}
          </View>

          <View className="flex-row items-end justify-between mt-1">
            <View>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 18, color: "#1A1A1A", marginBottom: 4 }}
              >
                Income Tax
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999" }}
              >
                Self-assessment estimate
              </TextWrapper>
            </View>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 28, color: "#1A1A1A" }}
            >
              {vat ? formatMoney(incomeTax, currency) : "—"}
            </TextWrapper>
          </View>

          {missingReceipts > 0 && (
            <View className="flex-row items-center mt-3" style={{ gap: 6 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#F2A41B",
                }}
              />
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#888" }}
              >
                Missing receipts detected ({missingReceipts})
              </TextWrapper>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Thomo FAB */}
      <View style={{ position: "absolute", bottom: 16, right: 20 }}>
        <Pressable3D
          shadowColor="#000"
          onPress={() => router.push("/thomo-chat")}
        >
          <ThomoFabIcon size={52} />
        </Pressable3D>
      </View>
    </View>
  );
}
