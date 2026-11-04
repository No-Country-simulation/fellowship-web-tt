"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { formHtmlLang, type FormLocale } from "@/lib/form-i18n/locales";
import { useFormLocale } from "./form-locale-provider";
import styles from "./form-language-select.module.css";

const OPTIONS: readonly { code: FormLocale; short: string }[] = [
  { code: "en", short: "EN" },
  { code: "es", short: "ES" },
  { code: "pt", short: "PT" },
];

/** Compact Talent-style listbox, mounted only in the sticky form header. */
export function FormLanguageSelect() {
  const { locale, t, setLocale } = useFormLocale();
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = OPTIONS.findIndex(option => option.code === locale);
  const selectedName = locale === "en" ? t("form.language.en") : locale === "es" ? t("form.language.es") : t("form.language.ptBR");

  useEffect(() => {
    if (!open) return;
    optionRefs.current[focusIndex]?.focus({ preventScroll: true });
  }, [open, focusIndex]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  const openList = (index: number) => {
    setFocusIndex(index);
    setOpen(true);
  };

  const choose = (next: FormLocale) => {
    setOpen(false);
    setLocale(next);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList(event.key === "ArrowDown" ? selectedIndex : (selectedIndex + OPTIONS.length - 1) % OPTIONS.length);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const handleOptionKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowDown") next = (index + 1) % OPTIONS.length;
    if (event.key === "ArrowUp") next = (index + OPTIONS.length - 1) % OPTIONS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = OPTIONS.length - 1;
    if (next !== null) {
      event.preventDefault();
      setFocusIndex(next);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={styles.selector} ref={containerRef} data-form-language-select="" lang={formHtmlLang(locale)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}>
      <button type="button" ref={triggerRef} data-form-language-trigger=""
        className={styles.trigger} aria-label={`${t("form.language.label")}: ${selectedName}`}
        aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => open ? setOpen(false) : openList(selectedIndex)}
        onKeyDown={handleTriggerKey}>
        {OPTIONS[selectedIndex]?.short ?? "ES"}
      </button>
      {open && (
        <div id={id} role="listbox" aria-label={t("form.language.label")} className={styles.list}>
          {OPTIONS.map(({ code, short }, index) => (
            <button key={code} type="button" role="option" aria-selected={locale === code}
              lang={formHtmlLang(code)} aria-label={code === "en" ? t("form.language.en") : code === "es" ? t("form.language.es") : t("form.language.ptBR")}
              className={`${styles.option} ${locale === code ? styles.selected : ""}`}
              tabIndex={index === focusIndex ? 0 : -1}
              ref={node => { optionRefs.current[index] = node; }}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={event => handleOptionKey(event, index)}
              onClick={() => choose(code)}>
              {short}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
