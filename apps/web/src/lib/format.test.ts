import { describe, expect, it } from 'vitest';
import { formatMoney, initials, minorToMajor } from './format';

describe('formatMoney', () => {
  it('formats USD and JPY correctly', () => {
    expect(formatMoney(123456, 'USD')).toBe('$1,234.56');
    expect(formatMoney(123456, 'JPY')).toBe('¥123,456');
  });
  it('never truncates large amounts', () => {
    expect(formatMoney(199999999, 'USD')).toBe('$1,999,999.99');
  });
});

describe('minorToMajor', () => {
  it('respects currency decimals', () => {
    expect(minorToMajor(4250, 'USD')).toBe(42.5);
    expect(minorToMajor(4850, 'JPY')).toBe(4850);
  });
});

describe('initials', () => {
  it('takes first and last initials', () => {
    expect(initials('Alex Chen')).toBe('AC');
    expect(initials('Dev')).toBe('D');
    expect(initials('  ')).toBe('?');
  });
});
