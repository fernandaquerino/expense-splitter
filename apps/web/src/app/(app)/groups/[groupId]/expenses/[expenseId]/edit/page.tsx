import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Expense, GroupDetail } from '@/lib/types';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/primitives';
import { ExpenseForm, type ExpenseFormInitial } from '@/components/expenses/ExpenseForm';
import { currencyDecimals, minorToMajor, toDateInputValue } from '@/lib/format';

export const metadata: Metadata = { title: 'Edit expense' };

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ groupId: string; expenseId: string }>;
}) {
  const { groupId, expenseId } = await params;

  let group: GroupDetail;
  let expense: Expense;
  try {
    [group, expense] = await Promise.all([
      api.getGroup(groupId),
      api.getExpense(groupId, expenseId),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const decimals = currencyDecimals(expense.currencyCode);
  const initial: ExpenseFormInitial = {
    description: expense.description,
    amount: minorToMajor(expense.amountMinor, expense.currencyCode).toFixed(decimals),
    date: toDateInputValue(expense.date),
    category: expense.category,
    payerId: expense.payerId,
    participantIds: expense.participantIds,
    notes: expense.notes ?? '',
  };

  return (
    <div className="mx-auto max-w-content">
      <Breadcrumbs
        items={[
          { label: 'Groups', href: '/dashboard' },
          { label: group.name, href: `/groups/${groupId}` },
          { label: expense.description, href: `/groups/${groupId}/expenses/${expenseId}` },
          { label: 'Edit' },
        ]}
      />
      <PageHeader title="Edit expense" subtitle={`in ${group.name}`} />
      <Card className="p-5 sm:p-6">
        <ExpenseForm
          mode="edit"
          groupId={groupId}
          expenseId={expenseId}
          currencyCode={group.currencyCode}
          members={group.members}
          initial={initial}
        />
      </Card>
    </div>
  );
}
