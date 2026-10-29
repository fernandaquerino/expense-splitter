import { describe, expect, it } from 'vitest';
import { parseAmount } from './money';

describe('parseAmount', () => {
  it('parses USD to cents', () => {
    expect(parseAmount('42.50', 'USD')).toEqual({ ok: true, minor: 4250 });
    expect(parseAmount('100', 'USD')).toEqual({ ok: true, minor: 10000 });
  });

  it('parses JPY as whole units and rejects decimals', () => {
    expect(parseAmount('4850', 'JPY')).toEqual({ ok: true, minor: 4850 });
    expect(parseAmount('4850.5', 'JPY').ok).toBe(false);
  });

  it('rejects too many decimals for USD', () => {
    const r = parseAmount('1.234', 'USD');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/decimal/i);
  });

  it('rejects empty, non-numeric, and zero', () => {
    expect(parseAmount('', 'USD').ok).toBe(false);
    expect(parseAmount('abc', 'USD').ok).toBe(false);
    expect(parseAmount('0', 'USD').ok).toBe(false);
    expect(parseAmount('0.00', 'USD').ok).toBe(false);
  });
});
