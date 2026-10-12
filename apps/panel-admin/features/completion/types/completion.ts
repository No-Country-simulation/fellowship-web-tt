export type CompletionResult = "COMPLETED" | "AT_RISK" | "NOT_COMPLETED";

/** Resultado de COMPLETITUD de un talento en una simulación. */
export interface CompletionRow {
  talentId: string;
  talentName: string;
  team: string;
  simulation: string;
  attendance: number;
  deliverables: number;
  result: CompletionResult;
}
