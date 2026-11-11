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

/** Lista de navegación compartida por el sidebar y el drawer mobile. */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
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
                onClick={onNavigate}
                className={cn(
                  "flex h-10 items-center gap-2 rounded px-2 text-admin-body transition-colors md:h-8",
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
  );
}
