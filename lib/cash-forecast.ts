import type { ApiBalance, ApiTransaction } from "@/lib/api";
import type { VatBreakdown } from "@/lib/vat";
import { getNextVatDeadline } from "@/lib/tax";

export type ForecastHorizon = 30 | 60 | 90;

export type MagicForecast = {
  predictedCash: number;
  predictedDeltaPercent: number;
  taxLiability: number;
  monthlyBurn: number;
  projectedTaxLiability: number;
  dueLabel: string;
  peakDay: number;
  lowestDay: number;
  commentary: string;
  riskTitle: string;
  riskText: string;
  points: number[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function transactionAmount(tx: ApiTransaction): number {
  return Number(tx.amount) || 0;
}

function roundMoney(value: number): number {
  return Math.max(0, Math.round(value));
}

function recentTransactions(transactions: ApiTransaction[], days = 90): ApiTransaction[] {
  if (transactions.length === 0) return [];

  const latestTimestamp = transactions.reduce((latest, tx) => {
    const timestamp = new Date(tx.timestamp).getTime();
    return Number.isFinite(timestamp) ? Math.max(latest, timestamp) : latest;
  }, 0);
  const anchor = latestTimestamp || Date.now();
  const cutoff = anchor - days * DAY_MS;

  return transactions.filter((tx) => {
    const timestamp = new Date(tx.timestamp).getTime();
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });
}

function buildProjectionPoints(
  currentCash: number,
  dailyNet: number,
  dailyVolatility: number,
  horizon: ForecastHorizon,
  dailyPattern: number[],
): number[] {
  const sampleCount = 13;
  const patternAverage = dailyPattern.length
    ? dailyPattern.reduce((sum, value) => sum + value, 0) / dailyPattern.length
    : dailyNet;

  return Array.from({ length: sampleCount }, (_, index) => {
    const progress = index / (sampleCount - 1);
    const day = horizon * progress;
    const patternValue = dailyPattern.length
      ? dailyPattern[index % dailyPattern.length] - patternAverage
      : Math.sin(progress * Math.PI * 3 - Math.PI / 5) * dailyVolatility;
    const horizonWave =
      horizon === 30
        ? Math.sin(progress * Math.PI * 1.4)
        : horizon === 60
          ? Math.sin(progress * Math.PI * 2.25 - 0.45)
          : Math.sin(progress * Math.PI * 3.4 - 0.65);
    const volatilityWeight = Math.sin(progress * Math.PI);
    return currentCash + dailyNet * day + patternValue * volatilityWeight * 2.1 + horizonWave * dailyVolatility * volatilityWeight;
  });
}

function activeWindowDays(transactions: ApiTransaction[]): number {
  if (transactions.length < 2) return 30;
  const times = transactions
    .map((tx) => new Date(tx.timestamp).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (times.length < 2) return 30;
  return Math.max(1, Math.min(90, Math.ceil((times[times.length - 1] - times[0]) / DAY_MS) + 1));
}

export function calculateMagicForecast({
  balance,
  transactions,
  vat,
  horizon,
}: {
  balance: ApiBalance | null;
  transactions: ApiTransaction[];
  vat: VatBreakdown | null;
  horizon: ForecastHorizon;
}): MagicForecast {
  const currentCash = balance?.total_available ?? 0;
  const currencyTransactions = recentTransactions(transactions, horizon);
  const windowDays = activeWindowDays(currencyTransactions);

  let income = 0;
  let outflow = 0;
  const dailyTotals = new Map<string, number>();

  for (const tx of currencyTransactions) {
    const amount = transactionAmount(tx);
    if (amount > 0) income += amount;
    if (amount < 0) outflow += Math.abs(amount);

    const key = new Date(tx.timestamp).toISOString().slice(0, 10);
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + amount);
  }

  const dailyIncome = income / windowDays;
  const dailyOutflow = outflow / windowDays;
  const dailyNet = dailyIncome - dailyOutflow;
  const monthlyBurn = dailyOutflow * 30;
  const predictedCash = currentCash + dailyNet * horizon;
  const predictedDeltaPercent =
    currentCash > 0 ? Math.round(((predictedCash - currentCash) / currentCash) * 100) : 0;

  const dailyValues = Array.from(dailyTotals.values());
  const dailyAverage = dailyValues.length
    ? dailyValues.reduce((sum, value) => sum + value, 0) / dailyValues.length
    : dailyNet;
  const variance = dailyValues.length
    ? dailyValues.reduce((sum, value) => sum + Math.pow(value - dailyAverage, 2), 0) / dailyValues.length
    : 0;
  const dailyVolatility = Math.sqrt(variance) * (horizon === 30 ? 0.55 : horizon === 60 ? 0.85 : 1.18);
  const points = buildProjectionPoints(
    currentCash,
    dailyNet,
    dailyVolatility,
    horizon,
    dailyValues,
  );
  const maxPoint = Math.max(...points);
  const minPoint = Math.min(...points);
  const pointEdge = Math.max(1, points.length - 1);
  const peakDay = Math.max(1, Math.round((points.indexOf(maxPoint) / pointEdge) * horizon));
  const lowestDay = Math.max(1, Math.round((points.indexOf(minPoint) / pointEdge) * horizon));

  const taxLiability = vat?.liability ?? 0;
  const projectedTaxLiability = taxLiability + Math.max(0, dailyIncome - dailyOutflow) * horizon * (1 / 6);
  const { daysUntil } = getNextVatDeadline();
  const dueLabel = daysUntil <= 92 ? "Due Q4" : `${daysUntil} days`;

  const runwayDays =
    dailyOutflow > dailyIncome && currentCash > 0
      ? Math.max(1, Math.floor(currentCash / Math.max(1, dailyOutflow - dailyIncome)))
      : horizon;

  const commentary =
    currencyTransactions.length === 0
      ? "Connect more bank activity to unlock a sharper forecast. Thomo will use your balance, income velocity, and operating spend."
      : `Based on your current transaction velocity, your cash position is projected to ${dailyNet >= 0 ? "strengthen" : "tighten"} over the next ${horizon} days. The curve peaks around day ${peakDay}, with the lowest projected point around day ${lowestDay}.`;

  const riskTitle = dailyNet < 0 ? "Cash Runway Risk" : "Invoice Delay Risk";
  const riskText =
    dailyNet < 0
      ? `At the current burn rate, available cash could tighten in roughly ${runwayDays} days unless income improves or expenses slow.`
      : "Cash flow remains sensitive to late receivables. Review overdue invoices before the projection edge to protect liquidity.";

  return {
    predictedCash: roundMoney(predictedCash),
    predictedDeltaPercent,
    taxLiability: roundMoney(taxLiability),
    monthlyBurn: roundMoney(monthlyBurn),
    projectedTaxLiability: roundMoney(projectedTaxLiability),
    dueLabel,
    peakDay,
    lowestDay,
    commentary,
    riskTitle,
    riskText,
    points,
  };
}
