"use client";

import { useState } from "react";
import Image from "next/image";

import { getFormMessages } from "@/lib/form-i18n/messages";
import type { FormLocale } from "@/lib/form-i18n/locales";
import type { TestimonialType } from "@/lib/testimonials/types";
import { stripWrappingQuotes } from "@/lib/testimonials/quote";

import styles from "./hero-testimonial-card.module.css";

export type HeroTestimonialCardContent = {
  type: TestimonialType;
  quote: string;
  story: string;
  fullName: string;
  country: string | null;
  imageUrl: string | null;
  role: string | null;
  company: string | null;
  previousRole: string | null;
};

/** Optimized artwork and one text equivalent, revealed in-place on failure, text enlargement or keyboard focus. */
export function HeroTestimonialCard({ story, locale, requested }: {
  story: HeroTestimonialCardContent;
  locale: FormLocale;
  requested: boolean;
}) {
  const messages = getFormMessages(locale).form;
  const copy = messages.hero;
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
  const textFallback = !story.imageUrl || status === "failed";

  return (
    <div className={styles.frame} data-hero-artwork data-text-fallback={textFallback || undefined}>
      <p className={styles.placeholder} hidden={status === "loaded" || textFallback} aria-hidden="true" data-hero-placeholder>
        {copy.imageLoading}
      </p>
      {requested && story.imageUrl && status !== "failed" ? (
        <Image
          src={story.imageUrl}
          alt=""
          aria-hidden="true"
          width={1080}
          height={1350}
          quality={85}
          sizes="(max-width: 387px) calc(100vw - 48px), 340px"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          data-loaded={status === "loaded"}
          data-publication-content
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
        />
      ) : null}
      <div
        role="region"
        aria-label={copy.readText}
        tabIndex={0}
        className={styles.textAlternative}
        data-hero-transcript
        data-publication-content
      >
        {textFallback ? <p className="text-sm text-text-secondary">{copy.imageUnavailable}</p> : null}
        <p className="font-semibold">{story.fullName}</p>
        <p className="text-sm text-text-secondary">
          {messages.categories[story.type].label}{story.country ? ` · ${story.country}` : ""}
        </p>
        <blockquote className="whitespace-pre-wrap">{story.story || stripWrappingQuotes(story.quote)}</blockquote>
        <dl className="space-y-xs text-sm">
          {story.previousRole ? <div><dt className="text-text-secondary">{messages.fields.previous_profession.label}</dt><dd>{story.previousRole}</dd></div> : null}
          {story.role ? <div><dt className="text-text-secondary">{story.type === "simulation" ? messages.fields.primary_role.label : story.type === "first_job" ? messages.fields.role_achieved.label : messages.fields.new_role.label}</dt><dd>{story.role}</dd></div> : null}
          {story.company ? <div><dt className="text-text-secondary">{messages.fields.company.label}</dt><dd>{story.company}</dd></div> : null}
        </dl>
      </div>
    </div>
  );
}
