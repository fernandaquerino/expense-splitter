'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import { parseAmount } from '@/lib/money';
import { allocateEqualSplit } from '@/lib/split';
import { formatMoney } from '@/lib/format';
import type { Member } from '@/lib/types';

export interface ExpenseFormInitial {
  description: string;
  amount: string;
  date: string; // yyyy-mm-dd
  category: string;
  payerId: string;
  participantIds: string[];
  notes: string;
}

export function ExpenseForm({
  mode,
  groupId,
  currencyCode,
  members,
  expenseId,
  initial,
}: {
  mode: 'create' | 'edit';
  groupId: string;
  currencyCode: string;
  members: Member[];
  expenseId?: string;
  initial?: ExpenseFormInitial;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [description, setDescription] = useState(initial?.description ?? '');
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [date, setDate] = useState(initial?.date ?? today);
  const [category, setCategory] = useState(initial?.category ?? 'Food & Drink');
  const [payerId, setPayerId] = useState(initial?.payerId ?? members[0]?.id ?? '');
  const [participantIds, setParticipantIds] = useState<string[]>(
    initial?.participantIds ?? members.map((m) => m.id),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const amountResult = useMemo(
    () => parseAmount(amount, currencyCode),
    [amount, currencyCode],
  );

  // Live split preview — same allocation the server will apply.
  const preview = useMemo(() => {
    if (!amountResult.ok || participantIds.length === 0) return null;
    return allocateEqualSplit(amountResult.minor, participantIds, payerId);
  }, [amountResult, participantIds, payerId]);

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  );

  function toggleParticipant(id: string) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const descriptionError =
    touched && description.trim() === '' ? 'Description is required' : undefined;
  const amountError = touched && !amountResult.ok ? amountResult.error : undefined;
  const participantsError =
    touched && participantIds.length === 0 ? 'Select at least one participant' : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setFormError(null);

    if (description.trim() === '' || !amountResult.ok || participantIds.length === 0) {
      return;
    }

    const payload = {
      description: description.trim(),
      amount,
      date: `${date}T12:00:00.000Z`,
      category,
      payerId,
      participantIds,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (mode === 'create') {
        await api.createExpense(groupId, payload);
      } else if (expenseId) {
        await api.updateExpense(groupId, expenseId, payload);
      }
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not save the expense. Please try again.',
      );
      setSubmitting(false);
    }
  }

  const selectedCount = participantIds.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && (
        <div
          role="alert"
          className="rounded-md border border-error/40 bg-owe-subtle px-4 py-3 text-sm text-error"
        >
          {formError}
        </div>
      )}

      {/* Amount — the critical field, most prominent. */}
      <Field label="Amount" htmlFor="amount" required error={amountError}>
        <div className="flex items-stretch overflow-hidden rounded-md border border-border bg-surface focus-within:outline-2 focus-within:outline-focus">
          <span className="flex items-center border-r border-border bg-bg-tertiary px-3 text-sm font-medium text-text-secondary">
            {currencyCode}
          </span>
          <input
            id="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(amountError)}
            className="tnum w-full bg-transparent px-3 py-2.5 text-xl font-semibold text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>
      </Field>

      <Field label="Description" htmlFor="description" required error={descriptionError}>
        <Input
          id="description"
          value={description}
          placeholder="e.g. Dinner at the izakaya"
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={Boolean(descriptionError)}
          maxLength={140}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" htmlFor="date" required>
          <Input
            id="date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Category" htmlFor="category" required>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Paid by — single select via avatar chips (radiogroup). */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text-secondary">
          Paid by <span className="text-error">*</span>
        </legend>
        <div role="radiogroup" aria-label="Paid by" className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = payerId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPayerId(m.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                  active
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border text-text-secondary hover:bg-bg-tertiary'
                }`}
              >
                <Avatar name={m.name} color={m.avatarColor} size="sm" />
                {m.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Split between — multi-select chips. */}
      <fieldset>
        <legend className="mb-2 flex items-center justify-between text-sm font-medium text-text-secondary">
          <span>
            Split between <span className="text-error">*</span>
          </span>
          <span className="font-normal text-text-tertiary" aria-live="polite">
            {selectedCount} of {members.length} selected
          </span>
        </legend>
        <div role="group" aria-label="Split between" className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = participantIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleParticipant(m.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                  active
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border text-text-tertiary hover:bg-bg-tertiary'
                }`}
              >
                <Avatar name={m.name} color={m.avatarColor} size="sm" />
                {m.name}
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {participantsError && (
          <p role="alert" className="mt-1.5 text-xs text-error">
            {participantsError}
          </p>
        )}
      </fieldset>

      {/* Live split preview */}
      {preview && (
        <div className="rounded-md border border-border-subtle bg-bg-secondary p-4">
          <p className="mb-2 text-sm font-medium text-text-secondary">
            Split preview — {formatMoney(amountResult.minor, currencyCode)} ·{' '}
            {selectedCount} {selectedCount === 1 ? 'way' : 'ways'}
          </p>
          <ul className="flex flex-col gap-1.5">
            {preview.map((share) => {
              const m = memberById.get(share.memberId);
              if (!m) return null;
              return (
                <li key={share.memberId} className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-text-primary">
                    <Avatar name={m.name} color={m.avatarColor} size="sm" />
                    {m.name}
                  </span>
                  <span className="tnum font-medium text-text-primary">
                    {formatMoney(share.shareMinor, currencyCode)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Field label="Notes" htmlFor="notes" hint="Optional — e.g. why the split differs.">
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          placeholder="Add a note"
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/groups/${groupId}`)}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? 'Saving…'
            : mode === 'create'
              ? 'Add expense'
              : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
