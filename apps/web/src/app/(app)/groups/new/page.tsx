import type { Metadata } from 'next';
import { Breadcrumbs, PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/primitives';
import { GroupForm } from '@/components/groups/GroupForm';

export const metadata: Metadata = { title: 'New group' };

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-content">
      <Breadcrumbs
        items={[{ label: 'Groups', href: '/dashboard' }, { label: 'New group' }]}
      />
      <PageHeader
        title="New group"
        subtitle="Create a group and add the people splitting costs."
      />
      <Card className="p-5 sm:p-6">
        <GroupForm mode="create" />
      </Card>
    </div>
  );
}
