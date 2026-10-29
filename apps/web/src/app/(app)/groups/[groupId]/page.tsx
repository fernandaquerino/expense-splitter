import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Plus, Receipt, SlidersHorizontal, Settings } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { ExpenseFilters as Filters, GroupDetail } from '@/lib/types';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/Button';
import { Card, EmptyState } from '@/components/ui/primitives';
import { BalancePanel } from '@/components/groups/BalancePanel';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { ExpenseRow } from '@/components/expenses/ExpenseRow';

interface PageProps {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { groupId } = await params;
  try {
    const group = await api.getGroup(groupId);
    return { title: group.name };
  } catch {
    return { title: 'Group' };
  }
}

function buildFilters(
  sp: Record<string, string | string[] | undefined>,
): Filters {
  const str = (v: string | string[] | undefined) =>
    typeof v === 'string' && v.length > 0 ? v : undefined;
  const from = str(sp.from);
  const to = str(sp.to);
  return {
    category: str(sp.category),
    // Make the date range inclusive of whole days.
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  };
}

export default async function GroupPage({ params, searchParams }: PageProps) {
  const { groupId } = await params;
  const sp = await searchParams;
  const filters = buildFilters(sp);
  const hasFilters = Boolean(sp.category || sp.from || sp.to);

  let group: GroupDetail;
  try {
    group = await api.getGroup(groupId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const expenses = await api.listExpenses(groupId, filters);

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Groups', href: '/dashboard' }, { label: group.name }]}
      />
      <PageHeader
        title={group.name}
        subtitle={group.description || undefined}
        action={
          <>
            <LinkButton href={`/groups/${groupId}/edit`} variant="secondary" size="sm">
              <Settings size={16} /> Edit
            </LinkButton>
            <LinkButton href={`/groups/${groupId}/expenses/new`} size="sm">
              <Plus size={16} /> Add expense
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Balances: first in DOM (mobile shows it first), right column on desktop. */}
        <aside className="lg:order-2">
          <BalancePanel group={group} />
        </aside>

        <section className="lg:order-1" aria-labelledby="expenses-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="expenses-heading" className="text-lg font-bold text-text-primary">
              Expenses
            </h2>
          </div>

          <div className="mb-4 rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
              <SlidersHorizontal size={15} /> Filter
            </div>
            <ExpenseFilters />
          </div>

          {expenses.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={<SlidersHorizontal size={26} />}
                title="No expenses match these filters"
                description="Try widening the date range or clearing the category filter."
              />
            ) : (
              <EmptyState
                icon={<Receipt size={26} />}
                title="No expenses yet"
                description="Add your first expense to start tracking who paid and who owes."
                action={
                  <LinkButton href={`/groups/${groupId}/expenses/new`}>
                    <Plus size={18} /> Add expense
                  </LinkButton>
                }
              />
            )
          ) : (
            <Card>
              <ul>
                {expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    members={group.members}
                    currencyCode={group.currencyCode}
                    href={`/groups/${groupId}/expenses/${expense.id}`}
                  />
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
