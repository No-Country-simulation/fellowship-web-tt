import { MobileNav } from "./MobileNav";

export function Topbar({ userLabel }: { userLabel: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6">
      <MobileNav />

      <div className="hidden items-center gap-2 md:flex">
        <span className="text-admin-micro uppercase tracking-widest text-muted-foreground">NoCountry Admin</span>
        <span className="text-border">/</span>
        <span className="text-admin-body">Panel de gestión</span>
      </div>

      <span className="ml-auto min-w-0 truncate text-admin-body text-muted-foreground">{userLabel}</span>
    </header>
  );
}
