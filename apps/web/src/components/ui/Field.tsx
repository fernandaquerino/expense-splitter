import type { ComponentProps, ReactNode } from 'react';

const controlBase =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-60';

/** Field wrapper: visible label (required by a11y checklist), optional hint & error. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-tertiary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={[controlBase, className].filter(Boolean).join(' ')} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={[controlBase, 'min-h-20 resize-y', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={[controlBase, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </select>
  );
}
