import { type AiInsights } from "@/lib/api";

export type InsightPeriod = "week" | "month";

export function formatMoney(amount: number, withDecimals = false): string {
  return `£${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })}`;
}

export function formatDelta(value: number): string {
  const direction = value >= 0 ? "above" : "below";
  return `${Math.abs(Math.round(value))}% ${direction} usual`;
}

export function formatAverageDelta(value: number): string {
  const direction = value >= 0 ? "higher" : "lower";
  return `${Math.abs(Math.round(value))}% ${direction}`;
}

export function formatPeriodSpend(period: InsightPeriod): string {
  return period === "month" ? "spent this month" : "spent this week";
}

export function formatComparison(value: number, comparisonCopy: string): string {
  if (Math.round(value) === 0) return `in line with ${comparisonCopy}`;
  const direction = value > 0 ? "higher" : "lower";
  return `${Math.abs(Math.round(value))}% ${direction} than ${comparisonCopy}`;
}

export function defaultDateLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
