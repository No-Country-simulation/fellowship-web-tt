import { DEFAULT_FORM_LOCALE, normalizeFormLocale } from "./locales";
import type { FormLocale } from "./locales";
import { interpolateFormMessage } from "./format";
import type { FormTranslator } from "./format";
import { es } from "./messages/es";
import { ptBR } from "./messages/pt-BR";
import type { FormMessageKey, FormMessages } from "./types";

const catalogs: Readonly<Record<FormLocale, FormMessages>> = { es, "pt-BR": ptBR };

/** Status is metadata, never part of the authorization shown to a participant. */
export const FORM_CONSENT_REVIEW_STATUS = {
  es: "pending-editorial-legal-review",
  "pt-BR": "pending-editorial-legal-review",
} as const satisfies Readonly<Record<FormLocale, string>>;

/** Serializable catalog with no React, Next, browser or server-only dependencies. */
export function getFormMessages(locale: unknown = DEFAULT_FORM_LOCALE): FormMessages {
  return catalogs[normalizeFormLocale(locale)];
}

function readMessage(messages: FormMessages, key: string): string | undefined {
  let value: unknown = messages;
  for (const segment of key.split(".")) {
    if (
      typeof value !== "object" ||
      value === null ||
      !Object.prototype.hasOwnProperty.call(value, segment)
    ) return undefined;
    value = (value as Record<string, unknown>)[segment];
  }
  return typeof value === "string" && value.trim() ? value : undefined;
}

/** Missing/blank known key → ES; unknown key → localized public generic error. */
export function getFormMessage(messages: FormMessages, key: FormMessageKey): string {
  return readMessage(messages, key)
    ?? readMessage(es, key)
    ?? readMessage(messages, "form.errors.submit.unexpected")
    ?? es.form.errors.submit.unexpected;
}

export function createFormTranslator(locale: unknown = DEFAULT_FORM_LOCALE): FormTranslator {
  const messages = getFormMessages(locale);
  return (key, ...args) => interpolateFormMessage(key, getFormMessage(messages, key), args[0]);
}
