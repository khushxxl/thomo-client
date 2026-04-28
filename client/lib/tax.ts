import type { ApiTransaction } from "@/lib/api";

/* ------------------------------ VAT deadline ------------------------------ */

export function getNextVatDeadline(now: Date = new Date()): {
  deadline: Date;
  daysUntil: number;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const quarterEndMonths = [2, 5, 8, 11];
  const currentQuarterEndMonth = quarterEndMonths.find((m) => m >= month);

  let quarterEnd: Date;
  if (currentQuarterEndMonth === undefined) {
    quarterEnd = new Date(Date.UTC(year + 1, 2, 31));
  } else {
    quarterEnd = new Date(Date.UTC(year, currentQuarterEndMonth + 1, 0));
  }

  let deadline = new Date(quarterEnd);
  deadline.setUTCMonth(deadline.getUTCMonth() + 1);
  deadline.setUTCDate(deadline.getUTCDate() + 7);

  if (deadline.getTime() < now.getTime()) {
    const nextEndMonth =
      quarterEndMonths[(quarterEndMonths.indexOf(currentQuarterEndMonth!) + 1) % 4];
    const nextEndYear = nextEndMonth < month ? year + 1 : year;
    const nextQuarterEnd = new Date(Date.UTC(nextEndYear, nextEndMonth + 1, 0));
    deadline = new Date(nextQuarterEnd);
    deadline.setUTCMonth(deadline.getUTCMonth() + 1);
    deadline.setUTCDate(deadline.getUTCDate() + 7);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.max(
    0,
    Math.ceil((deadline.getTime() - now.getTime()) / msPerDay),
  );

  return { deadline, daysUntil };
}

/* --------------------------- Corporation Tax ----------------------------- */

const SMALL_PROFITS_THRESHOLD = 50_000;
const MAIN_RATE_THRESHOLD = 250_000;
const SMALL_PROFITS_RATE = 0.19;
const MAIN_RATE = 0.25;

export function calculateCorporationTax(annualProfit: number): number {
  if (annualProfit <= 0) return 0;
  if (annualProfit <= SMALL_PROFITS_THRESHOLD) {
    return annualProfit * SMALL_PROFITS_RATE;
  }
  if (annualProfit >= MAIN_RATE_THRESHOLD) {
    return annualProfit * MAIN_RATE;
  }
  const mainRateTax = annualProfit * MAIN_RATE;
  const marginalReliefFraction = 3 / 200;
  const relief =
    (MAIN_RATE_THRESHOLD - annualProfit) * marginalReliefFraction;
  return Math.max(0, mainRateTax - relief);
}

/* ----------------------------- Income Tax -------------------------------- */

const PERSONAL_ALLOWANCE = 12_570;
const BASIC_RATE_THRESHOLD = 50_270;
const HIGHER_RATE_THRESHOLD = 125_140;

export function calculateIncomeTax(annualProfit: number): number {
  if (annualProfit <= PERSONAL_ALLOWANCE) return 0;

  let tax = 0;
  let remaining = annualProfit - PERSONAL_ALLOWANCE;

  const basicBand = BASIC_RATE_THRESHOLD - PERSONAL_ALLOWANCE;
  if (remaining > 0) {
    const taxable = Math.min(remaining, basicBand);
    tax += taxable * 0.2;
    remaining -= taxable;
  }

  const higherBand = HIGHER_RATE_THRESHOLD - BASIC_RATE_THRESHOLD;
  if (remaining > 0) {
    const taxable = Math.min(remaining, higherBand);
    tax += taxable * 0.4;
    remaining -= taxable;
  }

  if (remaining > 0) {
    tax += remaining * 0.45;
  }

  return tax;
}

/* ------------------------- Annualised profit ----------------------------- */

export function annualisedProfit(
  income: number,
  expenses: number,
  windowDays = 90,
): number {
  const dailyNet = (income - expenses) / windowDays;
  return dailyNet * 365;
}

/* ------------------------- Missing receipts ------------------------------ */

export function countMissingReceipts(txs: ApiTransaction[]): number {
  return txs.filter(
    (tx) =>
      tx.amount < 0 &&
      (!tx.merchant_name || tx.merchant_name.trim().length === 0) &&
      !tx.transaction_category,
  ).length;
}
