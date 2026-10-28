/** Misma lista que el formulario público (`apps/testimonios/lib/testimonials/countries.ts`). */
export const COUNTRY_OPTIONS = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Ecuador",
  "El Salvador",
  "España",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
] as const;

export const OTHER_COUNTRY_VALUE = "__other_country__";

export function isListedCountry(value: string): boolean {
  return (COUNTRY_OPTIONS as readonly string[]).includes(value);
}
