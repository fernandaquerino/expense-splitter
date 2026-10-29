'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, UserX } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { Member } from '@/lib/types';

/**
 * Add and remove group members. Removal is blocked by the API for members who
 * are part of existing expenses (non-zero balance / referential integrity); the
 * resulting message is surfaced inline rather than failing silently.
 */
export function MemberManager({
  groupId,
  members,
}: {
  groupId: string;
  members: Member[];
}) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [removing, setRemoving] = useState<Member | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === '') return;
    setAdding(true);
    setAddError(null);
    try {
      await api.addMember(groupId, {
        name: name.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      setName('');
      setEmail('');
      router.refresh();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : 'Could not add member.');
    } finally {
      setAdding(false);
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setRemoveBusy(true);
    setRemoveError(null);
    try {
      await api.removeMember(groupId, removing.id);
      setRemoving(null);
      router.refresh();
    } catch (err) {
      setRemoveError(
        err instanceof ApiError ? err.message : 'Could not remove member.',
      );
    } finally {
      setRemoveBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border-subtle">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-2.5">
            <Avatar name={m.name} color={m.avatarColor} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-text-primary">{m.name}</p>
              <p className="truncate text-xs text-text-tertiary">
                {m.email ?? 'No account (name only)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRemoveError(null);
                setRemoving(m);
              }}
              aria-label={`Remove ${m.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-tertiary hover:bg-bg-tertiary hover:text-error focus-visible:outline-2"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addMember} className="flex flex-col gap-2 border-t border-border-subtle pt-4">
        <p className="text-sm font-medium text-text-secondary">Add a member</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            aria-label="New member name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <Input
            aria-label="New member email (optional)"
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={adding || name.trim() === ''} className="shrink-0">
            <Plus size={16} /> {adding ? 'Adding…' : 'Add'}
          </Button>
        </div>
        {addError && (
          <p role="alert" className="text-xs text-error">
            {addError}
          </p>
        )}
      </form>

      <Modal
        open={removing !== null}
        onClose={() => !removeBusy && setRemoving(null)}
        title="Remove member"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-text-tertiary">
            <UserX size={20} />
          </span>
          <p className="text-sm text-text-secondary">
            Remove <strong className="text-text-primary">{removing?.name}</strong> from
            this group? Members who are part of existing expenses can’t be removed.
          </p>
        </div>
        {removeError && (
          <p role="alert" className="mt-3 text-sm text-error">
            {removeError}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRemoving(null)} disabled={removeBusy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemove} disabled={removeBusy}>
            {removeBusy ? 'Removing…' : 'Remove'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
