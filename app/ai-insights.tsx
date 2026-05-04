import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  UIManager,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { TextWrapper } from "@/components/text-wrapper";
import { fetchAiInsights, type AiInsights } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { readPersistentCache, writePersistentCache } from "@/lib/persistent-cache";

// Refactored Components & Helpers
import { InsightCard } from "@/components/ai-insights/insight-card";
import { ThomoAdvice } from "@/components/ai-insights/thomo-advice";
import { DailyItem } from "@/components/ai-insights/daily-item";
import { Icon } from "@/components/ai-insights/shared";
import {
  formatMoney,
  formatPeriodSpend,
  formatComparison,
  defaultDateLabel,
  type InsightPeriod,
} from "@/components/ai-insights/helpers";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const insightsCache: Record<string, AiInsights> = {};
const INSIGHTS_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

function insightCacheKey(userId: string | null, period: InsightPeriod): string {
  return `thomo:ai-insights:${userId ?? "guest"}:${period}:v1`;
}

export default function AiInsightsScreen() {
  const params = useLocalSearchParams<{ period?: string }>();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const period: InsightPeriod = params.period === "month" ? "month" : "week";
  const memoryCacheKey = `${userId ?? "guest"}:${period}`;
  const [insights, setInsights] = useState<AiInsights | null>(insightsCache[memoryCacheKey] || null);
  const [loading, setLoading] = useState(!insightsCache[memoryCacheKey]);
  const [hydrated, setHydrated] = useState(Boolean(insightsCache[memoryCacheKey]));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setHydrated(Boolean(insightsCache[memoryCacheKey]));
    setInsights(insightsCache[memoryCacheKey] || null);
    setLoading(!insightsCache[memoryCacheKey]);
    setError(null);

    readPersistentCache<AiInsights>(
      insightCacheKey(userId, period),
      INSIGHTS_CACHE_TTL_MS,
    ).then((cached) => {
      if (!mounted || !cached) return;
      insightsCache[memoryCacheKey] = cached;
      setInsights(cached);
      setLoading(false);
      setHydrated(true);
    });

    return () => {
      mounted = false;
    };
  }, [memoryCacheKey, period, userId]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh && insightsCache[memoryCacheKey]) {
        setInsights(insightsCache[memoryCacheKey]);
        setLoading(false);
        return;
      }

      if (!isRefresh) {
        const cached = await readPersistentCache<AiInsights>(
          insightCacheKey(userId, period),
          INSIGHTS_CACHE_TTL_MS,
        );
        if (cached) {
          insightsCache[memoryCacheKey] = cached;
          setInsights(cached);
          setLoading(false);
          setHydrated(true);
          return;
        }
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchAiInsights(period, isRefresh);
        insightsCache[memoryCacheKey] = data;
        setInsights(data);
        setHydrated(true);
        await writePersistentCache(insightCacheKey(userId, period), data);
      } catch (err) {
        setError("Could not generate insights. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [memoryCacheKey, period, userId],
  );

  useEffect(() => {
    if (!hydrated && insightsCache[memoryCacheKey]) return;
    load();
  }, [hydrated, load, memoryCacheKey]);

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
    <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
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
                <TextWrapper weight="regular" style={{ fontSize: 14, color: "#39393C" }}>
                  {summary.dateLabel}
                </TextWrapper>
                <TextWrapper weight="regular" style={{ fontSize: 13, color: "#777777", marginTop: 4 }}>
                  {formatMoney(insights.spent_today.amount)} {formatPeriodSpend(period)}, {formatComparison(summary.percentage, summary.comparisonCopy).toLowerCase()}
                </TextWrapper>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
              <TextWrapper weight="medium" style={{ fontSize: 40, color: "#171717" }}>
                {formatMoney(insights.spent_today.amount)}
              </TextWrapper>
              {summary.rangeLabel ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Icon name="calendar" color="#333333" />
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
                    {summary.rangeLabel}
                  </TextWrapper>
                </View>
              ) : null}
            </View>

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
            <TextWrapper weight="regular" style={{ fontSize: 13, color: "#515151", opacity: 0.8, marginTop: 18, lineHeight: 18 }}>
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

          <Animated.View entering={FadeInDown.delay(160).duration(350)} style={{ backgroundColor: "#FFFFFF", borderRadius: 18, paddingHorizontal: 24, paddingVertical: 18, marginTop: 12 }}>
            <TextWrapper weight="regular" italic style={{ fontSize: 15, color: "#1F1F1F", opacity: 0.8, textAlign: "center", lineHeight: 21 }}>
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
                  <Icon name="arrowUp" color={summary.isHigh ? "#F2A41B" : "#00A281"} />
                  <TextWrapper weight="regular" style={{ fontSize: 13, color: "#333333" }}>
                    <TextWrapper weight="regular" style={{ color: summary.isHigh ? "#F2A41B" : "#00A281" }}>
                      {Math.abs(Math.round(summary.percentage))}%
                    </TextWrapper>{" "}
                    {summary.isHigh ? "higher" : "lower"} than your usual month
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
