/**
 * Client-side mirror of the API view models (apps/api/src/common/view-models.ts).
 * Monetary values are integer minor units + a currency code; formatting lives
 * in lib/format.ts.
 */

export type SplitType = 'EQUAL';

export interface Currency {
  code: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  hasAccount: boolean;
  createdAt: string;
}

export interface MemberBalance {
  memberId: string;
  paidMinor: number;
  owedMinor: number;
  netMinor: number;
}

export interface GroupListItem {
  id: string;
  name: string;
  description: string;
  currencyCode: string;
  createdAt: string;
  memberCount: number;
  expenseCount: number;
  totalSpentMinor: number;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string;
  currencyCode: string;
  createdAt: string;
  members: Member[];
  totals: {
    expenseCount: number;
    totalSpentMinor: number;
  };
  balances: MemberBalance[];
}

export interface ExpenseSplit {
  memberId: string;
  shareMinor: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amountMinor: number;
  currencyCode: string;
  date: string;
  category: string;
  payerId: string;
  splitType: SplitType;
  notes: string | null;
  createdAt: string;
  splits: ExpenseSplit[];
  participantIds: string[];
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  currencyCode: string;
  members?: { name: string; email?: string; avatarColor?: string }[];
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  currencyCode?: string;
}

export interface CreateMemberInput {
  name: string;
  email?: string;
  avatarColor?: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: string;
  date: string;
  category: string;
  payerId: string;
  participantIds: string[];
  notes?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseFilters {
  category?: string;
  from?: string;
  to?: string;
  payerId?: string;
}
