import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Users, Receipt, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { LinkButton } from '@/components/ui/Button';
import { Card, EmptyState } from '@/components/ui/primitives';
import { Avatar } from '@/components/ui/Avatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExpenseRow } from '@/components/expenses/ExpenseRow';
import { formatMoney } from '@/lib/format';
import type { Expense, GroupDetail } from '@/lib/types';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const groups = await api.listGroups();

  if (groups.length === 0) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          subtitle="Your groups and recent activity."
        />
        <EmptyState
          icon={<Layers size={28} />}
          title="No groups yet"
          description="Create your first group to start splitting expenses with friends, roommates, or travel companions."
          action={
            <LinkButton href="/groups/new">
              <Plus size={18} /> New group
            </LinkButton>
          }
        />
      </>
    );
  }

  const [details, expenseLists] = await Promise.all([
    Promise.all(groups.map((g) => api.getGroup(g.id))),
    Promise.all(groups.map((g) => api.listExpenses(g.id))),
  ]);

  const detailById = new Map<string, GroupDetail>(details.map((d) => [d.id, d]));

  // Merge recent expenses across every group for the activity feed.
  const recent: { expense: Expense; group: GroupDetail }[] = [];
  expenseLists.forEach((list, i) => {
    const group = details[i]!;
    list.forEach((expense) => recent.push({ expense, group }));
  });
  recent.sort(
    (a, b) =>
      new Date(b.expense.date).getTime() - new Date(a.expense.date).getTime(),
  );
  const recentTop = recent.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Your groups and recent activity."
        action={
          <LinkButton href="/groups/new" size="sm">
            <Plus size={16} /> New group
          </LinkButton>
        }
      />

      <section aria-labelledby="groups-heading" className="mb-10">
        <h2 id="groups-heading" className="mb-3 text-lg font-bold text-text-primary">
          Groups
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const detail = detailById.get(g.id);
            const members = detail?.members ?? [];
            return (
              <Card key={g.id} className="transition-colors hover:border-accent">
                <Link
                  href={`/groups/${g.id}`}
                  className="block rounded-lg p-5 focus-visible:outline-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-text-primary">
                        {g.name}
                      </h3>
                      {g.description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-text-secondary">
                          {g.description}
                        </p>
                      )}
                    </div>
                    <span className="tnum shrink-0 rounded-sm bg-bg-tertiary px-1.5 py-0.5 text-xs text-text-tertiary">
                      {g.currencyCode}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-text-tertiary">Total spent</p>
                      <p className="tnum text-xl font-bold text-text-primary">
                        {formatMoney(g.totalSpentMinor, g.currencyCode)}
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {members.slice(0, 5).map((m) => (
                        <span key={m.id} className="ring-2 ring-surface rounded-full">
                          <Avatar name={m.name} color={m.avatarColor} size="sm" />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-3 text-xs text-text-tertiary">
                    <span className="inline-flex items-center gap-1">
                      <Users size={13} /> {g.memberCount} members
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Receipt size={13} /> {g.expenseCount} expenses
                    </span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="mb-3 text-lg font-bold text-text-primary">
          Recent expenses
        </h2>
        {recentTop.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Open a group and add its first expense."
          />
        ) : (
          <Card>
            <ul>
              {recentTop.map(({ expense, group }) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  members={group.members}
                  currencyCode={group.currencyCode}
                  groupName={group.name}
                  href={`/groups/${group.id}/expenses/${expense.id}`}
                />
              ))}
            </ul>
          </Card>
        )}
      </section>
    </>
  );
}
