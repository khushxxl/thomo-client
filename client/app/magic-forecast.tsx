import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { TextWrapper } from "@/components/text-wrapper";
import { useThomo } from "@/lib/thomo-context";
import {
  calculateMagicForecast,
  type ForecastHorizon,
} from "@/lib/cash-forecast";
import { formatCurrency } from "@/lib/money";

const HORIZONS: ForecastHorizon[] = [30, 60, 90];
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

function MetricCard({
  title,
  value,
  meta,
  metaColor = "#8A8A8A",
}: {
  title: string;
  value: string;
  meta: string;
  metaColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 84,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 15,
        justifyContent: "space-between",
      }}
    >
      <TextWrapper weight="regular" style={{ fontSize: 14, color: "#5F5F5F" }}>
        {title}
      </TextWrapper>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
        <TextWrapper weight="medium" style={{ fontSize: 20, color: "#171717" }}>
          {value}
        </TextWrapper>
        <TextWrapper weight="regular" style={{ fontSize: 12, color: metaColor, marginBottom: 2 }}>
          {meta}
        </TextWrapper>
      </View>
    </View>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d={open ? "M5 11L9 7L13 11" : "M5 7L9 11L13 7"}
        stroke="#B8B8B8"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProjectionChart({
  points,
  horizon,
  width,
}: {
  points: number[];
  horizon: ForecastHorizon;
  width: number;
}) {
  const drawProgress = useSharedValue(0);
  const gridOpacity = useSharedValue(0);
  const chartWidth = Math.max(280, width - 48);
  const chartHeight = 160;
  const innerTop = 24;
  const innerBottom = 118;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const xForIndex = (index: number) => 22 + (index / Math.max(1, points.length - 1)) * (chartWidth - 44);
  const yForValue = (value: number) => innerBottom - ((value - min) / range) * (innerBottom - innerTop);
  const chartPoints = points.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point),
  }));

  const path = chartPoints.reduce((nextPath, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

    const previous = chartPoints[index - 1];
    const controlGap = (point.x - previous.x) * 0.45;
    return `${nextPath} C ${(previous.x + controlGap).toFixed(1)} ${previous.y.toFixed(1)}, ${(point.x - controlGap).toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
  const trendIsNegative = points[points.length - 1] < points[0];
  const markerValue = trendIsNegative ? min : max;
  const markerIndex = Math.max(1, Math.min(points.length - 2, points.indexOf(markerValue)));
  const markerX = xForIndex(markerIndex);
  const markerY = yForValue(points[markerIndex]);
  const totalLength = chartWidth * 2.6;

  useEffect(() => {
    drawProgress.value = 0;
    gridOpacity.value = 0;
    gridOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
    drawProgress.value = withTiming(1, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });
  }, [drawProgress, gridOpacity, horizon, path]);

  const curveProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLength * (1 - drawProgress.value),
    opacity: 0.35 + drawProgress.value * 0.65,
  }));

  const markerProps = useAnimatedProps(() => ({
    opacity: drawProgress.value,
  }));

  const gridProps = useAnimatedProps(() => ({
    opacity: gridOpacity.value,
  }));

  return (
    <View style={{ borderRadius: 16, backgroundColor: "#FFFFFF", paddingTop: 12, overflow: "hidden" }}>
      <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {[0, 1, 2, 3].map((line) => {
          const y = 24 + line * 38;
          return (
            <AnimatedLine
              animatedProps={gridProps}
              key={line}
              x1={22}
              y1={y}
              x2={chartWidth - 22}
              y2={y}
              stroke="#ECECEC"
              strokeWidth={1}
              strokeDasharray="5 5"
            />
          );
        })}
        <AnimatedPath
          animatedProps={curveProps}
          d={path}
          fill="none"
          stroke="#181818"
          strokeWidth={1.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
        />
        <AnimatedLine
          animatedProps={markerProps}
          x1={markerX}
          y1={22}
          x2={markerX}
          y2={128}
          stroke="#FF3328"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <AnimatedCircle animatedProps={markerProps} cx={markerX} cy={markerY} r={3.2} fill="#FF3328" />
        <SvgText
          x={markerX - 34}
          y={markerY + 34}
          fill="#FF3328"
          fontSize={9}
          fontFamily="NeueMontreal-Regular"
        >
          {horizon} Days
        </SvgText>
      </Svg>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 22,
          paddingBottom: 16,
          marginTop: -10,
        }}
      >
        <TextWrapper weight="regular" style={{ fontSize: 13, color: "#A0A0A0" }}>
          Current Month
        </TextWrapper>
        <TextWrapper weight="regular" style={{ fontSize: 13, color: "#A0A0A0" }}>
          Projection Edge
        </TextWrapper>
      </View>
    </View>
  );
}

function WalletIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={6} width={18} height={13} rx={2} stroke="#171717" strokeWidth={1.6} />
      <Path d="M6 10H18" stroke="#171717" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={7.5} cy={15} r={1.1} fill="#171717" />
    </Svg>
  );
}

function WarningIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4L21 20H3L12 4Z" stroke="#FF9F0A" strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M12 9V14" stroke="#FF9F0A" strokeWidth={1.7} strokeLinecap="round" />
      <Circle cx={12} cy={17} r={1} fill="#FF9F0A" />
    </Svg>
  );
}

export default function MagicForecastScreen() {
  const { width } = useWindowDimensions();
  const { balance, transactions, vat } = useThomo();
  const [horizon, setHorizon] = useState<ForecastHorizon>(90);
  const [horizonMenuOpen, setHorizonMenuOpen] = useState(false);
  const currency = balance?.currency ?? "GBP";

  const forecast = useMemo(
    () => calculateMagicForecast({ balance, transactions, vat, horizon }),
    [balance, horizon, transactions, vat],
  );

  const delta = forecast.predictedDeltaPercent;
  const deltaCopy = `${delta >= 0 ? "+" : ""}${delta}%`;

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_right" }} />
      <StatusBar style="dark" />

      <View
        style={{
          paddingTop: 72,
          paddingHorizontal: 24,
          paddingBottom: 28,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={14}
          style={{ position: "absolute", left: 24, bottom: 25 }}
        >
          <ChevronLeftIcon size={24} color="#1A1A1A" strokeWidth={2.2} />
        </Pressable>
        <TextWrapper weight="medium" style={{ fontSize: 18, color: "#202020" }}>
          Magic Forecast
        </TextWrapper>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 46 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, zIndex: 5 }}>
          <TextWrapper weight="medium" style={{ fontSize: 17, color: "#232323" }}>
            Projection Analysis
          </TextWrapper>
          <View style={{ position: "relative" }}>
            <Pressable
              onPress={() => setHorizonMenuOpen((open) => !open)}
              style={{
                minWidth: 128,
                borderRadius: 22,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 18,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <TextWrapper weight="regular" style={{ fontSize: 16, color: "#242424" }}>
                {horizon} Days
              </TextWrapper>
              <ChevronDownIcon open={horizonMenuOpen} />
            </Pressable>

            {horizonMenuOpen ? (
              <View
                style={{
                  position: "absolute",
                  top: 48,
                  right: 0,
                  width: 128,
                  borderRadius: 16,
                  backgroundColor: "#FFFFFF",
                  paddingVertical: 6,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.08,
                  shadowRadius: 18,
                  elevation: 8,
                }}
              >
                {HORIZONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setHorizon(item);
                      setHorizonMenuOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 11,
                      backgroundColor: horizon === item ? "#F8F8F8" : "#FFFFFF",
                    }}
                  >
                    <TextWrapper weight="regular" style={{ fontSize: 12, color: "#242424" }}>
                      {item} Days
                    </TextWrapper>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <ProjectionChart points={forecast.points} horizon={horizon} width={width} />

        <View style={{ flexDirection: "row", gap: 14, marginTop: 22 }}>
          <MetricCard
            title="Predicted Cash"
            value={formatCurrency(forecast.predictedCash, currency)}
            meta={deltaCopy}
            metaColor={delta >= 0 ? "#00A281" : "#F02E24"}
          />
          <MetricCard
            title="Tax Liability"
            value={formatCurrency(forecast.taxLiability, currency)}
            meta={forecast.dueLabel}
            metaColor="#FF9F0A"
          />
        </View>

        <View style={{ flexDirection: "row", gap: 14, marginTop: 14 }}>
          <MetricCard
            title="Monthly Burn"
            value={formatCurrency(forecast.monthlyBurn, currency)}
            meta="Avg"
          />
          <MetricCard
            title="Tax Liability"
            value={formatCurrency(forecast.projectedTaxLiability, currency)}
            meta={forecast.dueLabel}
            metaColor="#FF9F0A"
          />
        </View>

        <View style={{ marginTop: 36 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <WalletIcon />
            <TextWrapper weight="medium" style={{ fontSize: 18, color: "#242424" }}>
              Liquidity Commentary
            </TextWrapper>
          </View>
          <TextWrapper weight="regular" style={{ fontSize: 15, color: "#858585", lineHeight: 22, marginTop: 16 }}>
            {forecast.commentary}
          </TextWrapper>
        </View>

        <View
          style={{
            marginTop: 30,
            borderRadius: 16,
            backgroundColor: "#FFF6E6",
            paddingHorizontal: 20,
            paddingVertical: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <WarningIcon />
            <TextWrapper weight="medium" style={{ fontSize: 17, color: "#171717" }}>
              {forecast.riskTitle}
            </TextWrapper>
          </View>
          <TextWrapper weight="regular" style={{ fontSize: 14, color: "#858585", lineHeight: 21, marginTop: 14 }}>
            {forecast.riskText}
          </TextWrapper>
        </View>
      </ScrollView>
    </View>
  );
}
