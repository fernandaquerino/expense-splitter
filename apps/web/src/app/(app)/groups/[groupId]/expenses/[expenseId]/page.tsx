import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Expense, GroupDetail } from '@/lib/types';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/primitives';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryIcon } from '@/lib/categories';
import { formatMoney, formatDate } from '@/lib/format';
import { DeleteExpenseButton } from '@/components/expenses/DeleteExpenseButton';

interface PageProps {
  params: Promise<{ groupId: string; expenseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { groupId, expenseId } = await params;
  try {
    const expense = await api.getExpense(groupId, expenseId);
    return { title: expense.description };
  } catch {
    return { title: 'Expense' };
  }
}

export default async function ExpenseDetailPage({ params }: PageProps) {
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

  const memberById = new Map(group.members.map((m) => [m.id, m]));
  const payer = memberById.get(expense.payerId);
  const isPartial = expense.participantIds.length < group.members.length;

  return (
    <div className="mx-auto max-w-content">
      <Breadcrumbs
        items={[
          { label: 'Groups', href: '/dashboard' },
          { label: group.name, href: `/groups/${groupId}` },
          { label: expense.description },
        ]}
      />
      <PageHeader
        title={expense.description}
        action={
          <>
            <LinkButton
              href={`/groups/${groupId}/expenses/${expenseId}/edit`}
              variant="secondary"
              size="sm"
            >
              <Pencil size={16} /> Edit
            </LinkButton>
            <DeleteExpenseButton
              groupId={groupId}
              expenseId={expenseId}
              description={expense.description}
            />
          </>
        }
      />

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-tertiary">
              <CategoryIcon category={expense.category} size={22} />
            </span>
            <div>
              <p className="text-sm text-text-tertiary">{expense.category}</p>
              <p className="text-sm text-text-secondary">
                <time dateTime={expense.date} title={expense.date}>
                  {formatDate(expense.date)}
                </time>
              </p>
            </div>
          </div>
          <p className="tnum text-right text-2xl font-extrabold text-text-primary">
            {formatMoney(expense.amountMinor, expense.currencyCode)}
          </p>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-tertiary">Paid by</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium text-text-primary">
              {payer && <Avatar name={payer.name} color={payer.avatarColor} size="sm" />}
              {payer?.name ?? 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-tertiary">Split</dt>
            <dd className="mt-1 font-medium text-text-primary">
              Equal · {expense.participantIds.length}{' '}
              {expense.participantIds.length === 1 ? 'person' : 'people'}
              {isPartial && (
                <span className="ml-1.5 text-sm font-normal text-text-tertiary">
                  (not everyone)
                </span>
              )}
            </dd>
          </div>
        </dl>

        {expense.notes && (
          <div className="mt-5 border-t border-border-subtle pt-5">
            <p className="text-xs text-text-tertiary">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">
              {expense.notes}
            </p>
          </div>
        )}

        <div className="mt-5 border-t border-border-subtle pt-5">
          <h2 className="mb-3 text-sm font-semibold text-text-secondary">
            Split breakdown
          </h2>
          <ul className="flex flex-col gap-1.5">
            {expense.splits.map((split) => {
              const m = memberById.get(split.memberId);
              if (!m) return null;
              return (
                <li
                  key={split.memberId}
                  className="flex items-center justify-between rounded-md px-1 py-1.5 text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-text-primary">
                    <Avatar name={m.name} color={m.avatarColor} size="sm" />
                    {m.name}
                    {split.memberId === expense.payerId && (
                      <span className="rounded-sm bg-accent-subtle px-1.5 py-0.5 text-xs text-accent">
                        paid
                      </span>
                    )}
                  </span>
                  <span className="tnum font-medium text-text-primary">
                    {formatMoney(split.shareMinor, expense.currencyCode)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>
    </div>
  );
}
