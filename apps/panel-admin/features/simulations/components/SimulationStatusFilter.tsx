import Link from "next/link";
import { cn } from "@repo/ui/utils";
import type { SimulationStatus } from "../types/simulation";

const FILTERS: { value?: SimulationStatus; label: string }[] = [
  { label: "Todas" },
  { value: "ACTIVE", label: "En curso" },
  { value: "INSCRIPTION", label: "Inscripción" },
  { value: "CLOSED", label: "Cerradas" },
];

/**
 * El filtro vive en la URL (`?status=`): refresh, back/forward y deep-link funcionan
 * sin estado de cliente. Por eso son <Link>s y no botones con useState.
 */
export function SimulationStatusFilter({ current }: { current?: SimulationStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = filter.value === current;
        return (
          <Link
            key={filter.label}
            href={filter.value ? `/simulations?status=${filter.value}` : "/simulations"}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1 text-admin-caption transition-colors",
              active
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
