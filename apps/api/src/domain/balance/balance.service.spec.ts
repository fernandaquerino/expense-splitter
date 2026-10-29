import {
  BalanceService,
  computeGroupTotals,
  computeMemberBalances,
} from './balance.service';
import { BalanceExpenseInput } from './balance.types';

describe('computeMemberBalances', () => {
  const members = ['a', 'b', 'c'];

  it('credits the payer and debits each participant', () => {
    const expenses: BalanceExpenseInput[] = [
      {
        amountMinor: 9000, // a pays $90, split 3 ways = 30 each
        payerId: 'a',
        splits: [
          { memberId: 'a', shareMinor: 3000 },
          { memberId: 'b', shareMinor: 3000 },
          { memberId: 'c', shareMinor: 3000 },
        ],
      },
    ];
    const balances = computeMemberBalances(members, expenses);
    const byId = Object.fromEntries(balances.map((b) => [b.memberId, b]));
    expect(byId.a.netMinor).toBe(6000); // paid 9000, owes 3000
    expect(byId.b.netMinor).toBe(-3000);
    expect(byId.c.netMinor).toBe(-3000);
  });

  it('keeps the sum of all balances at exactly zero', () => {
    const expenses: BalanceExpenseInput[] = [
      {
        amountMinor: 100, // odd split with leftover cent
        payerId: 'a',
        splits: [
          { memberId: 'a', shareMinor: 34 },
          { memberId: 'b', shareMinor: 33 },
          { memberId: 'c', shareMinor: 33 },
        ],
      },
      {
        amountMinor: 2450,
        payerId: 'b',
        splits: [
          { memberId: 'a', shareMinor: 613 },
          { memberId: 'b', shareMinor: 613 },
          { memberId: 'c', shareMinor: 612 },
          // 'c' also owes 612; payer b credited 2450
          { memberId: 'a', shareMinor: 612 },
        ],
      },
    ];
    const balances = computeMemberBalances(members, expenses);
    const total = balances.reduce((acc, b) => acc + b.netMinor, 0);
    expect(total).toBe(0);
  });

  it('includes members with no activity at zero', () => {
    const balances = computeMemberBalances(members, []);
    expect(balances.every((b) => b.netMinor === 0)).toBe(true);
    expect(balances).toHaveLength(3);
  });
});

describe('computeGroupTotals', () => {
  it('counts expenses and sums the total spent', () => {
    const expenses: BalanceExpenseInput[] = [
      { amountMinor: 1000, payerId: 'a', splits: [] },
      { amountMinor: 2500, payerId: 'b', splits: [] },
    ];
    expect(computeGroupTotals(expenses)).toEqual({
      expenseCount: 2,
      totalSpentMinor: 3500,
    });
  });
});

describe('BalanceService', () => {
  it('exposes the pure functions via DI methods', () => {
    const service = new BalanceService();
    expect(service.groupTotals([]).expenseCount).toBe(0);
    expect(service.memberBalances(['a'], [])).toEqual([
      { memberId: 'a', paidMinor: 0, owedMinor: 0, netMinor: 0 },
    ]);
  });
});
