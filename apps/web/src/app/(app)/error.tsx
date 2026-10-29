'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Error boundary for the app area. Shows a specific, non-technical message and
 * a retry action (per guidance/patterns.md: no raw errors, don't silently fail).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for debugging without exposing details to the user.
    console.error(error);
  }, [error]);

  const isConnection = /reach the server|Failed to fetch/i.test(error.message);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-surface px-6 py-12 text-center">
      <span className="text-error">
        <AlertTriangle size={28} />
      </span>
      <h1 className="text-lg font-bold text-text-primary">
        {isConnection ? 'Can’t reach the server' : 'Something went wrong'}
      </h1>
      <p className="text-sm text-text-secondary">
        {isConnection
          ? 'The app couldn’t connect to the API. Make sure the backend is running, then try again.'
          : error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
