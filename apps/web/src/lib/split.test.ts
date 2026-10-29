import { describe, expect, it } from 'vitest';
import { allocateEqualSplit } from './split';

const sum = (s: { shareMinor: number }[]) => s.reduce((a, x) => a + x.shareMinor, 0);

describe('allocateEqualSplit (client mirror)', () => {
  it('matches the API edge cases and always sums to the total', () => {
    expect(sum(allocateEqualSplit(2450, ['p', 'b', 'c', 'd'], 'p'))).toBe(2450);
    expect(sum(allocateEqualSplit(14237, ['p', 'b', 'c'], 'p'))).toBe(14237);
    expect(sum(allocateEqualSplit(3499, ['p', 'b', 'c', 'd', 'e'], 'p'))).toBe(3499);
    expect(sum(allocateEqualSplit(4850, ['p', 'b', 'c', 'd'], 'p'))).toBe(4850);
  });

  it('gives the leftover unit to the payer', () => {
    const shares = allocateEqualSplit(100, ['x', 'payer', 'z'], 'payer');
    const byId = Object.fromEntries(shares.map((s) => [s.memberId, s.shareMinor]));
    expect(byId.payer).toBe(34);
    expect(byId.x).toBe(33);
    expect(byId.z).toBe(33);
  });

  it('returns an empty allocation for no participants', () => {
    expect(allocateEqualSplit(100, [], 'x')).toEqual([]);
  });
});
