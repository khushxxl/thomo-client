const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  INR: "₹",
  AED: "د.إ",
  CAD: "$",
  AUD: "$",
  SGD: "$",
};

export function currencySymbol(currency: string = "GBP"): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
}

export function formatCurrency(
  amount: number,
  currency: string = "GBP",
  options: { decimals?: boolean; compact?: boolean } = {},
): string {
  const symbol = currencySymbol(currency);
  const value = Number.isFinite(amount) ? amount : 0;

  if (options.compact && Math.abs(value) >= 1000) {
    const compactValue = value / 1000;
    const decimals = Math.abs(compactValue) >= 10 ? 0 : 1;
    return `${symbol}${compactValue.toFixed(decimals)}k`;
  }

  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: options.decimals ? 2 : 0,
    maximumFractionDigits: options.decimals ? 2 : 0,
  })}`;
}
