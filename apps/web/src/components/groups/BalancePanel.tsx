import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/primitives';
import { formatMoney, formatMoneyAbs } from '@/lib/format';
import { balanceDirection, balanceLabel, isGroupSettled } from '@/lib/balances';
import type { GroupDetail } from '@/lib/types';

/**
 * Group summary + per-member balances. Direction is conveyed by color AND an
 * icon, sign, and text label (color is never the sole signal), per the a11y
 * checklist. Amounts are tabular monospace so they align.
 */
export function BalancePanel({ group }: { group: GroupDetail }) {
  const memberById = new Map(group.members.map((m) => [m.id, m]));
  const settled = isGroupSettled(group.balances);

  const ordered = [...group.balances].sort((a, b) => b.netMinor - a.netMinor);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary">Balances</h2>
        <span className="tnum rounded-sm bg-bg-tertiary px-1.5 py-0.5 text-xs text-text-tertiary">
          {group.currencyCode}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-bg-tertiary p-3">
          <dt className="text-xs text-text-tertiary">Total spent</dt>
          <dd className="tnum mt-0.5 text-lg font-bold text-text-primary">
            {formatMoney(group.totals.totalSpentMinor, group.currencyCode)}
          </dd>
        </div>
        <div className="rounded-md bg-bg-tertiary p-3">
          <dt className="text-xs text-text-tertiary">Expenses</dt>
          <dd className="tnum mt-0.5 text-lg font-bold text-text-primary">
            {group.totals.expenseCount}
          </dd>
        </div>
      </dl>

      {settled ? (
        <div className="mt-4 flex items-center gap-3 rounded-md bg-owed-subtle p-4 text-owed">
          <CheckCircle2 size={22} />
          <div>
            <p className="font-bold">All settled up!</p>
            <p className="text-sm opacity-90">Everyone’s balance is zero.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-1">
          {ordered.map((balance) => {
            const member = memberById.get(balance.memberId);
            if (!member) return null;
            const dir = balanceDirection(balance.netMinor);
            return (
              <li
                key={balance.memberId}
                className="flex items-center gap-3 rounded-md px-1 py-2"
              >
                <Avatar name={member.name} color={member.avatarColor} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">
                    {member.name}
                    {!member.hasAccount && (
                      <span className="ml-1.5 rounded-sm bg-bg-tertiary px-1 py-0.5 text-xs font-normal text-text-tertiary">
                        name only
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary">{balanceLabel(balance.netMinor)}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    dir === 'owed'
                      ? 'text-owed'
                      : dir === 'owes'
                        ? 'text-owe'
                        : 'text-text-tertiary'
                  }`}
                >
                  {dir === 'owed' && <ArrowUpRight size={15} aria-hidden="true" />}
                  {dir === 'owes' && <ArrowDownRight size={15} aria-hidden="true" />}
                  <span className="tnum">
                    {dir === 'owed' ? '+' : dir === 'owes' ? '−' : ''}
                    {formatMoneyAbs(balance.netMinor, group.currencyCode)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
