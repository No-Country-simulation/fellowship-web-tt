"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { buildFormHref, formHtmlLang, type FormLocale } from "@/lib/form-i18n/locales";
import { getFormMessages } from "@/lib/form-i18n/messages";

/** Navigation gate only; the checkbox state is local and starts unchecked. */
export function HeroConsent({ locale }: { locale: FormLocale }) {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const copy = getFormMessages(locale).form.consent;
  return (
    <div id="hero-consent" lang={formHtmlLang(locale)} className="mt-md flex max-w-[36rem] min-w-0 flex-col items-start gap-sm">
      <label htmlFor="hero-consent-checkbox" className="flex min-h-11 min-w-0 cursor-pointer items-start gap-xs text-body-small leading-relaxed text-text-secondary">
        <input id="hero-consent-checkbox" type="checkbox"
          checked={accepted} required
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 size-5 shrink-0 rounded-sm border-border accent-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan" />
        <span>{copy.body}</span>
      </label>
      <Button type="button" variant="gradient" size="lg" disabled={!accepted}
        onClick={() => router.push(buildFormHref(locale))}
        className="h-auto min-h-12 max-w-full px-[min(var(--spacing-md),24px)] py-xs text-base whitespace-normal focus-visible:border-transparent motion-reduce:transition-none">
        {copy.action}
      </Button>
    </div>
  );
}
