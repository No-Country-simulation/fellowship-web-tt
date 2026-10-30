import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";

import { GalleryHeroCarousel } from "@/components/gallery-hero-carousel";
import type { HeroStory } from "@/components/gallery-hero-data";
import { cn } from "@/lib/utils";

import styles from "./gallery-hero.module.css";

// Captación de talento: compartir no implica publicación automática.
const HERO_COPY = {
  eyebrow: "Tu historia en No Country",
  title: "Tu experiencia merece",
  highlight: "ser compartida.",
  description:
    "Comparte tu historia con No Country, destaca tu recorrido profesional y ten la oportunidad de ganar visibilidad en nuestros canales oficiales.",
  action: "Compartir mi testimonio",
} as const;

type GalleryHeroProps = {
  stories: readonly HeroStory[] | null;
};

/** Landing de captación de servidor, con publicados seleccionados y estados vacío/error. */
export function GalleryHero({ stories }: GalleryHeroProps) {
  return (
    <section
      aria-labelledby="gallery-title"
      className={cn(styles.hero, "@container border-b border-border-subtle py-xl 2xl:py-3xl")}>
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
          "mx-auto grid w-full max-w-[70rem] gap-lg",
          stories && stories.length > 0 && styles.withStories,
        )}>
        <div className="min-w-0 wrap-anywhere">
          <p className="type-eyebrow flex items-center gap-xs text-text-secondary">
            <span
              aria-hidden="true"
              className="h-0.5 w-7 shrink-0 rounded-full bg-brand-gradient"
            />
            {HERO_COPY.eyebrow}
          </p>
          <h1
            id="gallery-title"
            className="mt-md text-[2.125rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl">
            {HERO_COPY.title}{" "}
            <span className="text-brand-gradient inline-block">{HERO_COPY.highlight}</span>
          </h1>
          <p className="mt-md max-w-[36rem] text-base leading-relaxed text-text-secondary sm:text-lg">
            {HERO_COPY.description}
          </p>
          <Link
            href="/enviar"
            className={cn(
              buttonVariants({ variant: "gradient", size: "lg" }),
              "mt-md h-auto min-h-12 max-w-full px-[min(var(--spacing-md),24px)] py-xs text-base whitespace-normal focus-visible:border-transparent motion-reduce:transition-none",
            )}>
            {HERO_COPY.action}
          </Link>
        </div>
        {stories === null ? (
          <p role="status" className="text-sm leading-relaxed text-text-secondary">
            En este momento no se pueden mostrar las historias de la comunidad.
          </p>
        ) : stories.length > 0 ? (
          <GalleryHeroCarousel stories={stories} />
        ) : (
          <p className="max-w-[36rem] text-sm leading-relaxed text-text-secondary">
            Tu historia puede inspirar a otras personas de la comunidad.
          </p>
        )}
      </div>
    </section>
  );
}
