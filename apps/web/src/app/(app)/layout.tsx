import { AppShell, type NavGroup } from '@/components/layout/AppShell';
import { api } from '@/lib/api';

// This area is data-driven and personalized; never statically prerender it
// (and never hit the API during `next build`).
export const dynamic = 'force-dynamic';

/**
 * Shell layout for the authenticated-style app area (guest session in the MVP).
 * Fetches the group list for the sidebar. If the API is unreachable the shell
 * still renders with an empty nav so the page can show its own error state.
 */
export default async function AppAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let groups: NavGroup[] = [];
  try {
    const list = await api.listGroups();
    groups = list.map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g.memberCount,
    }));
  } catch {
    groups = [];
  }

  return <AppShell groups={groups}>{children}</AppShell>;
}
