import type { ApiTransaction } from "@/lib/api";

// Standard UK VAT rate
export const VAT_RATE = 0.2;

// VAT-inclusive amounts: VAT portion = amount * (rate / (1 + rate))
const VAT_FRACTION = VAT_RATE / (1 + VAT_RATE);

export type VatBreakdown = {
  income: number;
  expenses: number;
  outputVat: number;
  inputVat: number;
  liability: number;
  periodStart: string;
  periodEnd: string;
};

export function calculateVatLiability(
  transactions: ApiTransaction[],
  windowDays = 90,
): VatBreakdown {
  const now = Date.now();
  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;

  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    const ts = new Date(tx.timestamp).getTime();
    if (ts < cutoff) continue;

    if (tx.amount > 0) {
      income += tx.amount;
    } else {
      expenses += Math.abs(tx.amount);
    }
  }

  const outputVat = income * VAT_FRACTION;
  const inputVat = expenses * VAT_FRACTION;
  const liability = Math.max(0, outputVat - inputVat);

  return {
    income,
    expenses,
    outputVat,
    inputVat,
    liability,
    periodStart: new Date(cutoff).toISOString(),
    periodEnd: new Date(now).toISOString(),
  };
}
