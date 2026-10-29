import { formatMoney, majorToMinor, minorToMajor, money } from './money';

describe('money', () => {
  describe('majorToMinor', () => {
    it('converts USD major units to cents without float drift', () => {
      expect(majorToMinor('0.10', 'USD')).toBe(10);
      expect(majorToMinor('0.20', 'USD')).toBe(20);
      // The classic 0.1 + 0.2 trap: via integers it is exact.
      expect(majorToMinor('0.10', 'USD') + majorToMinor('0.20', 'USD')).toBe(30);
      expect(majorToMinor('1234.56', 'USD')).toBe(123456);
      expect(majorToMinor('42', 'USD')).toBe(4200);
    });

    it('treats JPY as a zero-decimal currency', () => {
      expect(majorToMinor('4850', 'JPY')).toBe(4850);
      expect(() => majorToMinor('4850.5', 'JPY')).toThrow(/decimal/);
    });

    it('rejects values with too many decimal places for the currency', () => {
      expect(() => majorToMinor('1.234', 'USD')).toThrow(/decimal/);
    });

    it('rejects non-numeric input', () => {
      expect(() => majorToMinor('abc', 'USD')).toThrow(/Invalid/);
      expect(() => majorToMinor('', 'USD')).toThrow(/Invalid/);
    });

    it('accepts numeric input through a plain-string path', () => {
      expect(majorToMinor(12.34, 'USD')).toBe(1234);
      expect(majorToMinor(5, 'USD')).toBe(500);
    });
  });

  describe('minorToMajor', () => {
    it('round-trips with majorToMinor', () => {
      expect(minorToMajor(123456, 'USD')).toBeCloseTo(1234.56, 5);
      expect(minorToMajor(4850, 'JPY')).toBe(4850);
    });
  });

  describe('money()', () => {
    it('rejects non-integer minor amounts', () => {
      expect(() => money(10.5, 'USD')).toThrow(/integer/);
    });
    it('rejects unknown currencies', () => {
      expect(() => money(100, 'XYZ')).toThrow(/Unsupported currency/);
    });
  });

  describe('formatMoney', () => {
    it('formats USD with symbol, separators and 2 decimals', () => {
      expect(formatMoney(123456, 'USD')).toBe('$1,234.56');
    });
    it('formats JPY with no decimals', () => {
      expect(formatMoney(123456, 'JPY')).toBe('¥123,456');
    });
  });
});
