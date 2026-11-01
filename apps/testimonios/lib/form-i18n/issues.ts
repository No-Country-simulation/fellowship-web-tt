import type { ResolvedFormErrors } from "../testimonials/form-validation";
import type { FieldErrors, FormField } from "../testimonials/parse";
import { interpolateFormMessage } from "./format";
import { DEFAULT_FORM_LOCALE } from "./locales";
import { getFormMessage, getFormMessages } from "./messages";
import type { FormMessageKey } from "./types";

/** Presentation boundary: tolerate unknown/malformed wire errors, never display their details. */
export function formatFormIssue(issue: unknown, locale: unknown = DEFAULT_FORM_LOCALE): string {
  const messages = getFormMessages(locale);
  const fallback = messages.form.errors.submit.unexpected;
  try {
    if (typeof issue !== "object" || issue === null || !("code" in issue) || typeof issue.code !== "string") {
      return fallback;
    }
    const key = `form.errors.${issue.code}` as FormMessageKey;
    const params = "params" in issue && typeof issue.params === "object" && issue.params !== null
      ? issue.params as Readonly<Record<string, string | number>>
      : undefined;
    return interpolateFormMessage(key, getFormMessage(messages, key), params);
  } catch {
    // Invalid/missing parameters or unexpected wire shapes never expose a technical exception.
    return fallback;
  }
}

function formatFieldErrors(errors: FieldErrors, locale: unknown): Partial<Record<FormField, string>> {
  return Object.fromEntries(Object.entries(errors).map(([field, issue]) => [
    field, issue ? formatFormIssue(issue, locale) : undefined,
  ]));
}

/** Always call AFTER resolveFormErrors; this projection never replaces useActionState's response. */
export function presentFormErrors(errors: ResolvedFormErrors, locale: unknown = DEFAULT_FORM_LOCALE) {
  return {
    fieldErrors: formatFieldErrors(errors.fieldErrors, locale),
    serverErrors: formatFieldErrors(errors.serverErrors, locale),
    unknownErrors: errors.unknownErrors.map(([field, issue]): [string, string] => [field, formatFormIssue(issue, locale)]),
    message: errors.issue ? formatFormIssue(errors.issue, locale) : undefined,
  };
}
