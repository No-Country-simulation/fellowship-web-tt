"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, FolderKanban, Gauge, Layers, MessageSquareQuote, Users } from "lucide-react";
import { cn } from "@repo/ui/utils";
import { NAV_ITEMS, type NavIcon } from "@core/config/navigation";

const ICONS: Record<NavIcon, typeof Gauge> = {
  gauge: Gauge,
  layers: Layers,
  clipboard: ClipboardCheck,
  folder: FolderKanban,
  users: Users,
  quote: MessageSquareQuote,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <span className="text-sm font-bold">NoCountry</span>
        <span className="rounded border border-border px-1.5 py-0.5 text-admin-micro uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </div>

      <nav aria-label="Principal" className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded px-2 text-admin-body transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="border-t border-border px-4 py-3 text-admin-caption text-muted-foreground">
        Datos de ejemplo · sin back
      </p>
    </aside>
  );
}
