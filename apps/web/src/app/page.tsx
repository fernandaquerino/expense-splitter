import Link from 'next/link';
import {
  ArrowUpDown,
  Receipt,
  Scale,
  Users,
  ArrowRight,
} from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const FEATURES = [
  {
    icon: Receipt,
    title: 'Log expenses in seconds',
    body: 'Capture who paid, how much, and who shared it. The common case — one payer, split evenly — is the fast path.',
  },
  {
    icon: Scale,
    title: 'Balances you can trust',
    body: 'Every amount is computed in exact integer units. Shares always add up to the total, down to the last cent.',
  },
  {
    icon: Users,
    title: 'Anyone can join',
    body: 'Add people by name — no account required. Everyone participates in splits and balances all the same.',
  },
  {
    icon: ArrowUpDown,
    title: 'See who owes whom',
    body: 'Clear per-member balances across the group, with owe and owed shown by color, sign, and label.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <header className="mx-auto flex max-w-page items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-extrabold text-text-primary">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <ArrowUpDown size={16} />
          </span>
          Expense Splitter
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LinkButton href="/dashboard" variant="secondary" size="sm">
            Open app
          </LinkButton>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto max-w-page px-5 pb-16 pt-12 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Split expenses. Settle up. Stay friends.
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-text-primary sm:text-[3rem]">
              Shared costs, handled with precision.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
              Track who paid for what across trips, households, and friend
              groups. Clear balances, exact numbers, and a path to settling up —
              without the awkward math.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/dashboard" size="md" className="w-full sm:w-auto">
                Try as guest
                <ArrowRight size={18} />
              </LinkButton>
              <LinkButton
                href="/dashboard"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
              >
                Sign up
              </LinkButton>
            </div>
            <p className="mt-3 text-xs text-text-tertiary">
              Guest mode is pre-loaded with 5 example groups — no account needed.
              Account sign-up (to save your own groups) is planned for a future
              release.
            </p>
          </div>
        </section>

        {/* Features */}
        <section
          aria-label="Features"
          className="mx-auto max-w-page px-5 pb-20"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-subtle text-accent">
                  <f.icon size={18} />
                </span>
                <h2 className="text-base font-bold text-text-primary">
                  {f.title}
                </h2>
                <p className="mt-1.5 text-sm text-text-secondary">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="mx-auto max-w-page px-5 py-6 text-xs text-text-tertiary">
          Expense Splitter — a Frontend Mentor product challenge build. MVP:
          equal splits, single currency per group.
        </div>
      </footer>
    </div>
  );
}
