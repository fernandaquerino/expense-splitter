'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpDown, LayoutDashboard, Menu, Plus, Users, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export interface NavGroup {
  id: string;
  name: string;
  memberCount: number;
}

function NavLinks({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-accent-subtle text-accent'
        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
    }`;

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        aria-current={pathname === '/dashboard' ? 'page' : undefined}
        className={linkClass(pathname === '/dashboard')}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>

      <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        Groups
      </p>
      <ul className="flex flex-col gap-0.5">
        {groups.map((g) => {
          const href = `/groups/${g.id}`;
          const active = isActive(href);
          return (
            <li key={g.id}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={linkClass(active)}
              >
                <span className="truncate">{g.name}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-text-tertiary">
                  <Users size={12} />
                  {g.memberCount}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/groups/new"
        onClick={onNavigate}
        aria-current={pathname === '/groups/new' ? 'page' : undefined}
        className={`mt-2 ${linkClass(pathname === '/groups/new')}`}
      >
        <Plus size={18} />
        New group
      </Link>
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold text-text-primary">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
        <ArrowUpDown size={15} />
      </span>
      Expense Splitter
    </Link>
  );
}

export function AppShell({
  groups,
  children,
}: {
  groups: NavGroup[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-bg-primary">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col border-r border-border bg-bg-secondary px-3 py-5 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-6 flex flex-1 flex-col">
          <NavLinks groups={groups} pathname={pathname} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border-subtle px-2 pt-4">
          <span className="text-xs text-text-tertiary">Guest session</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg-secondary px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary"
        >
          <Menu size={18} />
        </button>
        <Brand />
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-bg-secondary px-3 py-5"
          >
            <div className="flex items-center justify-between px-2">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 flex flex-1 flex-col">
              <NavLinks
                groups={groups}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-sidebar">
        <main id="main" className="mx-auto max-w-page px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
