'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { CURRENCIES } from '@/lib/currencies';

interface MemberDraft {
  name: string;
  email: string;
}

/**
 * Create / edit a group. In create mode it also collects the initial members
 * (name required, email optional — name-only members are first-class). In edit
 * mode only the group's own fields are shown; members are managed separately.
 */
export function GroupForm({
  mode,
  groupId,
  initial,
}: {
  mode: 'create' | 'edit';
  groupId?: string;
  initial?: { name: string; description: string; currencyCode: string };
}) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [currencyCode, setCurrencyCode] = useState(initial?.currencyCode ?? 'USD');
  const [members, setMembers] = useState<MemberDraft[]>(
    mode === 'create'
      ? [
          { name: '', email: '' },
          { name: '', email: '' },
        ]
      : [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim() === '' ? 'Group name is required' : undefined;

  function updateMember(i: number, patch: Partial<MemberDraft>) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }
  function addMemberRow() {
    setMembers((prev) => [...prev, { name: '', email: '' }]);
  }
  function removeMemberRow(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (name.trim() === '') return;

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const cleanedMembers = members
          .filter((m) => m.name.trim() !== '')
          .map((m) => ({
            name: m.name.trim(),
            ...(m.email.trim() ? { email: m.email.trim() } : {}),
          }));
        const group = await api.createGroup({
          name: name.trim(),
          description: description.trim() || undefined,
          currencyCode,
          members: cleanedMembers,
        });
        router.push(`/groups/${group.id}`);
        router.refresh();
      } else if (groupId) {
        await api.updateGroup(groupId, {
          name: name.trim(),
          description: description.trim(),
          currencyCode,
        });
        router.push(`/groups/${groupId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the group.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div role="alert" className="rounded-md border border-error/40 bg-owe-subtle px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <Field label="Group name" htmlFor="group-name" required error={nameError}>
        <Input
          id="group-name"
          value={name}
          placeholder="e.g. Trip to Japan"
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={Boolean(nameError)}
          maxLength={80}
        />
      </Field>

      <Field label="Description" htmlFor="group-description" hint="Optional.">
        <Textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          placeholder="What is this group for?"
        />
      </Field>

      <Field
        label="Default currency"
        htmlFor="group-currency"
        required
        hint="All expenses in this group are recorded in this currency."
      >
        <Select
          id="group-currency"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code} — {c.name}
            </option>
          ))}
        </Select>
      </Field>

      {mode === 'create' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-text-secondary">Members</legend>
          <p className="-mt-1 text-xs text-text-tertiary">
            Add people by name. Email is optional — leave it blank for someone
            without an account.
          </p>
          <div className="flex flex-col gap-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <Input
                  aria-label={`Member ${i + 1} name`}
                  placeholder="Name"
                  value={m.name}
                  onChange={(e) => updateMember(i, { name: e.target.value })}
                  maxLength={60}
                />
                <Input
                  aria-label={`Member ${i + 1} email (optional)`}
                  type="email"
                  placeholder="Email (optional)"
                  value={m.email}
                  onChange={(e) => updateMember(i, { email: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeMemberRow(i)}
                  aria-label={`Remove member ${i + 1}`}
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-text-tertiary hover:bg-bg-tertiary hover:text-error focus-visible:outline-2"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={addMemberRow}>
              <Plus size={15} /> Add member
            </Button>
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(groupId ? `/groups/${groupId}` : '/dashboard')}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : mode === 'create' ? 'Create group' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
