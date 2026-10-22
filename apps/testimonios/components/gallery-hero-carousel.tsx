"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";

import type { HeroStory } from "@/components/gallery-hero-data";
import { cn } from "@/lib/utils";

import styles from "./gallery-hero-carousel.module.css";

const CONTROL_CLASSES =
  "inline-flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-surface-2 text-text-primary transition-[color,border-color,background-color] duration-200 hover:border-accent-cyan hover:bg-bg-surface-3 hover:text-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan motion-reduce:transition-none";

type CarouselMotion = {
  from: number;
  direction: "next" | "previous";
};

type GalleryHeroCarouselProps = {
  stories: readonly HeroStory[];
};

/** Publicados seleccionados en servidor; reinicia la navegación si cambian sus identidades u orden. */
export function GalleryHeroCarousel({ stories }: GalleryHeroCarouselProps) {
  if (stories.length === 0) return null;

  return (
    <HeroStoryStack
      key={JSON.stringify(stories.map((story) => story.id))}
      stories={stories}
    />
  );
}

function HeroStoryStack({ stories }: GalleryHeroCarouselProps) {
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
        ? "Testimonios publicados de la comunidad"
        : "Testimonio publicado de la comunidad"}
      aria-roledescription={hasNavigation ? "carrusel" : undefined}
      className="w-full min-w-0 max-w-[28rem] justify-self-center lg:justify-self-end"
    >
      <div className={total === 3 ? "sm:pr-10" : hasNavigation ? "sm:pr-6" : undefined}>
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
                <figure
                  key={story.id}
                  role={hasNavigation ? "group" : undefined}
                  aria-roledescription={hasNavigation ? "diapositiva" : undefined}
                  aria-label={hasNavigation ? `${index + 1} de ${total}` : undefined}
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
                  className={cn(
                    styles.card,
                    "flex min-w-0 flex-col rounded-card border border-transparent p-5 sm:p-md",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="text-brand-gradient block h-9 w-fit shrink-0 text-6xl font-bold leading-none"
                  >
                    “
                  </span>
                  <blockquote className={cn(styles.quoteSpace, "mt-xs flex-1 text-xl font-medium leading-snug tracking-tight text-text-primary wrap-anywhere sm:text-[1.375rem]")}>
                    <p className={cn(styles.quote, "line-clamp-1")}>{story.quote}</p>
                  </blockquote>
                  <figcaption
                    className={cn(
                      "mt-md flex min-w-0 shrink-0 flex-wrap items-center gap-xs",
                      hasNavigation && "pb-14 sm:pr-28 sm:pb-0",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="relative flex size-10 shrink-0 self-start items-center justify-center overflow-hidden rounded-full border border-accent-indigo-light/30 bg-accent-indigo/20 text-accent-indigo-light"
                    >
                      {story.avatarUrl ? (
                        <Image
                          src={story.avatarUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <UserRound className="size-5" strokeWidth={1.5} />
                      )}
                    </span>
                    <div className="min-w-0 flex-[1_1_6rem]">
                      <p className="text-sm font-medium leading-snug text-text-primary wrap-anywhere">
                        {story.fullName}
                      </p>
                      <p className="mt-1 text-[0.625rem] leading-relaxed tracking-[0.12em] text-text-secondary uppercase wrap-anywhere">
                        {story.typeLabel}
                      </p>
                      <Link
                        href={`/t/${story.slug}`}
                        className="mt-1 inline-flex min-h-11 max-w-full items-center rounded-button text-xs font-medium text-accent-cyan wrap-anywhere hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
                      >
                        Ver historia
                      </Link>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          {/* Fuera de las tarjetas: no se remontan ni se desplazan al navegar. */}
          {hasNavigation ? (
            <div className="absolute right-5 bottom-5 z-10 flex gap-xs sm:right-md sm:bottom-md">
              <button
                type="button"
                aria-label="Testimonio anterior"
                aria-controls={`${id}-stories`}
                onClick={() => navigate(-1)}
                className={CONTROL_CLASSES}
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Siguiente testimonio"
                aria-controls={`${id}-stories`}
                onClick={() => navigate(1)}
                className={CONTROL_CLASSES}
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {hasNavigation ? (
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {hasNavigated ? `Testimonio ${activeIndex + 1} de ${total}` : ""}
        </p>
      ) : null}
    </section>
  );
}
