import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { CategoryIcon } from '@/lib/categories';
import { formatMoney, formatDate, formatRelative } from '@/lib/format';
import type { Expense, Member } from '@/lib/types';

/**
 * One expense in a list. Visual hierarchy: amount is most prominent, then
 * description, then payer + date metadata (per guidance/patterns.md). The split
 * tag only appears when the expense is NOT the default "everyone, equally".
 */
export function ExpenseRow({
  expense,
  members,
  currencyCode,
  href,
  groupName,
}: {
  expense: Expense;
  members: Member[];
  currencyCode: string;
  href: string;
  groupName?: string;
}) {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const payer = memberById.get(expense.payerId);
  const isPartialSplit =
    expense.participantIds.length < members.length && members.length > 0;

  return (
    <li className="border-b border-border-subtle last:border-b-0">
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-tertiary focus-visible:outline-2 sm:px-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-tertiary">
          <CategoryIcon category={expense.category} size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate font-semibold text-text-primary">
              {expense.description}
            </span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-text-secondary">
            {payer && (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={payer.name} color={payer.avatarColor} size="sm" />
                <span className="truncate">{payer.name}</span>
              </span>
            )}
            <span aria-hidden="true" className="text-text-tertiary">
              ·
            </span>
            <time
              dateTime={expense.date}
              title={formatDate(expense.date)}
              className="tnum text-text-tertiary"
            >
              {formatRelative(expense.date)}
            </time>
            {groupName && (
              <>
                <span aria-hidden="true" className="text-text-tertiary">
                  ·
                </span>
                <span className="text-text-tertiary">{groupName}</span>
              </>
            )}
            {isPartialSplit && (
              <span className="rounded-sm bg-bg-tertiary px-1.5 py-0.5 text-xs text-text-tertiary">
                Split {expense.participantIds.length} ways
              </span>
            )}
          </span>
        </span>

        <span className="tnum shrink-0 text-right font-semibold text-text-primary">
          {formatMoney(expense.amountMinor, currencyCode)}
        </span>
      </Link>
    </li>
  );
}
