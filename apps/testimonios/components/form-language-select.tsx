"use client";

import { useId } from "react";
import { createPortal } from "react-dom";
import { normalizeFormLocale } from "@/lib/form-i18n/locales";
import { useFormLocale } from "./form-locale-provider";

/** One native selector, temporarily portaled into an open crop dialog to remain operable. */
export function FormLanguageSelect() {
  const { locale, t, setLocale, selectorHost } = useFormLocale();
  const id = useId();
  const field = (
    <div className="mb-sm flex min-w-0 justify-end" lang={locale}>
      <label htmlFor={id} className="flex min-w-0 flex-wrap items-center justify-end gap-xs text-body-small text-text-secondary">
        <span>{t("form.language.label")}</span>
        <select
          id={id}
          data-form-language-select=""
          value={locale}
          onChange={event => setLocale(normalizeFormLocale(event.target.value))}
          className="min-h-11 max-w-full rounded-md border border-border bg-bg-base px-sm text-body text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
        >
          <option value="es" lang="es">{t("form.language.es")}</option>
          <option value="pt-BR" lang="pt-BR">{t("form.language.ptBR")}</option>
        </select>
      </label>
    </div>
  );
  return selectorHost ? createPortal(field, selectorHost) : field;
}
