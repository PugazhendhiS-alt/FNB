export function MetricsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex-shrink-0 w-56 animate-pulse">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function WidgetSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => {
        const isSmall = i < 4;
        return (
          <div key={i} className={`animate-pulse ${isSmall ? 'col-span-1' : 'col-span-1 sm:col-span-2 lg:col-span-2'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
              <div className="h-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className={isSmall ? 'p-3' : 'p-3 sm:p-4'}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <MetricsSkeleton />
      <WidgetSkeleton count={4} />
    </div>
  );
}
