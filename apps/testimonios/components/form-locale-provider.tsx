"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { buildFormHref, normalizeFormLocale, resolveFormLocale, type FormLocale } from "@/lib/form-i18n/locales";
import { createFormTranslator } from "@/lib/form-i18n/messages";
import type { FormTranslator } from "@/lib/form-i18n/format";
import { getFormMetadata } from "@/lib/form-i18n/metadata";

type FormLocaleContextValue = {
  locale: FormLocale;
  t: FormTranslator;
  setLocale: (locale: FormLocale) => void;
  selectorHost: HTMLElement | null;
  setSelectorHost: (host: HTMLElement | null) => void;
};

const FormLocaleContext = createContext<FormLocaleContextValue | null>(null);

/** Form-only, wrapper-free context. URL is the source of truth; wizard state stays in its owners. */
export function FormLocaleProvider({ initialLocale, children }: { initialLocale: FormLocale; children: ReactNode }) {
  const searchParams = useSearchParams();
  const locale = searchParams ? resolveFormLocale(searchParams) : initialLocale;
  const [selectorHost, setSelectorHost] = useState<HTMLElement | null>(null);
  const setLocale = useCallback((next: FormLocale) => {
    const href = buildFormHref(normalizeFormLocale(next), { search: window.location.search, hash: window.location.hash });
    // Next's native History API integration updates useSearchParams without an RSC navigation.
    window.history.replaceState(null, "", href);
  }, []);

  useEffect(() => {
    const metadata = getFormMetadata(locale);
    document.title = metadata.title;
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="description"]')) {
      meta.content = metadata.description;
    }
  }, [locale]);

  const value = useMemo(() => ({
    locale, t: createFormTranslator(locale), setLocale, selectorHost, setSelectorHost,
  }), [locale, setLocale, selectorHost]);

  return <FormLocaleContext.Provider value={value}>{children}</FormLocaleContext.Provider>;
}

export function useFormLocale() {
  const value = useContext(FormLocaleContext);
  if (!value) throw new Error("Form locale consumer requires FormLocaleProvider");
  return value;
}
