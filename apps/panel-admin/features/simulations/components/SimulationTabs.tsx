"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/utils";

/**
 * Sub-navegación del detalle de una simulación. En el panel real hay muchas más
 * pestañas (inscripciones, eventos, verticales, Discord, Demo Day, completitud…);
 * cada una es una carpeta en `app/(panel)/simulations/[id]/`.
 */
export function SimulationTabs({ simulationId }: { simulationId: string }) {
  const pathname = usePathname();
  const base = `/simulations/${simulationId}`;
  const tabs = [
    { href: base, label: "Resumen" },
    { href: `${base}/teams`, label: "Equipos" },
  ];

  return (
    <nav aria-label="Secciones de la simulación" className="flex gap-1 border-b border-border">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-admin-body",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
