import { Card, Skeleton } from '@/components/ui/primitives';

export default function GroupLoading() {
  return (
    <>
      <Skeleton className="mb-3 h-4 w-40" />
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="lg:order-2">
          <Card className="p-5">
            <Skeleton className="h-6 w-24" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:order-1">
          <Skeleton className="mb-3 h-6 w-28" />
          <Skeleton className="mb-4 h-24 w-full" />
          <Card>
            <div className="divide-y divide-border-subtle">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="mt-1.5 h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
