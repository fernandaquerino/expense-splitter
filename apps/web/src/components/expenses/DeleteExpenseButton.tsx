'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export function DeleteExpenseButton({
  groupId,
  expenseId,
  description,
}: {
  groupId: string;
  expenseId: string;
  description: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteExpense(groupId, expenseId);
      router.push(`/groups/${groupId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not delete the expense.',
      );
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Trash2 size={16} /> Delete
      </Button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title="Delete expense">
        <p className="text-sm text-text-secondary">
          Delete <strong className="text-text-primary">{description}</strong>? This
          removes it from the group and updates everyone’s balances. This can’t be
          undone.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete expense'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
