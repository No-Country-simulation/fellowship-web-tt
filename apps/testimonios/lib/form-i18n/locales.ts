export const FORM_LOCALES = ["es", "en", "pt"] as const;
export type FormLocale = (typeof FORM_LOCALES)[number];
export const DEFAULT_FORM_LOCALE: FormLocale = "es";
/** Scoped to the submission form; never reuse Talent's NEXT_LOCALE cookie. */
export const FORM_LOCALE_COOKIE = "testimonios_locale";

type FormSearchParams =
  | Pick<URLSearchParams, "getAll">
  | Readonly<Record<string, string | readonly string[] | undefined>>;

export function isFormLocale(value: unknown): value is FormLocale {
  return value === "es" || value === "en" || value === "pt";
}

/** Accept canonical ES/EN/PT codes, plus the exact legacy pt-BR link alias. */
export function normalizeFormLocale(value: unknown): FormLocale {
  if (value === "pt-BR") return "pt";
  return isFormLocale(value) ? value : DEFAULT_FORM_LOCALE;
}

/** HTML uses the regional subtags, while app links use Talent's short codes. */
export function formHtmlLang(locale: FormLocale): string {
  return locale === "pt" ? "pt-BR" : locale;
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

/** Explicit ?lang= links win on navigation; otherwise a saved preference applies. */
export function resolvePreferredFormLocale(
  params?: FormSearchParams | null,
  preference?: string | null,
): FormLocale {
  if (params) {
    if ("getAll" in params && typeof params.getAll === "function") {
      if (params.getAll("lang").length > 0) return resolveFormLocale(params);
    } else if ("lang" in params && Object.prototype.hasOwnProperty.call(params, "lang") && params.lang !== undefined) {
      return resolveFormLocale(params);
    }
  }
  return preference ? normalizeFormLocale(preference) : DEFAULT_FORM_LOCALE;
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

/** Invitation starts at the local hero; direct form links remain supported. */
export function buildHeroHref(locale: FormLocale): string {
  return `/?lang=${normalizeFormLocale(locale)}#hero-consent`;
}
