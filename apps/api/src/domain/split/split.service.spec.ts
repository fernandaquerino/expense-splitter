import { allocateEqualSplit, SplitService } from './split.service';

const sum = (shares: { shareMinor: number }[]) =>
  shares.reduce((acc, s) => acc + s.shareMinor, 0);

describe('allocateEqualSplit', () => {
  it('splits an evenly divisible amount equally', () => {
    const shares = allocateEqualSplit({
      totalMinor: 8400, // ¥8400 (or $84.00)
      participantIds: ['a', 'b', 'c', 'd'],
      payerId: 'a',
    });
    expect(shares.map((s) => s.shareMinor)).toEqual([2100, 2100, 2100, 2100]);
    expect(sum(shares)).toBe(8400);
  });

  it('always sums exactly to the total (no rounding loss)', () => {
    for (const total of [100, 2450, 14237, 3499, 1, 99999]) {
      for (const n of [1, 2, 3, 4, 5, 7]) {
        const participantIds = Array.from({ length: n }, (_, i) => `m${i}`);
        const shares = allocateEqualSplit({
          totalMinor: total,
          participantIds,
          payerId: 'm0',
        });
        expect(sum(shares)).toBe(total);
      }
    }
  });

  // Edge cases named explicitly in data/README.md

  it('4-way split of $24.50 -> 6.13, 6.13, 6.12, 6.12', () => {
    const shares = allocateEqualSplit({
      totalMinor: 2450,
      participantIds: ['payer', 'b', 'c', 'd'],
      payerId: 'payer',
    });
    expect(sum(shares)).toBe(2450);
    expect(shares.map((s) => s.shareMinor).sort((x, y) => y - x)).toEqual([
      613, 613, 612, 612,
    ]);
  });

  it('3-way split of $142.37 -> 47.46, 47.46, 47.45', () => {
    const shares = allocateEqualSplit({
      totalMinor: 14237,
      participantIds: ['payer', 'b', 'c'],
      payerId: 'payer',
    });
    expect(sum(shares)).toBe(14237);
    expect(shares.map((s) => s.shareMinor).sort((x, y) => y - x)).toEqual([
      4746, 4746, 4745,
    ]);
  });

  it('5-way split of $34.99 -> four 7.00 and one 6.99', () => {
    const shares = allocateEqualSplit({
      totalMinor: 3499,
      participantIds: ['payer', 'b', 'c', 'd', 'e'],
      payerId: 'payer',
    });
    expect(sum(shares)).toBe(3499);
    expect(shares.map((s) => s.shareMinor).sort((x, y) => y - x)).toEqual([
      700, 700, 700, 700, 699,
    ]);
  });

  it('JPY 4-way split of ¥4,850 -> 1213, 1213, 1212, 1212 (0 decimals)', () => {
    const shares = allocateEqualSplit({
      totalMinor: 4850,
      participantIds: ['payer', 'b', 'c', 'd'],
      payerId: 'payer',
    });
    expect(sum(shares)).toBe(4850);
    expect(shares.map((s) => s.shareMinor).sort((x, y) => y - x)).toEqual([
      1213, 1213, 1212, 1212,
    ]);
  });

  it('assigns leftover minor units to the payer first (deterministic rule)', () => {
    const shares = allocateEqualSplit({
      totalMinor: 100, // 100 / 3 = 33 r1
      participantIds: ['x', 'payer', 'z'],
      payerId: 'payer',
    });
    const byId = Object.fromEntries(shares.map((s) => [s.memberId, s.shareMinor]));
    expect(byId.payer).toBe(34);
    expect(byId.x).toBe(33);
    expect(byId.z).toBe(33);
    expect(sum(shares)).toBe(100);
  });

  it('falls back to participant order when the payer is not a participant', () => {
    const shares = allocateEqualSplit({
      totalMinor: 100,
      participantIds: ['x', 'y', 'z'],
      payerId: 'not-in-split',
    });
    const byId = Object.fromEntries(shares.map((s) => [s.memberId, s.shareMinor]));
    expect(byId.x).toBe(34); // first participant gets the extra unit
    expect(byId.y).toBe(33);
    expect(byId.z).toBe(33);
  });

  it('preserves the input order of participants in the result', () => {
    const shares = allocateEqualSplit({
      totalMinor: 90,
      participantIds: ['c', 'a', 'b'],
      payerId: 'a',
    });
    expect(shares.map((s) => s.memberId)).toEqual(['c', 'a', 'b']);
  });

  it('handles a single participant', () => {
    const shares = allocateEqualSplit({
      totalMinor: 999,
      participantIds: ['solo'],
      payerId: 'solo',
    });
    expect(shares).toEqual([{ memberId: 'solo', shareMinor: 999 }]);
  });

  it('rejects empty, non-integer, negative, and duplicate inputs', () => {
    expect(() =>
      allocateEqualSplit({ totalMinor: 100, participantIds: [], payerId: 'a' }),
    ).toThrow(/at least one participant/);
    expect(() =>
      allocateEqualSplit({ totalMinor: 10.5, participantIds: ['a'], payerId: 'a' }),
    ).toThrow(/integer/);
    expect(() =>
      allocateEqualSplit({ totalMinor: -5, participantIds: ['a'], payerId: 'a' }),
    ).toThrow(/non-negative/);
    expect(() =>
      allocateEqualSplit({
        totalMinor: 100,
        participantIds: ['a', 'a'],
        payerId: 'a',
      }),
    ).toThrow(/unique/);
  });
});

describe('SplitService', () => {
  it('delegates to allocateEqualSplit', () => {
    const service = new SplitService();
    const shares = service.allocateEqual({
      totalMinor: 100,
      participantIds: ['a', 'b', 'c'],
      payerId: 'a',
    });
    expect(shares.reduce((acc, s) => acc + s.shareMinor, 0)).toBe(100);
  });
});
