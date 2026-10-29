/** Minimal expense shape the balance math needs (currency-agnostic minor units). */
export interface BalanceExpenseInput {
  readonly amountMinor: number;
  readonly payerId: string;
  readonly splits: ReadonlyArray<{ memberId: string; shareMinor: number }>;
}

/** Net financial position of one member within a group, in minor units. */
export interface MemberBalance {
  readonly memberId: string;
  /** Total this member paid out (as payer), in minor units. */
  readonly paidMinor: number;
  /** Total this member owes (sum of their shares), in minor units. */
  readonly owedMinor: number;
  /**
   * Net = paid - owed. Positive -> the group owes this member (they are owed);
   * negative -> this member owes the group.
   */
  readonly netMinor: number;
}

/** Group-level roll-up derived from persisted expenses. */
export interface GroupTotals {
  readonly expenseCount: number;
  readonly totalSpentMinor: number;
}
