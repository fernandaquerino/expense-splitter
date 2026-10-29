/** A single member's allocated share of an expense, in integer minor units. */
export interface AllocatedShare {
  readonly memberId: string;
  readonly shareMinor: number;
}

/** Input describing how an expense should be split equally. */
export interface EqualSplitInput {
  /** Expense total in integer minor units. Must be a non-negative integer. */
  readonly totalMinor: number;
  /** Member ids participating in the split (the people who share the cost). */
  readonly participantIds: readonly string[];
  /**
   * The member who paid. If they are a participant, any leftover minor units
   * from rounding are assigned to them first (the deterministic rule).
   */
  readonly payerId: string;
}
