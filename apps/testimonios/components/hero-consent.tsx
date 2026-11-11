"use client";

import { Button } from "@repo/ui/button";
import { formHtmlLang, type FormLocale } from "@/lib/form-i18n/locales";
import { getFormMessages } from "@/lib/form-i18n/messages";

type HeroConsentProps = {
  locale: FormLocale;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onStart: () => void;
  error?: string;
};

/** Controlled affirmation shared with the final submission, never persisted in a cookie. */
export function HeroConsent({ locale, accepted, onAcceptedChange, onStart, error }: HeroConsentProps) {
  const copy = getFormMessages(locale).form.consent;
  return (
    <div id="hero-consent" lang={formHtmlLang(locale)} className="mt-md flex max-w-[36rem] min-w-0 flex-col items-start gap-sm">
      <label htmlFor="hero-consent-checkbox" className="flex min-h-11 min-w-0 cursor-pointer items-start gap-xs text-body-small leading-relaxed text-text-secondary">
        <input id="hero-consent-checkbox" type="checkbox"
          checked={accepted} required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "hero-consent-error" : undefined}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          className="mt-1 size-5 shrink-0 rounded-sm border-border accent-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan" />
        <span>{copy.body}</span>
      </label>
      {error ? <p id="hero-consent-error" role="alert" className="text-body-small text-destructive">{error}</p> : null}
      <Button type="button" variant="gradient" size="lg" disabled={!accepted}
        onClick={onStart}
        className="h-auto min-h-12 max-w-full px-[min(var(--spacing-md),24px)] py-xs text-base whitespace-normal focus-visible:border-transparent motion-reduce:transition-none">
        {copy.action}
      </Button>
    </div>
  );
}
