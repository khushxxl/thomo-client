import { useEffect, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TextWrapper } from "@/components/text-wrapper";
import { BellIcon } from "@/components/icons/bell-icon";
import { AlertIcon } from "@/components/icons/alert-icon";
import { ThomoFabIcon } from "@/components/icons/thomo-fab-icon";
import { Pressable3D } from "@/components/pressable-3d";
import {
  ConnectBankSheet,
  type ConnectBankSheetRef,
} from "@/components/connect-bank-sheet";
import { useThomo } from "@/lib/thomo-context";
import { useAuth } from "@/lib/auth-context";
import { calculateMagicForecast } from "@/lib/cash-forecast";
import Svg, { Circle, Line, Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

function formatBalance(amount: number, currency: string): string {
  const c = currency.toUpperCase();
  const symbol = c === "GBP" ? "£" : c === "USD" ? "$" : c === "EUR" ? "€" : "";
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function MiniForecastChart({ points, width }: { points: number[]; width: number }) {
  const drawProgress = useSharedValue(0);
  const chartWidth = Math.max(260, width);
  const chartHeight = 160;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const xForIndex = (index: number) => 10 + (index / Math.max(1, points.length - 1)) * (chartWidth - 20);
  const yForValue = (value: number) => 132 - ((value - min) / range) * 104;
  const mappedPoints = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point),
  }));
  const path = mappedPoints.reduce((nextPath, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    const previous = mappedPoints[index - 1];
    const controlGap = (point.x - previous.x) * 0.42;
    return `${nextPath} C ${(previous.x + controlGap).toFixed(1)} ${previous.y.toFixed(1)}, ${(point.x - controlGap).toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
  const trendIsNegative = points[points.length - 1] < points[0];
  const markerValue = trendIsNegative ? min : max;
  const markerIndex = Math.max(1, Math.min(points.length - 2, points.indexOf(markerValue)));
  const marker = mappedPoints[markerIndex];
  const totalLength = chartWidth * 2.4;

  useEffect(() => {
    drawProgress.value = 0;
    drawProgress.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [drawProgress, path]);

  const curveProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLength * (1 - drawProgress.value),
  }));
  const markerProps = useAnimatedProps(() => ({
    opacity: drawProgress.value,
  }));

  return (
    <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
      {[0, 1, 2].map((line) => {
        const y = 36 + line * 42;
        return (
          <Line
            key={line}
            x1={10}
            y1={y}
            x2={chartWidth - 10}
            y2={y}
            stroke="#E6E6E6"
            strokeWidth={1}
            strokeDasharray="5 5"
          />
        );
      })}
      <AnimatedPath
        animatedProps={curveProps}
        d={path}
        fill="none"
        stroke="#171717"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
      />
      <AnimatedLine animatedProps={markerProps} x1={marker.x} y1={24} x2={marker.x} y2={134} stroke="#FF3328" strokeWidth={1} strokeDasharray="4 4" />
      <AnimatedCircle animatedProps={markerProps} cx={marker.x} cy={marker.y} r={3.4} fill="#FF3328" />
    </Svg>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const {
    connected,
    balance,
    vat,
    transactions,
    balanceLoading,
    refreshing,
    refresh,
    markConnected,
  } = useThomo();

  const avatarUrl =
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  const sheetRef = useRef<ConnectBankSheetRef>(null);

  // Auto-open the connect sheet whenever the user is unconnected.
  useEffect(() => {
    if (connected === false) {
      const timer = setTimeout(() => sheetRef.current?.open(), 250);
      return () => clearTimeout(timer);
    }
    if (connected === true) {
      sheetRef.current?.close();
    }
  }, [connected]);

  const hasBalance = !!balance;
  const showSkeleton = connected !== true;
  const currency = balance?.currency ?? "GBP";
  const dashboardForecast = useMemo(
    () => calculateMagicForecast({ balance, transactions, vat, horizon: 90 }),
    [balance, transactions, vat],
  );

  return (
    <View className="flex-1 bg-[#F9F9F9]">
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, gap: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-20 pb-6">
          <TextWrapper
            weight="medium"
            style={{ fontSize: 20, color: "#1A1A1A" }}
          >
            Thomo AI
          </TextWrapper>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#E5E5E5",
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 40, height: 40 }}
                contentFit="cover"
              />
            ) : (
              <TextWrapper
                weight="medium"
                style={{ fontSize: 16, color: "#666" }}
              >
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </TextWrapper>
            )}
          </View>
        </View>

        {/* Balance */}
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
            TOTAL LIQUID BALANCE
          </TextWrapper>

          {balanceLoading && !balance ? (
            <View
              style={{ height: 56, justifyContent: "center", marginTop: 8 }}
            >
              <ActivityIndicator color="#1A1A1A" />
            </View>
          ) : hasBalance ? (
            <TextWrapper
              weight="medium"
              style={{ fontSize: 42, color: "#1A1A1A", marginTop: 8 }}
            >
              {formatBalance(balance.total_available, balance.currency)}
            </TextWrapper>
          ) : (
            <TextWrapper
              weight="medium"
              style={{ fontSize: 42, color: "#1A1A1A", marginTop: 8 }}
            >
              £—
            </TextWrapper>
          )}

          <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 13, color: "#888" }}
            >
              {hasBalance
                ? `Across ${balance.accounts.length} ${balance.accounts.length === 1 ? "account" : "accounts"}`
                : "No accounts connected"}
            </TextWrapper>
          </View>
        </View>

        {/* Alert Cards */}
        <View
          className="flex-row px-5"
          style={{ gap: 10, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-1 rounded-2xl bg-white" style={{ padding: 16 }}>
            <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
              <BellIcon size={18} color="#F02E24" />
              <TextWrapper
                weight="medium"
                style={{ fontSize: 13, color: "#999" }}
              >
                VAT Liability
              </TextWrapper>
            </View>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 17, color: "#1A1A1A", marginBottom: 4 }}
            >
              {vat ? formatBalance(vat.liability, currency) : "—"}
            </TextWrapper>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 13, color: "#999" }}
            >
              {vat ? "Last 90 days estimate" : "Awaiting data"}
            </TextWrapper>
          </View>

          <View className="flex-1 rounded-2xl bg-white" style={{ padding: 16 }}>
            <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
              <AlertIcon size={18} color="#F2A41B" />
              <TextWrapper
                weight="medium"
                style={{ fontSize: 13, color: "#999" }}
              >
                Receivables
              </TextWrapper>
            </View>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 17, color: "#1A1A1A", marginBottom: 4 }}
            >
              —
            </TextWrapper>
            <TextWrapper
              weight="regular"
              style={{ fontSize: 13, color: "#999" }}
            >
              Awaiting data
            </TextWrapper>
          </View>
        </View>

        {/* Intelligence Card */}
        <View
          className="mx-5 mt-3 rounded-2xl bg-white"
          style={{ padding: 18, opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
            <TextWrapper
              weight="medium"
              style={{ fontSize: 13, color: "#999" }}
            >
              Intelligence
            </TextWrapper>
          </View>

          <View className="flex-row items-center justify-between">
            <View style={{ flex: 1 }}>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 4 }}
              >
                {showSkeleton ? "—" : "Projected cashflow"}
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 13, color: "#999" }}
              >
                {showSkeleton
                  ? "Awaiting data"
                  : "Healthy surplus expected for Q3"}
              </TextWrapper>
            </View>
            <Pressable
              onPress={() => router.push("/magic-forecast")}
              className="rounded-xl bg-[#1A1A1A]"
              style={{ paddingHorizontal: 16, paddingVertical: 10 }}
            >
              <TextWrapper
                weight="medium"
                style={{ fontSize: 13, color: "#fff" }}
              >
                View More
              </TextWrapper>
            </Pressable>
          </View>
        </View>

        {/* Cash Prediction */}
        <View
          className="px-5 mt-6"
          style={{ opacity: showSkeleton ? 0.35 : 1 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <TextWrapper
              weight="medium"
              style={{ fontSize: 20, color: "#1A1A1A" }}
            >
              Cash Prediction
            </TextWrapper>
            <Pressable className="flex-row items-center" style={{ gap: 4 }}>
              <TextWrapper
                weight="medium"
                style={{ fontSize: 13, color: "#888" }}
              >
                Next Week
              </TextWrapper>
              <TextWrapper
                weight="regular"
                style={{ fontSize: 12, color: "#888" }}
              >
                ▾
              </TextWrapper>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/magic-forecast")}
            className="rounded-2xl bg-white"
            style={{ padding: 16 }}
          >
            <MiniForecastChart points={dashboardForecast.points} width={SCREEN_WIDTH - 72} />

            <View
              className="flex-row justify-between mt-3"
              style={{ paddingHorizontal: 4 }}
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <TextWrapper
                  key={day}
                  weight="regular"
                  style={{ fontSize: 11, color: "#999" }}
                >
                  {day}
                </TextWrapper>
              ))}
            </View>
          </Pressable>
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

      {/* Non-dismissible bank connect sheet — only dismissible once bank is connected */}
      <ConnectBankSheet
        ref={sheetRef}
        onConnected={markConnected}
        dismissible={false}
      />
    </View>
  );
}
