export function Topbar({ userLabel }: { userLabel: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-2">
        <span className="text-admin-micro uppercase tracking-widest text-muted-foreground">NoCountry Admin</span>
        <span className="text-border">/</span>
        <span className="text-admin-body">Panel de gestión</span>
      </div>

      <span className="text-admin-body text-muted-foreground">{userLabel}</span>
    </header>
  );
}
