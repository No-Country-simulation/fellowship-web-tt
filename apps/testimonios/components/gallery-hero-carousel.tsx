"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { HeroStory } from "@/components/gallery-hero-data";
import { HeroTestimonialCard } from "@/components/hero-testimonial-card";
import { cn } from "@/lib/utils";
import { getFormMessages } from "@/lib/form-i18n/messages";
import type { FormLocale } from "@/lib/form-i18n/locales";

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
  const copy = getFormMessages(locale).form.hero;
  const [{ activeIndex, hasNavigated, motion }, setNavigation] = useState<{
    activeIndex: number;
    hasNavigated: boolean;
    motion: CarouselMotion | null;
  }>({
    activeIndex: 0,
    hasNavigated: false,
    motion: null,
  });
  const stackRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const total = stories.length;
  const hasNavigation = total > 1;

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

      return {
        activeIndex: (current.activeIndex + direction + total) % total,
        hasNavigated: true,
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
                  <HeroTestimonialCard story={story} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Fuera de la publicación: no cubren el autor ni forman parte de su diseño. */}
      <div className="mt-sm flex min-w-0 flex-wrap items-center justify-between gap-xs">
        <Link
          href={`/t/${stories[activeIndex].slug}`}
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
