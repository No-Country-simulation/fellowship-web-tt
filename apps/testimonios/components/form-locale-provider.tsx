"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  FORM_LOCALE_COOKIE, formHtmlLang, normalizeFormLocale, resolvePreferredFormLocale,
  type FormLocale,
} from "@/lib/form-i18n/locales";
import { createFormTranslator } from "@/lib/form-i18n/messages";
import type { FormTranslator } from "@/lib/form-i18n/format";
import { getFormMetadata } from "@/lib/form-i18n/metadata";

type FormLocaleContextValue = {
  locale: FormLocale;
  t: FormTranslator;
  setLocale: (locale: FormLocale) => void;
};

const FormLocaleContext = createContext<FormLocaleContextValue | null>(null);

function readPreference(): string | null {
  const prefix = `${FORM_LOCALE_COOKIE}=`;
  const entry = document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

function rememberLocale(locale: FormLocale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${FORM_LOCALE_COOKIE}=${locale}; Path=/enviar; Max-Age=31536000; SameSite=Lax${secure}`;
}

/** Form-only context. Selecting a language changes local state and cookie, not the URL. */
export function FormLocaleProvider({ initialLocale, children }: { initialLocale: FormLocale; children: ReactNode }) {
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const [locale, setActiveLocale] = useState(initialLocale);

  // Support explicit deep links and client History navigation without using
  // the URL as the source of truth for a manual selection.
  useEffect(() => {
    const params = new URLSearchParams(query);
    const next = resolvePreferredFormLocale(params, readPreference() ?? initialLocale);
    // Synchronize with external History/query changes; manual choices never write History.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveLocale(next);
    if (params.has("lang")) rememberLocale(next);
  }, [query, initialLocale]);

  const setLocale = useCallback((next: FormLocale) => {
    const normalized = normalizeFormLocale(next);
    setActiveLocale(normalized);
    rememberLocale(normalized);
  }, []);

  useEffect(() => {
    const metadata = getFormMetadata(locale);
    // RootLayout is shared with the ES-only public pages; scope this override to /enviar.
    document.documentElement.lang = formHtmlLang(locale);
    document.title = metadata.title;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="description"]')) {
      meta.content = metadata.description;
    }
  }, [locale]);

  useEffect(() => () => {
    document.documentElement.lang = "es";
  }, []);

  const value = useMemo(() => ({
    locale, t: createFormTranslator(locale), setLocale,
  }), [locale, setLocale]);

  return <FormLocaleContext.Provider value={value}>{children}</FormLocaleContext.Provider>;
}

export function useFormLocale() {
  const value = useContext(FormLocaleContext);
  if (!value) throw new Error("Form locale consumer requires FormLocaleProvider");
  return value;
}
