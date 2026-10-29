/**
 * Display formatting for money, dates, and member initials.
 *
 * Money is received as integer minor units + a currency code and formatted via
 * Intl with the currency's own decimal rules — so $1,234.56 and ¥123,456 both
 * render correctly, and amounts are never truncated or re-rounded.
 */

/** Decimal places per supported currency (matches the API's currency registry). */
const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  CAD: 2,
  AUD: 2,
  CHF: 2,
  CNY: 2,
  INR: 2,
  MXN: 2,
};

export function currencyDecimals(code: string): number {
  return CURRENCY_DECIMALS[code] ?? 2;
}

export function minorToMajor(amountMinor: number, currencyCode: string): number {
  return amountMinor / 10 ** currencyDecimals(currencyCode);
}

/** Format integer minor units as a localized currency string. */
export function formatMoney(
  amountMinor: number,
  currencyCode: string,
  locale = 'en-US',
): string {
  const decimals = currencyDecimals(currencyCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(minorToMajor(amountMinor, currencyCode));
  } catch {
    // Unknown currency code: fall back to a plain number with the code.
    return `${minorToMajor(amountMinor, currencyCode).toFixed(decimals)} ${currencyCode}`;
  }
}

/** Absolute value formatting — used when direction is shown separately (owe/owed). */
export function formatMoneyAbs(amountMinor: number, currencyCode: string): string {
  return formatMoney(Math.abs(amountMinor), currencyCode);
}

export function formatDate(iso: string, locale = 'en-US'): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Relative time ("2h ago", "yesterday", "3d ago") with full date as the title attribute. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.round(diffDay / 7)}w ago`;
  return formatDate(iso);
}

/** First-letter initials (up to 2) for an avatar circle. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

/** Convert an ISO timestamp to the value a <input type="date"> expects (yyyy-mm-dd). */
export function toDateInputValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}
