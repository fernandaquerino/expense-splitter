import { Injectable } from '@nestjs/common';
import {
  BalanceExpenseInput,
  GroupTotals,
  MemberBalance,
} from './balance.types';

/**
 * Derives per-member balances and group totals from persisted expenses.
 *
 * For each expense the payer is credited the full amount and every participant
 * is debited their split share. A member's net balance is `paid - owed`.
 *
 * Because splits always sum to the expense amount (see SplitService), the sum
 * of all members' net balances is exactly zero — the invariant the spec
 * requires. All arithmetic is integer minor units, so there is no rounding
 * drift to threshold away.
 *
 * MVP scope: single currency per group, so amounts combine directly with no
 * conversion. (Multi-currency accounting is intentionally deferred.)
 */
export function computeMemberBalances(
  memberIds: readonly string[],
  expenses: readonly BalanceExpenseInput[],
): MemberBalance[] {
  const paid = new Map<string, number>();
  const owed = new Map<string, number>();
  for (const id of memberIds) {
    paid.set(id, 0);
    owed.set(id, 0);
  }

  for (const expense of expenses) {
    paid.set(expense.payerId, (paid.get(expense.payerId) ?? 0) + expense.amountMinor);
    for (const split of expense.splits) {
      owed.set(split.memberId, (owed.get(split.memberId) ?? 0) + split.shareMinor);
    }
  }

  return memberIds.map((memberId) => {
    const paidMinor = paid.get(memberId) ?? 0;
    const owedMinor = owed.get(memberId) ?? 0;
    return { memberId, paidMinor, owedMinor, netMinor: paidMinor - owedMinor };
  });
}

export function computeGroupTotals(
  expenses: readonly BalanceExpenseInput[],
): GroupTotals {
  return {
    expenseCount: expenses.length,
    totalSpentMinor: expenses.reduce((sum, e) => sum + e.amountMinor, 0),
  };
}

@Injectable()
export class BalanceService {
  memberBalances(
    memberIds: readonly string[],
    expenses: readonly BalanceExpenseInput[],
  ): MemberBalance[] {
    return computeMemberBalances(memberIds, expenses);
  }

  groupTotals(expenses: readonly BalanceExpenseInput[]): GroupTotals {
    return computeGroupTotals(expenses);
  }
}
