import Link from "next/link";
import { formatShortDate } from "@shared/lib/formatDate";
import { Cell, DataTable } from "@shared/ui/patterns/DataTable";
import { SimulationStatusBadge } from "./SimulationStatusBadge";
import type { Simulation } from "../types/simulation";

export function SimulationsTable({ simulations }: { simulations: Simulation[] }) {
  return (
    <DataTable
      caption="Simulaciones"
      columns={["Nombre", "Estado", "Tipo", "Fechas", "Talentos", "Equipos"]}
      isEmpty={simulations.length === 0}
      emptyMessage="Ninguna simulación coincide con el filtro."
    >
      {simulations.map((simulation) => (
        <tr key={simulation.id} className="hover:bg-muted/50">
          <Cell>
            {/* Navegación con <Link> real, nunca onClick en el <tr>. */}
            <Link href={`/simulations/${simulation.id}`} className="font-medium hover:underline">
              {simulation.name}
            </Link>
            <span className="block text-admin-caption text-muted-foreground">{simulation.code}</span>
          </Cell>
          <Cell>
            <SimulationStatusBadge status={simulation.status} />
          </Cell>
          <Cell className="text-muted-foreground">
            {simulation.type === "OPEN" ? "Abierta" : "Cerrada"}
            {simulation.isPremium && " · Premium"}
          </Cell>
          <Cell className="text-muted-foreground">
            {formatShortDate(simulation.startDate)} – {formatShortDate(simulation.endDate)}
          </Cell>
          <Cell className="tabular-nums">{simulation.talentsCount}</Cell>
          <Cell className="tabular-nums">{simulation.teamsCount}</Cell>
        </tr>
      ))}
    </DataTable>
  );
}
