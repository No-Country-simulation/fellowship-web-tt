"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { FormLanguageSelect } from "./form-language-select";
import { useFormLocale } from "./form-locale-provider";
import styles from "./form-header.module.css";

/** Form-only sticky brand and unique selector; the logo deliberately has no link. */
export function FormHeader() {
  const { locale } = useFormLocale();
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => {
      observer.disconnect();
      root.style.removeProperty("--site-header-height");
    };
  }, []);

  return (
    <header ref={headerRef} data-form-header="" lang={locale} className={styles.header}>
      <div className={styles.row}>
        <Image src="/brand/logo-no-country.png" alt="No Country" width={1229} height={207}
          sizes="(min-width: 768px) 143px, 96px" loading="eager" className={styles.logo} />
        <FormLanguageSelect />
      </div>
    </header>
  );
}
