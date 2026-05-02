import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  UIManager,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { TextWrapper } from "@/components/text-wrapper";
import { fetchAiInsights, type AiInsights } from "@/lib/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type InsightPeriod = "week" | "month";

function formatMoney(amount: number, withDecimals = false): string {
  return `£${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })}`;
}

function formatDelta(value: number): string {
  const direction = value >= 0 ? "above" : "below";
  return `${Math.abs(Math.round(value))}% ${direction} usual`;
}

function formatAverageDelta(value: number): string {
  const direction = value >= 0 ? "higher" : "lower";
  return `${Math.abs(Math.round(value))}% ${direction}`;
}

function formatPeriodSpend(period: InsightPeriod): string {
  return period === "month" ? "spent this month" : "spent this week";
}

function formatComparison(value: number, comparisonCopy: string): string {
  if (Math.round(value) === 0) return `in line with ${comparisonCopy}`;
  return `${value > 0 ? "+" : "-"}${Math.abs(Math.round(value))}% vs ${comparisonCopy}`;
}

function defaultDateLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function Icon({
  name,
  color = "#555555",
}: {
  name: "receipt" | "chart" | "calendar" | "arrowUp" | "chevronDown";
  color?: string;
}) {
  if (name === "receipt") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Rect x={5} y={3} width={14} height={18} rx={2} stroke={color} strokeWidth={1.8} />
        <Line x1={9} y1={8} x2={15} y2={8} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={9} y1={12} x2={15} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={9} y1={16} x2={13} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "chart") {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M4 19V5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M4 19H20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M7 15L11 11L14 13L19 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "calendar") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={5} width={16} height={15} rx={2} stroke={color} strokeWidth={1.8} />
        <Line x1={8} y1={3.5} x2={8} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={16} y1={3.5} x2={16} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={4} y1={10} x2={20} y2={10} stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }

  if (name === "arrowUp") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M12 19V5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M6 11L12 5L18 11" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9L12 15L18 9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function InsightCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: "receipt" | "chart";
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        minHeight: 86,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name={icon} />
        <TextWrapper weight="regular" style={{ fontSize: 14, color: "#777777" }}>
          {title}
        </TextWrapper>
      </View>
      <TextWrapper weight="medium" style={{ fontSize: 16, color: "#202020" }} numberOfLines={1}>
        {value}
      </TextWrapper>
    </View>
  );
}

function ThomoAdvice({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: "#F8F8F8",
        borderRadius: 16,
        padding: 14,
        flexDirection: "row",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#111111",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TextWrapper weight="bold" style={{ color: "#FFFFFF", fontSize: 12 }}>
          th.
        </TextWrapper>
      </View>
      <View style={{ flex: 1 }}>
        <TextWrapper weight="medium" style={{ fontSize: 15, color: "#333333", marginBottom: 4 }}>
          Thomo Advice
        </TextWrapper>
        <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777", lineHeight: 17 }}>
          {`"${text}"`}
        </TextWrapper>
      </View>
    </View>
  );
}

function DailyItem({
  day,
  defaultExpanded = false,
}: {
  day: AiInsights["daily_intelligence"][number];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isHigh = day.percentage_vs_usual >= 0;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 16 }}>
      <Pressable onPress={toggle} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <TextWrapper weight="medium" style={{ fontSize: 16, color: "#111111" }}>
            {day.date}
          </TextWrapper>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 6, gap: 6 }}>
            <TextWrapper weight="regular" style={{ fontSize: 12, color: "#777777" }}>
              {formatMoney(day.spent)} spent
            </TextWrapper>
            <TextWrapper weight="regular" style={{ fontSize: 12, color: isHigh ? "#FF2D1F" : "#00A281" }}>
              {formatDelta(day.percentage_vs_usual)}
            </TextWrapper>
          </View>
        </View>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <Icon name="chevronDown" color="#777777" />
        </View>
      </Pressable>

      {expanded ? (
        <View style={{ marginTop: 24 }}>
          {day.breakdown.map((item) => (
            <View key={item.category} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#555555" }}>
                {item.category}
              </TextWrapper>
              <TextWrapper weight="regular" style={{ fontSize: 14, color: "#555555" }}>
                {formatMoney(item.amount, true)}
              </TextWrapper>
            </View>
          ))}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2, marginBottom: 18 }}>
            <Icon name="arrowUp" color={isHigh ? "#FF9F1C" : "#00A281"} />
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
              {formatAverageDelta(day.percentage_vs_usual)} than your average {day.date.split(",")[0]}
            </TextWrapper>
          </View>
          <ThomoAdvice text={day.thomo_advice} />
        </View>
      ) : (
        <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#EFEFEF" }}>
          <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777" }}>
            Biggest Spend: {day.breakdown[0]?.category || "Uncategorised"}
          </TextWrapper>
        </View>
      )}
    </View>
  );
}

export default function AiInsightsScreen() {
  const params = useLocalSearchParams<{ period?: string }>();
  const period: InsightPeriod = params.period === "month" ? "month" : "week";
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchAiInsights(period);
        setInsights(data);
      } catch (err) {
        setError("Could not generate insights. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period],
  );

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const dateLabel = insights?.date_label || insights?.daily_intelligence[0]?.date || defaultDateLabel();
    const percentage = insights?.spent_today.percentage_vs_average ?? 0;
    const comparisonCopy = period === "month" ? "last month" : "last week";

    return {
      dateLabel,
      rangeLabel: insights?.range_label,
      comparisonCopy,
      percentage,
      isHigh: percentage > 0,
      isLow: percentage < 0,
    };
  }, [insights, period]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_right" }} />
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: 72,
          paddingHorizontal: 26,
          paddingBottom: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={14}>
          <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.2} />
        </Pressable>
        <TextWrapper weight="medium" style={{ fontSize: 18, color: "#1A1A1A" }}>
          AI Summary
        </TextWrapper>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
          <ActivityIndicator color="#1A1A1A" />
          <TextWrapper weight="medium" style={{ fontSize: 15, color: "#777777", marginTop: 20, textAlign: "center", lineHeight: 22 }}>
            Thomo is analyzing your transactions to build your summary...
          </TextWrapper>
        </View>
      ) : error || !insights ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFF0EE", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <TextWrapper weight="bold" style={{ fontSize: 28, color: "#FF2D1F" }}>
              !
            </TextWrapper>
          </View>
          <TextWrapper weight="medium" style={{ fontSize: 17, color: "#1A1A1A", textAlign: "center", marginBottom: 8 }}>
            Analysis Failed
          </TextWrapper>
          <TextWrapper weight="regular" style={{ fontSize: 14, color: "#666666", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
            {error || "Something went wrong while connecting to your bank data."}
          </TextWrapper>
          <Pressable onPress={() => load()} style={{ backgroundColor: "#1A1A1A", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}>
            <TextWrapper weight="medium" style={{ fontSize: 15, color: "#FFFFFF" }}>
              Try Again
            </TextWrapper>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 56 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        >
          <Animated.View entering={FadeInDown.duration(350)}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <TextWrapper weight="regular" style={{ fontSize: 15, color: "#444444" }}>
                  {summary.dateLabel}
                </TextWrapper>
                <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777", marginTop: 4 }}>
                  {formatMoney(insights.spent_today.amount)} {formatPeriodSpend(period)}
                </TextWrapper>
              </View>
              {summary.rangeLabel ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Icon name="calendar" color="#333333" />
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
                    {summary.rangeLabel}
                  </TextWrapper>
                </View>
              ) : null}
            </View>

            <TextWrapper weight="medium" style={{ fontSize: 40, color: "#252525", marginTop: 24 }}>
              {formatMoney(insights.spent_today.amount)}
            </TextWrapper>
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: summary.isHigh ? "#FFE7E5" : summary.isLow ? "#E3F7F1" : "#EFEFEF",
                borderRadius: 10,
                paddingHorizontal: 9,
                paddingVertical: 5,
                marginTop: 8,
              }}
            >
              <TextWrapper
                weight="regular"
                style={{
                  fontSize: 12,
                  color: summary.isHigh ? "#FF2D1F" : summary.isLow ? "#00A281" : "#666666",
                }}
              >
                {formatComparison(summary.percentage, summary.comparisonCopy)}
              </TextWrapper>
            </View>
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777", marginTop: 18, lineHeight: 18 }}>
              Total Aggregate Spending{"\n"}Across All Accounts
            </TextWrapper>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(90).duration(350)} style={{ flexDirection: "row", gap: 12, marginTop: 22 }}>
            <InsightCard
              title="Top Category"
              value={`${insights.top_category.name} (${formatMoney(insights.top_category.amount)})`}
              icon="receipt"
            />
            <InsightCard
              title="Potential Savings"
              value={`${formatMoney(insights.potential_savings.amount)} vs usual`}
              icon="chart"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(160).duration(350)} style={{ backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 20, paddingVertical: 16, marginTop: 12 }}>
            <TextWrapper weight="regular" style={{ fontSize: 16, color: "#4A4A4A", textAlign: "center", lineHeight: 24, fontStyle: "italic" }}>
              {`"${insights.thomo_quote}"`}
            </TextWrapper>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(230).duration(350)} style={{ marginTop: 28 }}>
            <TextWrapper weight="regular" style={{ fontSize: 16, color: "#777777", marginBottom: 12 }}>
              {period === "week" ? "Daily Intelligence" : "Breakdown"}
            </TextWrapper>
            {period === "week" && insights.daily_intelligence.length > 0 ? (
              insights.daily_intelligence.map((day, index) => (
                <DailyItem key={`${day.date}-${index}`} day={day} defaultExpanded={index === 0} />
              ))
            ) : (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14 }}>
                {insights.breakdown.map((item) => (
                  <View key={item.category} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
                    <TextWrapper weight="regular" style={{ fontSize: 14, color: "#333333" }}>
                      {item.category}
                    </TextWrapper>
                    <TextWrapper weight="regular" style={{ fontSize: 14, color: "#555555" }}>
                      {formatMoney(item.amount, true)}
                    </TextWrapper>
                  </View>
                ))}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <Icon name="arrowUp" color={summary.isHigh ? "#FF9F1C" : "#00A281"} />
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
                    {formatAverageDelta(summary.percentage)} than your usual month
                  </TextWrapper>
                </View>
                <ThomoAdvice text={insights.thomo_advice} />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}
