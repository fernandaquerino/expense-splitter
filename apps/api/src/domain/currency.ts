/**
 * Currency domain type.
 *
 * Every monetary value in the system is an integer number of *minor units*
 * (e.g. cents for USD, whole yen for JPY). A currency is defined by its ISO
 * 4217 code and the number of decimal places it uses, which fixes how many
 * minor units make one major unit.
 */
export interface Currency {
  /** ISO 4217 code, e.g. "USD". */
  readonly code: string;
  /** Number of decimal places, e.g. 2 for USD, 0 for JPY. */
  readonly decimals: number;
  /** Human-facing symbol, e.g. "$". */
  readonly symbol: string;
  /** Full name, e.g. "US Dollar". */
  readonly name: string;
}

/**
 * The currencies the MVP supports. This matches the spec's minimum set
 * (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, MXN).
 */
export const SUPPORTED_CURRENCIES: Readonly<Record<string, Currency>> = {
  USD: { code: 'USD', decimals: 2, symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', decimals: 2, symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', decimals: 2, symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', decimals: 0, symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', decimals: 2, symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', decimals: 2, symbol: 'A$', name: 'Australian Dollar' },
  CHF: { code: 'CHF', decimals: 2, symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { code: 'CNY', decimals: 2, symbol: '¥', name: 'Chinese Yuan' },
  INR: { code: 'INR', decimals: 2, symbol: '₹', name: 'Indian Rupee' },
  MXN: { code: 'MXN', decimals: 2, symbol: 'MX$', name: 'Mexican Peso' },
} as const;

export const SUPPORTED_CURRENCY_CODES: readonly string[] =
  Object.keys(SUPPORTED_CURRENCIES);

export function isSupportedCurrency(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_CURRENCIES, code);
}

/**
 * Look up a currency by code. Throws for unsupported codes so that callers
 * can surface a clear validation error instead of silently mis-handling money.
 */
export function getCurrency(code: string): Currency {
  const currency = SUPPORTED_CURRENCIES[code];
  if (!currency) {
    throw new Error(`Unsupported currency code: ${code}`);
  }
  return currency;
}

/** 10 ** decimals — the number of minor units in one major unit. */
export function minorUnitsPerMajor(currency: Currency): number {
  return 10 ** currency.decimals;
}
