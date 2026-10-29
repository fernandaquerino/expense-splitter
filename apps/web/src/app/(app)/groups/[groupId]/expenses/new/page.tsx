import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/primitives';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import type { GroupDetail } from '@/lib/types';

export const metadata: Metadata = { title: 'Add expense' };

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  let group: GroupDetail;
  try {
    group = await api.getGroup(groupId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-content">
      <Breadcrumbs
        items={[
          { label: 'Groups', href: '/dashboard' },
          { label: group.name, href: `/groups/${groupId}` },
          { label: 'Add expense' },
        ]}
      />
      <PageHeader title="Add expense" subtitle={`in ${group.name}`} />
      <Card className="p-5 sm:p-6">
        <ExpenseForm
          mode="create"
          groupId={groupId}
          currencyCode={group.currencyCode}
          members={group.members}
        />
      </Card>
    </div>
  );
}
