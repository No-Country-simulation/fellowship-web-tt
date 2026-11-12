"use client";

import { Suspense, use } from "react";
import { HeroConsent } from "@/components/hero-consent";
import type { FormLocale } from "@/lib/form-i18n/locales";
import { getFormMessages } from "@/lib/form-i18n/messages";

import { GalleryHeroCarousel } from "@/components/gallery-hero-carousel";
import type { HeroStoriesSource } from "@/components/gallery-hero-data";
import { cn } from "@/lib/utils";

import styles from "./gallery-hero.module.css";
import layout from "./form-layout.module.css";

type GalleryHeroProps = {
  stories: HeroStoriesSource;
  locale: FormLocale;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onStart: () => void;
  error?: string;
};

/** Introductory view; published stories still come from the server, consent from the flow. */
export function GalleryHero({ stories, locale, ...consent }: GalleryHeroProps) {
  const copy = getFormMessages(locale).form.hero;
  return (
    <section
      aria-labelledby="gallery-title"
      className={cn(styles.hero, layout.gutter, "@container border-b border-border-subtle py-xl 2xl:py-3xl")}>
      <div aria-hidden="true" className={styles.backdrop}>
        <svg
          className={styles.art}
          viewBox="0 0 1440 550"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false">
          <defs>
            <radialGradient id="gallery-hero-purple-wash">
              <stop offset="0" stopColor="var(--brand-pink)" stopOpacity=".25" />
              <stop offset=".32" stopColor="var(--hero-violet)" stopOpacity=".18" />
              <stop offset=".7" stopColor="var(--accent-indigo)" stopOpacity=".07" />
              <stop offset="1" stopColor="var(--accent-indigo)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gallery-hero-pink-bottom">
              <stop offset="0" stopColor="var(--brand-pink)" stopOpacity=".33" />
              <stop offset=".42" stopColor="var(--hero-violet)" stopOpacity=".21" />
              <stop offset="1" stopColor="var(--accent-indigo)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gallery-hero-blue-wash">
              <stop offset="0" stopColor="var(--hero-blue)" stopOpacity=".37" />
              <stop offset=".45" stopColor="var(--hero-deep-blue)" stopOpacity=".17" />
              <stop offset="1" stopColor="var(--hero-deep-blue)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gallery-hero-cyan-corner">
              <stop offset="0" stopColor="var(--hero-blue)" stopOpacity=".58" />
              <stop offset=".6" stopColor="var(--hero-corner-blue)" stopOpacity=".31" />
              <stop offset="1" stopColor="var(--accent-indigo)" stopOpacity=".02" />
            </radialGradient>
            <linearGradient
              id="gallery-hero-line-sweep"
              x1="0"
              y1="0"
              x2="1"
              y2=".7"
              gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="var(--brand-pink)" stopOpacity=".18" />
              <stop offset=".45" stopColor="var(--hero-violet)" stopOpacity=".61" />
              <stop offset="1" stopColor="var(--brand-cyan)" stopOpacity=".52" />
            </linearGradient>
            <linearGradient
              id="gallery-hero-line-cyan"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
              gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="var(--hero-violet)" stopOpacity=".47" />
              <stop offset=".45" stopColor="var(--hero-blue)" stopOpacity=".38" />
              <stop offset="1" stopColor="var(--brand-cyan)" stopOpacity=".65" />
            </linearGradient>
            <filter id="gallery-hero-blur-soft" x="-15%" y="-45%" width="130%" height="190%">
              <feGaussianBlur stdDeviation="26" />
            </filter>
          </defs>
          <ellipse
            cx="450"
            cy="420"
            rx="490"
            ry="225"
            transform="rotate(18 450 420)"
            fill="url(#gallery-hero-purple-wash)"
          />
          <ellipse
            cx="780"
            cy="600"
            rx="410"
            ry="215"
            transform="rotate(17 780 600)"
            fill="url(#gallery-hero-pink-bottom)"
          />
          <ellipse cx="1270" cy="295" rx="515" ry="370" fill="url(#gallery-hero-blue-wash)" />
          <ellipse cx="1330" cy="-58" rx="340" ry="185" fill="url(#gallery-hero-cyan-corner)" />
          <ellipse
            cx="680"
            cy="335"
            rx="360"
            ry="105"
            transform="rotate(20 680 335)"
            fill="url(#gallery-hero-purple-wash)"
            filter="url(#gallery-hero-blur-soft)"
            opacity=".65"
          />
          <path
            d="M 466 568 C 545 415 692 395 825 490 S 1106 665 1449 390"
            fill="none"
            stroke="url(#gallery-hero-line-sweep)"
            strokeWidth="1.4"
            opacity=".78"
          />
          <path
            d="M 1455 178 C 1345 316 1335 391 1119 513 S 891 620 797 551"
            fill="none"
            stroke="url(#gallery-hero-line-cyan)"
            strokeWidth="1.2"
            opacity=".62"
          />
        </svg>
        <span className={cn(styles.points, styles.pointsTop)} />
        <span className={cn(styles.points, styles.pointsBottom)} />
      </div>
      <div
        className={cn(
          layout.container, "grid gap-lg",
          stories && (!Array.isArray(stories) || stories.length > 0) && styles.withStories,
        )}>
        <div className="min-w-0 wrap-anywhere">
          <p className="type-eyebrow flex items-center gap-xs text-text-secondary">
            <span
              aria-hidden="true"
              className="h-0.5 w-7 shrink-0 rounded-full bg-brand-gradient"
            />
            {copy.eyebrow}
          </p>
          <h1
            id="gallery-title"
            tabIndex={-1}
            className="mt-md text-[2.125rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl">
            {copy.title}{" "}
            <span className="text-brand-gradient inline-block">{copy.highlight}</span>
          </h1>
          <p className="mt-md max-w-[36rem] text-base leading-relaxed text-text-secondary sm:text-lg">
            {copy.description}
          </p>
          <HeroConsent locale={locale} {...consent} />
        </div>
        <div className={styles.storiesSlot}>
          <Suspense fallback={<div className={styles.storiesPending} data-hero-pending>
            <div className={styles.pendingFrame} role="status">{copy.loadingStories}</div>
          </div>}>
            <HeroStoriesContent stories={stories} locale={locale} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

function HeroStoriesContent({ stories, locale }: { stories: HeroStoriesSource; locale: FormLocale }) {
  const resolved = stories && "then" in stories ? use(stories) : stories;
  const copy = getFormMessages(locale).form.hero;
  if (resolved === null) return <p role="status" className="text-sm leading-relaxed text-text-secondary">{copy.unavailable}</p>;
  if (!resolved.length) return <p className="text-sm leading-relaxed text-text-secondary">{copy.empty}</p>;
  return <GalleryHeroCarousel stories={resolved} locale={locale} />;
}
