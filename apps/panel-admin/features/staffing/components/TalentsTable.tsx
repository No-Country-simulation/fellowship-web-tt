import { Cell, DataTable } from "@shared/ui/patterns/DataTable";
import type { Talent } from "../types/talent";

export function TalentsTable({ talents }: { talents: Talent[] }) {
  return (
    <DataTable
      caption="Talentos disponibles"
      columns={["Talento", "Rol", "Seniority", "País", "Simulaciones"]}
      isEmpty={talents.length === 0}
    >
      {talents.map((talent) => (
        <tr key={talent.id}>
          <Cell className="font-medium">{talent.fullName}</Cell>
          <Cell className="text-muted-foreground">{talent.role}</Cell>
          <Cell className="text-muted-foreground">{talent.seniority}</Cell>
          <Cell className="text-muted-foreground">{talent.country}</Cell>
          <Cell className="tabular-nums">{talent.simulationsCompleted}</Cell>
        </tr>
      ))}
    </DataTable>
  );
}
