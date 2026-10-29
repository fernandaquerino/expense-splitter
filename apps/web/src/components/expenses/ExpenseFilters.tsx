'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { Select, Input } from '@/components/ui/Field';

/**
 * Category + date-range filters. State lives in the URL query string so filters
 * are shareable, survive refreshes, and the server component re-fetches the
 * filtered list. Combined filters apply together.
 */
export function ExpenseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get('category') ?? '';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const hasFilters = Boolean(category || from || to);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-40 flex-col gap-1">
        <label htmlFor="filter-category" className="text-xs font-medium text-text-tertiary">
          Category
        </label>
        <Select
          id="filter-category"
          value={category}
          onChange={(e) => setParam('category', e.target.value)}
        >
          <option value="">All categories</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-from" className="text-xs font-medium text-text-tertiary">
          From
        </label>
        <Input
          id="filter-from"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => setParam('from', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-to" className="text-xs font-medium text-text-tertiary">
          To
        </label>
        <Input
          id="filter-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => setParam('to', e.target.value)}
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary focus-visible:outline-2"
        >
          <X size={15} /> Clear
        </button>
      )}
    </div>
  );
}
