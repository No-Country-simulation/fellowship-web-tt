import { Cell, DataTable } from "@shared/ui/patterns/DataTable";
import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";
import type { CompletionResult, CompletionRow } from "../types/completion";

const RESULT: Record<CompletionResult, { label: string; tone: VisualTone }> = {
  COMPLETED: { label: "Completó", tone: "success" },
  AT_RISK: { label: "En riesgo", tone: "warning" },
  NOT_COMPLETED: { label: "No completó", tone: "destructive" },
};

export function CompletionTable({ rows }: { rows: CompletionRow[] }) {
  return (
    <DataTable
      caption="Completitud por talento"
      columns={["Talento", "Equipo", "Simulación", "Asistencia", "Entregables", "Resultado"]}
      isEmpty={rows.length === 0}
    >
      {rows.map((row) => (
        <tr key={row.talentId}>
          <Cell className="font-medium">{row.talentName}</Cell>
          <Cell className="text-muted-foreground">{row.team}</Cell>
          <Cell className="text-muted-foreground">{row.simulation}</Cell>
          <Cell className="tabular-nums">{row.attendance}%</Cell>
          <Cell className="tabular-nums">{row.deliverables}%</Cell>
          <Cell>
            <StatusBadge tone={RESULT[row.result].tone}>{RESULT[row.result].label}</StatusBadge>
          </Cell>
        </tr>
      ))}
    </DataTable>
  );
}
