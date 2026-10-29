import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p className="tnum text-3xl font-extrabold text-accent">404</p>
      <h1 className="text-xl font-bold text-text-primary">Page not found</h1>
      <p className="text-sm text-text-secondary">
        The group or expense you’re looking for doesn’t exist, or may have been
        removed.
      </p>
      <div className="flex gap-3">
        <LinkButton href="/dashboard">Go to dashboard</LinkButton>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md px-4 text-base font-semibold text-text-secondary hover:text-text-primary"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
