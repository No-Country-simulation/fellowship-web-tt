export function DetailLoading() {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-5 py-5"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Cargando testimonio</p>
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-52 animate-pulse rounded bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        <div className="h-12 animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-44 animate-pulse rounded-lg border border-border bg-card" />
        <div className="flex flex-col gap-3">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg border border-border bg-card" />
            <div className="h-8 w-28 animate-pulse rounded-lg border border-border bg-card" />
          </div>
          <div className="h-56 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
