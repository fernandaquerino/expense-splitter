import { currencyDecimals } from './format';

/**
 * Client-side money parsing, mirroring the API's money domain. Used for live
 * validation and the split preview before submit. The server re-validates and
 * is the source of truth; this only makes the form feel responsive.
 */

export interface ParseResult {
  ok: boolean;
  minor: number;
  error?: string;
}

/** Parse a user-entered major-unit string into integer minor units. */
export function parseAmount(value: string, currencyCode: string): ParseResult {
  const raw = value.trim();
  const decimals = currencyDecimals(currencyCode);

  if (raw === '') return { ok: false, minor: 0, error: 'Enter an amount' };
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return { ok: false, minor: 0, error: 'Enter a valid number' };
  }

  const [whole, fraction = ''] = raw.split('.');
  if (fraction.length > decimals) {
    return {
      ok: false,
      minor: 0,
      error:
        decimals === 0
          ? `${currencyCode} amounts can’t have decimals`
          : `${currencyCode} allows at most ${decimals} decimal place${decimals === 1 ? '' : 's'}`,
    };
  }

  const padded = fraction.padEnd(decimals, '0');
  const minor = Number(whole) * 10 ** decimals + Number(padded || '0');
  if (minor <= 0) return { ok: false, minor: 0, error: 'Amount must be greater than zero' };

  return { ok: true, minor };
}
