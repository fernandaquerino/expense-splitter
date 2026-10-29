/**
 * Predefined expense categories (spec core requirement #2 / #8).
 *
 * Custom categories are allowed in the data model (category is a free string),
 * but expense creation must use one of these predefined values in the MVP;
 * the DTO validates against this list.
 */
export const EXPENSE_CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Accommodation',
  'Housing',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value);
}
