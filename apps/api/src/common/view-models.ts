import { MemberBalance } from '../domain/balance/balance.types';

/**
 * API response shapes (view models). Monetary values are returned as integer
 * minor units plus the currency code; the client is responsible for display
 * formatting. This keeps the wire contract free of locale concerns and avoids
 * ever sending a float the client might re-round incorrectly.
 */

export interface MemberView {
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  /** True when the member has an email (treated as a registered account). */
  hasAccount: boolean;
  createdAt: string;
}

export interface GroupListItemView {
  id: string;
  name: string;
  description: string;
  currencyCode: string;
  createdAt: string;
  memberCount: number;
  expenseCount: number;
  totalSpentMinor: number;
}

export interface GroupDetailView {
  id: string;
  name: string;
  description: string;
  currencyCode: string;
  createdAt: string;
  members: MemberView[];
  totals: {
    expenseCount: number;
    totalSpentMinor: number;
  };
  /** Per-member net balances derived from persisted expenses. Sums to zero. */
  balances: MemberBalance[];
}

export interface ExpenseSplitView {
  memberId: string;
  shareMinor: number;
}

export interface ExpenseView {
  id: string;
  groupId: string;
  description: string;
  amountMinor: number;
  currencyCode: string;
  date: string;
  category: string;
  payerId: string;
  splitType: 'EQUAL';
  notes: string | null;
  createdAt: string;
  splits: ExpenseSplitView[];
  /** Convenience: the member ids participating in the split. */
  participantIds: string[];
}
