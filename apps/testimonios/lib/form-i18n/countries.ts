import { COUNTRY_OPTIONS } from "../testimonials/countries";
import { getFormMessages } from "./messages";
import type { FormCountryKey } from "./types";

/** Maps existing submitted values to semantic presentation keys; never localizes values. */
export const FORM_COUNTRY_KEYS = {
  "Argentina": "argentina",
  "Bolivia": "bolivia",
  "Brasil": "brasil",
  "Chile": "chile",
  "Colombia": "colombia",
  "Costa Rica": "costa_rica",
  "Ecuador": "ecuador",
  "El Salvador": "el_salvador",
  "España": "espana",
  "Guatemala": "guatemala",
  "Honduras": "honduras",
  "México": "mexico",
  "Nicaragua": "nicaragua",
  "Panamá": "panama",
  "Paraguay": "paraguay",
  "Perú": "peru",
  "República Dominicana": "republica_dominicana",
  "Uruguay": "uruguay",
  "Venezuela": "venezuela",
} as const satisfies Readonly<Record<(typeof COUNTRY_OPTIONS)[number], FormCountryKey>>;

export function getFormCountryOptions(locale: unknown) {
  const labels = getFormMessages(locale).form.countries;
  return COUNTRY_OPTIONS.map(value => ({
    value,
    label: labels[FORM_COUNTRY_KEYS[value]],
  }));
}
