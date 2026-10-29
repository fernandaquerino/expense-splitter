import type { Currency } from './types';

/** Mirrors the API's supported-currency registry (apps/api/src/domain/currency.ts). */
export const CURRENCIES: Currency[] = [
  { code: 'USD', decimals: 2, symbol: '$', name: 'US Dollar' },
  { code: 'EUR', decimals: 2, symbol: '€', name: 'Euro' },
  { code: 'GBP', decimals: 2, symbol: '£', name: 'British Pound' },
  { code: 'JPY', decimals: 0, symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', decimals: 2, symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', decimals: 2, symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', decimals: 2, symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', decimals: 2, symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', decimals: 2, symbol: '₹', name: 'Indian Rupee' },
  { code: 'MXN', decimals: 2, symbol: 'MX$', name: 'Mexican Peso' },
];
