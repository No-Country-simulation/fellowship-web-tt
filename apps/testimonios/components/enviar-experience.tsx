"use client";

import { formHtmlLang } from "@/lib/form-i18n/locales";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { focusAndReveal } from "@/lib/form-focus";
import type { HeroStoriesSource } from "./gallery-hero-data";
import { GalleryHero } from "./gallery-hero";

import { EnviarForm } from "./enviar-form";
import { EnviarIntro } from "./enviar-intro";
import { useFormLocale } from "./form-locale-provider";
import layout from "./form-layout.module.css";

/** One in-memory flow under FormHeader; hiding preserves the five-step form and files. */
export function EnviarExperience({ stories }: { stories: HeroStoriesSource }) {
  const { locale, t } = useFormLocale();
  const [started, setStarted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const focusRequest = useRef<"form" | "hero" | "consent" | null>(null);

  useLayoutEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    const selector = request === "form" ? "[data-form-step-heading]"
      : request === "consent" ? "#hero-consent-checkbox" : "#gallery-title";
    focusAndReveal(rootRef.current?.querySelector<HTMLElement>(selector) ?? null);
  }, [started, consentError]);

  const returnToHero = useCallback(() => {
    focusRequest.current = "hero";
    setStarted(false);
  }, []);
  const requireConsent = useCallback(() => {
    focusRequest.current = "consent";
    setAccepted(false);
    setConsentError(true);
    setStarted(false);
  }, []);

  return (
    <main ref={rootRef} lang={formHtmlLang(locale)} className="flex min-w-0 flex-1 flex-col wrap-anywhere">
      {!started ? (
        <GalleryHero stories={stories} locale={locale} accepted={accepted}
          onAcceptedChange={(value) => { setAccepted(value); setConsentError(false); }}
          onStart={() => {
            if (!accepted) return;
            focusRequest.current = "form";
            setStarted(true);
          }}
          error={consentError ? t("form.errors.consent.required") : undefined} />
      ) : null}
      <div hidden={!started} inert={!started} className={`${layout.gutter} py-md md:py-lg`}>
        <div className={layout.container}>
          <EnviarForm consent={accepted} onReturnToHero={returnToHero} onConsentRequired={requireConsent}>
            <EnviarIntro />
          </EnviarForm>
        </div>
      </div>
    </main>
  );
}
