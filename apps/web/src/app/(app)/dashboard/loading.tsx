import { Card, Skeleton } from '@/components/ui/primitives';

export default function DashboardLoading() {
  return (
    <>
      <div className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="mb-3 h-6 w-24" />
      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-6 h-7 w-28" />
            <Skeleton className="mt-4 h-4 w-40" />
          </Card>
        ))}
      </div>

      <Skeleton className="mb-3 h-6 w-36" />
      <Card>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1.5 h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
