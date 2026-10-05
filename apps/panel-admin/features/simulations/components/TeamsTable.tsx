import { Cell, DataTable } from "@shared/ui/patterns/DataTable";
import type { SimTeam } from "../types/simulation";

export function TeamsTable({ teams }: { teams: SimTeam[] }) {
  return (
    <DataTable
      caption="Equipos de la simulación"
      columns={["Equipo", "Vertical", "Proyecto", "Integrantes", "Avance"]}
      isEmpty={teams.length === 0}
      emptyMessage="Esta simulación todavía no tiene equipos armados."
    >
      {teams.map((team) => (
        <tr key={team.id}>
          <Cell className="font-medium">{team.name}</Cell>
          <Cell className="text-muted-foreground">{team.vertical}</Cell>
          <Cell className="text-muted-foreground">{team.project ?? "Sin asignar"}</Cell>
          <Cell className="tabular-nums">{team.members}</Cell>
          <Cell>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-24 rounded-full bg-muted">
                <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${team.progress}%` }} />
              </span>
              <span className="text-admin-caption tabular-nums text-muted-foreground">{team.progress}%</span>
            </div>
          </Cell>
        </tr>
      ))}
    </DataTable>
  );
}
