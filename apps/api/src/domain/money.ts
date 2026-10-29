import { Currency, getCurrency, minorUnitsPerMajor } from './currency';

/**
 * Money helpers. All amounts are integer *minor units*; these functions keep
 * the integer-only discipline and never introduce floating-point drift into a
 * stored or computed amount.
 */

/** A monetary amount: an integer count of minor units plus its currency code. */
export interface Money {
  readonly amountMinor: number;
  readonly currencyCode: string;
}

export function money(amountMinor: number, currencyCode: string): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`Money amount must be an integer minor-unit value, got ${amountMinor}`);
  }
  // Validates the currency exists.
  getCurrency(currencyCode);
  return { amountMinor, currencyCode };
}

/**
 * Convert a major-unit decimal string or number (e.g. "12.34") to integer
 * minor units for the given currency. Parsing goes through a string to avoid
 * binary floating-point rounding error (0.1 + 0.2 problems).
 *
 * @throws if the value has more decimal places than the currency allows.
 */
export function majorToMinor(value: string | number, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  const raw = typeof value === 'number' ? numberToPlainString(value) : value.trim();

  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Invalid monetary value: "${raw}"`);
  }

  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const [whole, fraction = ''] = unsigned.split('.');

  if (fraction.length > currency.decimals) {
    throw new Error(
      `${currencyCode} supports at most ${currency.decimals} decimal place(s); got "${raw}"`,
    );
  }

  const paddedFraction = fraction.padEnd(currency.decimals, '0');
  const minor =
    Number(whole) * minorUnitsPerMajor(currency) + Number(paddedFraction || '0');

  return negative ? -minor : minor;
}

/** Convert integer minor units to a major-unit number (for display/serialization). */
export function minorToMajor(amountMinor: number, currencyCode: string): number {
  const currency = getCurrency(currencyCode);
  return amountMinor / minorUnitsPerMajor(currency);
}

/**
 * Format an integer minor-unit amount into a localized currency string, e.g.
 * 123456 USD -> "$1,234.56", 123456 JPY -> "¥123,456".
 *
 * Uses Intl with the currency's own decimal rules. Kept here so the API can
 * format in logs/exports; the web app has its own formatter for the UI.
 */
export function formatMoney(
  amountMinor: number,
  currencyCode: string,
  locale = 'en-US',
): string {
  const currency: Currency = getCurrency(currencyCode);
  const major = minorToMajor(amountMinor, currencyCode);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(major);
}

/**
 * Render a JS number as its shortest round-trip decimal string. `String()`
 * gives "12.34" for 12.34 (not the 12.34000000000000085 that toFixed would),
 * which is what we want before parsing to minor units. Values that stringify
 * to scientific notation (e.g. 1e-7) are rejected by the regex in majorToMinor.
 * Only the number-input path uses this; production amounts arrive as strings.
 */
function numberToPlainString(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid monetary value: ${value}`);
  }
  return String(value);
}
