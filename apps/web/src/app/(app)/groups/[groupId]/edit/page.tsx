import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { GroupDetail } from '@/lib/types';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/primitives';
import { GroupForm } from '@/components/groups/GroupForm';
import { MemberManager } from '@/components/groups/MemberManager';
import { DeleteGroupButton } from '@/components/groups/DeleteGroupButton';

export const metadata: Metadata = { title: 'Edit group' };

export default async function EditGroupPage({
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
          { label: 'Edit' },
        ]}
      />
      <PageHeader title="Edit group" subtitle={group.name} />

      <div className="flex flex-col gap-6">
        <section aria-labelledby="group-details-heading">
          <h2 id="group-details-heading" className="mb-3 text-lg font-bold text-text-primary">
            Group details
          </h2>
          <Card className="p-5 sm:p-6">
            <GroupForm
              mode="edit"
              groupId={groupId}
              initial={{
                name: group.name,
                description: group.description,
                currencyCode: group.currencyCode,
              }}
            />
          </Card>
        </section>

        <section aria-labelledby="members-heading">
          <h2 id="members-heading" className="mb-3 text-lg font-bold text-text-primary">
            Members
          </h2>
          <Card className="p-5 sm:p-6">
            <MemberManager groupId={groupId} members={group.members} />
          </Card>
        </section>

        <section aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="mb-3 text-lg font-bold text-text-primary">
            Danger zone
          </h2>
          <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="font-medium text-text-primary">Delete this group</p>
              <p className="text-sm text-text-secondary">
                Only groups with no expenses can be deleted in this version.
              </p>
            </div>
            <DeleteGroupButton
              groupId={groupId}
              groupName={group.name}
              expenseCount={group.totals.expenseCount}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}
