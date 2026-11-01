export const FORM_LOCALES = ["es", "pt-BR"] as const;
export type FormLocale = (typeof FORM_LOCALES)[number];
export const DEFAULT_FORM_LOCALE: FormLocale = "es";

type FormSearchParams =
  | Pick<URLSearchParams, "getAll">
  | Readonly<Record<string, string | readonly string[] | undefined>>;

export function isFormLocale(value: unknown): value is FormLocale {
  return value === "es" || value === "pt-BR";
}

/** Strict protocol: no aliases, case folding, trimming or participant-data inference. */
export function normalizeFormLocale(value: unknown): FormLocale {
  return isFormLocale(value) ? value : DEFAULT_FORM_LOCALE;
}

/** Accepts page searchParams or the read-only client searchParams interface. */
export function resolveFormLocale(params?: FormSearchParams | null): FormLocale {
  if (!params) return DEFAULT_FORM_LOCALE;

  if ("getAll" in params && typeof params.getAll === "function") {
    const values = params.getAll("lang");
    return values.length === 1
      ? normalizeFormLocale(values[0])
      : DEFAULT_FORM_LOCALE;
  }

  return normalizeFormLocale(
    "lang" in params && Object.prototype.hasOwnProperty.call(params, "lang")
      ? params.lang
      : undefined,
  );
}

/** Builds a relative link only; never reads or mutates browser navigation. */
export function buildFormHref(
  locale: FormLocale,
  options: { readonly search?: string; readonly hash?: string } = {},
): string {
  const params = new URLSearchParams(options.search);
  params.set("lang", normalizeFormLocale(locale));

  // URL is used only for encoding; this placeholder origin is never returned or fetched.
  const url = new URL("/enviar", "https://form.invalid");
  url.search = params.toString();
  url.hash = options.hash ?? "";
  return `${url.pathname}${url.search}${url.hash}`;
}
