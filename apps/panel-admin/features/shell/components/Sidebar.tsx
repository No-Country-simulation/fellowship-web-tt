import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <span className="text-sm font-bold">NoCountry</span>
        <span className="rounded border border-border px-1.5 py-0.5 text-admin-micro uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </div>

      <NavLinks />

      <p className="border-t border-border px-4 py-3 text-admin-caption text-muted-foreground">
        Datos de ejemplo · sin back
      </p>
    </aside>
  );
}
