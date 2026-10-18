export function ArticleSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="container-page max-w-4xl pt-32 sm:pt-40">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-8 h-6 w-32 rounded-full" />
      <div className="skeleton mt-5 h-12 w-4/5" />
      <div className="skeleton mt-3 h-12 w-3/5" />
      <div className="skeleton mt-10 aspect-video rounded-3xl" />
      <div className="mt-10 space-y-3">
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-11/12" />
        <div className="skeleton h-5 w-4/6" />
      </div>
    </div>
  );
}
