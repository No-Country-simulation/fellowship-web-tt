import type { FormMessageParameters } from "../form-i18n/format";
import type { FormMessageKey } from "../form-i18n/types";

type ErrorMessageKey = Extract<FormMessageKey, `form.errors.${string}`>;

/** Locale-independent wire contract. Field association lives in the FieldErrors map. */
export type FormIssue = {
  [K in ErrorMessageKey]: {
    readonly code: K extends `form.errors.${infer Code}` ? Code : never;
  } & (K extends keyof FormMessageParameters
    ? { readonly params: FormMessageParameters[K] }
    : { readonly params?: never });
}[ErrorMessageKey];

export type FormIssueCode = FormIssue["code"];
type IssueFor<C extends FormIssueCode> = Extract<FormIssue, { code: C }>;
type IssueArguments<C extends FormIssueCode> =
  IssueFor<C> extends { readonly params: infer P } ? [params: P] : [];

/** Producers use codes/parameters only; no catalog is loaded or locale selected here. */
export function formIssue<C extends FormIssueCode>(
  code: C,
  ...args: IssueArguments<C>
): IssueFor<C> {
  return { code, ...(args[0] ? { params: args[0] } : {}) } as IssueFor<C>;
}
