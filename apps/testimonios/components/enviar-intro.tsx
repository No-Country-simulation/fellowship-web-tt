"use client";

import Link from "next/link";
import { useId } from "react";
import { ArrowLeft } from "lucide-react";
import { useFormLocale } from "./form-locale-provider";

/** Existing editorial composition with live form copy; removed on success as before. */
export function EnviarIntro() {
  const conversationGradientId = useId();
  const { t } = useFormLocale();
  const [beforeAsterisk, afterAsterisk] = t("form.intro.requiredHint").split("*");
  return (
    <header className="flex items-center gap-lg">
      <div className="min-w-0 flex-1">
        <Link
          href="/"
          className="mb-sm inline-flex min-h-11 items-center gap-xs rounded-sm text-sm font-medium text-text-secondary transition-colors hover:text-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan motion-reduce:transition-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
          {t("form.navigation.home")}
        </Link>
        <h1 className="type-section text-text-primary">{t("form.intro.title")}</h1>
        <p className="mt-xs max-w-[44rem] text-body leading-normal text-text-secondary md:mt-sm md:text-body-large md:leading-relaxed">
          {t("form.intro.description")}
        </p>
        <p className="mt-xs text-body-small text-text-secondary md:mt-sm">
          {beforeAsterisk}<span aria-hidden="true">*</span><span className="sr-only">{t("form.common.asterisk")}</span>{afterAsterisk}
        </p>
      </div>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 160 160" className="hidden size-32 shrink-0 md:block">
        <defs>
          <linearGradient id={conversationGradientId} x1="10" y1="20" x2="150" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--brand-pink)" />
            <stop offset="0.5" stopColor="var(--accent-indigo)" />
            <stop offset="1" stopColor="var(--brand-cyan)" />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${conversationGradientId})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M70 86H55l-20 20V86h-7a14 14 0 0 1-14-14V28a14 14 0 0 1 14-14h60a14 14 0 0 1 14 14v34" />
          <path d="M76 64h60a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-7v20l-20-20H76a14 14 0 0 1-14-14V78a14 14 0 0 1 14-14Z" />
          <path d="M34 36h47M34 51h30M82 86h47M82 101h47M82 116h24" />
        </g>
      </svg>
    </header>
  );
}
