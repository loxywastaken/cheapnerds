export function GameDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading game">
      <div className="border-b border-line">
        <div className="container-page pb-12 pt-28 sm:pt-36">
          <div className="skeleton h-4 w-24" />
          <div className="mt-8 flex items-end gap-5">
            <div className="skeleton size-24 rounded-3xl sm:size-32" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="skeleton h-12 w-2/3 max-w-md" />
              <div className="skeleton h-5 w-1/2 max-w-sm" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-page grid gap-10 pt-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="skeleton aspect-video rounded-3xl" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-5/6" />
          <div className="skeleton h-5 w-4/6" />
        </div>
        <div className="space-y-5">
          <div className="skeleton h-48 rounded-3xl" />
          <div className="skeleton h-56 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
