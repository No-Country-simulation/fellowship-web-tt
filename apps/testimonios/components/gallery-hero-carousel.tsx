"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { HeroStory } from "@/components/gallery-hero-data";
import { HeroTestimonialCard } from "@/components/hero-testimonial-card";
import { cn } from "@/lib/utils";
import { getFormMessages } from "@/lib/form-i18n/messages";
import type { FormLocale } from "@/lib/form-i18n/locales";
import { stripWrappingQuotes } from "@/lib/testimonials/quote";

import styles from "./gallery-hero-carousel.module.css";

const CONTROL_CLASSES =
  "inline-flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-surface-2 text-text-primary transition-[color,border-color,background-color] duration-200 hover:border-accent-cyan hover:bg-bg-surface-3 hover:text-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan motion-reduce:transition-none";

type CarouselMotion = {
  from: number;
  direction: "next" | "previous";
};

type GalleryHeroCarouselProps = {
  stories: readonly HeroStory[];
  locale: FormLocale;
};

/** Publicados seleccionados en servidor; reinicia la navegación si cambian sus identidades u orden. */
export function GalleryHeroCarousel({ stories, locale }: GalleryHeroCarouselProps) {
  if (stories.length === 0) return null;

  return (
    <HeroStoryStack
      key={JSON.stringify(stories.map((story) => story.id))}
      stories={stories}
      locale={locale}
    />
  );
}

function HeroStoryStack({ stories, locale }: GalleryHeroCarouselProps) {
  const messages = getFormMessages(locale).form;
  const copy = messages.hero;
  const [{ activeIndex, hasNavigated, motion, requested }, setNavigation] = useState<{
    activeIndex: number;
    hasNavigated: boolean;
    motion: CarouselMotion | null;
    requested: readonly number[];
  }>({
    activeIndex: 0,
    hasNavigated: false,
    motion: null,
    requested: [0],
  });
  const stackRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const total = stories.length;
  const hasNavigation = total > 1;
  const activeStory = stories[activeIndex];

  useEffect(() => {
    if (!motion) return;

    let disposed = false;
    const animations = stackRef.current?.getAnimations({ subtree: true }) ?? [];

    // Incluye finalización, cancelación por media queries y ausencia de animaciones.
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(
      () => {
        if (disposed) return;
        setNavigation((current) =>
          current.motion === motion ? { ...current, motion: null } : current,
        );
      },
    );

    return () => {
      disposed = true;
    };
  }, [motion]);

  function navigate(direction: -1 | 1) {
    if (!hasNavigation) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setNavigation((current) => {
      // No encolamos clics ni usamos disabled: los controles conservan el foco.
      if (current.motion && !reducedMotion) return current;

      const nextIndex = (current.activeIndex + direction + total) % total;
      return {
        activeIndex: nextIndex,
        hasNavigated: true,
        requested: current.requested.includes(nextIndex) ? current.requested : [...current.requested, nextIndex],
        motion: reducedMotion
          ? null
          : {
              from: current.activeIndex,
              direction: direction > 0 ? "next" : "previous",
            },
      };
    });
  }

  return (
    <section
      aria-label={hasNavigation
        ? copy.carouselPlural
        : copy.carouselSingle}
      aria-roledescription={hasNavigation ? copy.carousel : undefined}
      data-count={total}
      className={styles.carousel}
    >
      <div className={styles.viewport}>
        <div className="relative isolate">
          {/* La celda comparte altura y crece solo si el contenido obligatorio lo necesita. */}
          <div
            ref={stackRef}
            id={`${id}-stories`}
            data-count={total}
            data-direction={motion?.direction}
            className={cn(styles.stack, "grid")}
          >
            {stories.map((story, index) => {
              const position = (index + total - activeIndex) % total;
              const active = position === 0;

              return (
                <div
                  key={story.id}
                  role={hasNavigation ? "group" : undefined}
                  aria-roledescription={hasNavigation ? copy.slide : undefined}
                  aria-label={hasNavigation ? `${index + 1} ${copy.of} ${total}` : undefined}
                  aria-hidden={!active}
                  inert={!active}
                  data-position={position}
                  data-motion={
                    motion
                      ? index === motion.from
                        ? "leave"
                        : active
                          ? "enter"
                          : undefined
                      : undefined
                  }
                  className={styles.card}
                >
                  <HeroTestimonialCard
                    key={story.imageUrl}
                    story={story}
                    locale={locale}
                    requested={requested.includes(index)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* One responsive text equivalent; also usable when artwork is small or unavailable. */}
      <div className={styles.transcript} key={activeStory.id} data-hero-transcript>
        <p className="font-semibold text-text-primary wrap-anywhere">{activeStory.fullName}</p>
        <p className="text-sm leading-relaxed text-text-secondary wrap-anywhere">
          {messages.categories[activeStory.type].label}
          {activeStory.country ? ` · ${activeStory.country}` : ""}
        </p>
        <details>
          <summary className={styles.textControl}>{copy.readText}</summary>
          <div className="space-y-sm pt-xs text-base leading-relaxed text-text-primary wrap-anywhere">
            <blockquote className="whitespace-pre-wrap">{stripWrappingQuotes(activeStory.quote)}</blockquote>
            {activeStory.story !== activeStory.quote ? <p className="whitespace-pre-wrap">{activeStory.story}</p> : null}
            <dl className="space-y-xs text-sm">
              {activeStory.previousRole ? <div><dt className="text-text-secondary">{messages.fields.previous_profession.label}</dt><dd>{activeStory.previousRole}</dd></div> : null}
              {activeStory.role ? <div><dt className="text-text-secondary">{activeStory.type === "simulation" ? messages.fields.primary_role.label : activeStory.type === "first_job" ? messages.fields.role_achieved.label : messages.fields.new_role.label}</dt><dd>{activeStory.role}</dd></div> : null}
              {activeStory.company ? <div><dt className="text-text-secondary">{messages.fields.company.label}</dt><dd>{activeStory.company}</dd></div> : null}
            </dl>
          </div>
        </details>
      </div>
      {/* Fuera de la publicación: no cubren el autor ni forman parte de su diseño. */}
      <div className="mt-sm flex min-w-0 flex-wrap items-center justify-between gap-xs">
        <Link
          href={`/t/${stories[activeIndex].slug}`}
          prefetch={false}
          aria-label={`${copy.readStoryOf} ${stories[activeIndex].fullName}`}
          className="inline-flex min-h-11 max-w-full items-center rounded-button text-sm font-medium text-accent-cyan wrap-anywhere hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
        >
          {copy.readStory}
        </Link>
        {hasNavigation ? (
            <div className="flex items-center gap-xs">
              <button
                type="button"
                aria-label={copy.previous}
                aria-controls={`${id}-stories`}
                onClick={() => navigate(-1)}
                className={CONTROL_CLASSES}
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <span aria-hidden="true" className="text-xs tabular-nums text-text-secondary">
                {activeIndex + 1} / {total}
              </span>
              <button
                type="button"
                aria-label={copy.next}
                aria-controls={`${id}-stories`}
                onClick={() => navigate(1)}
                className={CONTROL_CLASSES}
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
        ) : null}
      </div>
      {hasNavigation ? (
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {hasNavigated ? `${copy.testimonial} ${activeIndex + 1} ${copy.of} ${total}` : ""}
        </p>
      ) : null}
    </section>
  );
}
