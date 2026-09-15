/** Esqueleto del pane de detalle mientras carga `/admin/[id]`. */
export function AdminDetailLoading() {
  return (
    <div
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-sm py-md"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Cargando testimonio</p>
      <div className="flex w-full min-w-0 flex-col gap-lg">
        <div className="flex flex-wrap items-center gap-sm">
          <div className="h-8 w-52 animate-pulse rounded-md bg-bg-surface-3" />
          <div className="ml-auto h-7 w-24 animate-pulse rounded-full bg-bg-surface-3" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-bg-surface-3" />
        </div>
        <div className="h-4 w-64 animate-pulse rounded-md bg-bg-surface-3" />
        <div className="h-12 animate-pulse rounded-md border border-border bg-card" />
        <div className="h-44 animate-pulse rounded-md border border-border bg-card" />
        <div className="flex flex-col gap-md">
          <div className="h-4 w-40 animate-pulse rounded-md bg-bg-surface-3" />
          <div className="flex gap-xs">
            <div className="h-8 w-24 animate-pulse rounded-button border border-border bg-card" />
            <div className="h-8 w-28 animate-pulse rounded-button border border-border bg-card" />
          </div>
          <div className="h-56 animate-pulse rounded-md border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
