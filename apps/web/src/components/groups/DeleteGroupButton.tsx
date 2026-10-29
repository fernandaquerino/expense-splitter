'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function DeleteGroupButton({
  groupId,
  groupName,
  expenseCount,
}: {
  groupId: string;
  groupName: string;
  expenseCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = expenseCount > 0;

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteGroup(groupId);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the group.');
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Trash2 size={16} /> Delete group
      </Button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Delete group">
        {blocked ? (
          <p className="text-sm text-text-secondary">
            <strong className="text-text-primary">{groupName}</strong> still has{' '}
            {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}. Delete its
            expenses first before deleting the group.
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Delete <strong className="text-text-primary">{groupName}</strong> and all its
            members? This can’t be undone.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={busy || blocked}
          >
            {busy ? 'Deleting…' : 'Delete group'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
