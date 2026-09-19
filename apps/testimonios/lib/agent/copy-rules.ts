/**
 * Shared anti-hallucination rules injected into understand / draft / repair.
 * Creativity may improve how the story is told — never invent facts.
 */
export const ANTI_HALLUCINATION_RULES = [
  "El testimonio original es la ÚNICA fuente de verdad.",
  "El understanding organiza; no inventa.",
  "NO agregues hechos externos.",
  "NO inventes resultados, cargos, empresas, clientes, cifras, fechas, habilidades, tecnologías, certificaciones ni empleos.",
  "NO inventes emociones que el texto no exprese.",
  "NO exageres resultados.",
  "NO conviertas expectativas en resultados (ej. 'espero conseguir trabajo' ≠ 'consiguió trabajo').",
  "NO conviertas opiniones en hechos.",
  "NO atribuyas causalidad que el testimonio no afirma (ej. 'NoCountry le dio empleo' solo si el texto lo dice).",
  "La categoría del testimonio describe el tipo de historia; NO autoriza a inventar logros.",
].join("\n- ");

export function antiHallucinationBlock(): string {
  return `Reglas anti-alucinación:\n- ${ANTI_HALLUCINATION_RULES}`;
}
