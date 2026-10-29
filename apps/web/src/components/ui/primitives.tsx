import type { ComponentProps, ReactNode } from 'react';

export function Card({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={[
        'rounded-lg border border-border bg-surface',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'owe' | 'owed' | 'warning';
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-bg-tertiary text-text-secondary',
    accent: 'bg-accent-subtle text-accent',
    owe: 'bg-owe-subtle text-owe',
    owed: 'bg-owed-subtle text-owed',
    warning: 'bg-bg-tertiary text-warning',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      {icon && <div className="text-text-tertiary">{icon}</div>}
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={['animate-pulse rounded-md bg-bg-tertiary', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    />
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
