'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal built on the native <dialog> element, which provides focus
 * trapping, Escape-to-close, and focus restoration for free. Opened with
 * showModal() so the backdrop and inertness are handled by the platform.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        // Close when the backdrop (the dialog element itself) is clicked.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,30rem)] rounded-xl border border-border bg-surface p-0 text-text-primary shadow-lg backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-md p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary focus-visible:outline-2"
        >
          <X size={18} />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
