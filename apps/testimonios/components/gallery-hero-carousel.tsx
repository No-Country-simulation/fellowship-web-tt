"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";

import { HERO_STORIES } from "@/components/gallery-hero-data";
import { cn } from "@/lib/utils";

import styles from "./gallery-hero-carousel.module.css";

const CONTROL_CLASSES =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-bg-surface-2 text-text-primary transition-[color,border-color,background-color] duration-200 hover:border-accent-cyan hover:bg-bg-surface-3 hover:text-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan motion-reduce:transition-none";

type CarouselMotion = {
  from: number;
  direction: "next" | "previous";
};

/** Tres tarjetas reales con transiciones secuenciales y controles de foco estable. */
export function GalleryHeroCarousel() {
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
  const total = HERO_STORIES.length;

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
      aria-label="Historias ilustrativas de la comunidad"
      aria-roledescription="carrusel"
      aria-describedby={`${id}-notice`}
      className="w-full min-w-0 max-w-[28rem] justify-self-center lg:justify-self-end"
    >
      <div className="sm:pr-10">
        <div className="relative isolate">
          {/* Todas las tarjetas participan en la altura de la misma celda. */}
          <div
            ref={stackRef}
            id={`${id}-stories`}
            data-direction={motion?.direction}
            className={cn(styles.stack, "grid")}
          >
            {HERO_STORIES.map((story, index) => {
              const position = (index + total - activeIndex) % total;
              const active = position === 0;

              return (
                <figure
                  key={story.id}
                  role="group"
                  aria-roledescription="diapositiva"
                  aria-label={`${index + 1} de ${total}`}
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
                    "flex min-h-72 min-w-0 flex-col rounded-card border border-transparent p-5 sm:p-md",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="text-brand-gradient block h-9 w-fit text-6xl font-bold leading-none"
                  >
                    “
                  </span>
                  <blockquote className="mt-xs flex-1 text-xl font-medium leading-snug tracking-tight text-text-primary wrap-anywhere sm:text-[1.375rem]">
                    <p>{story.quote}</p>
                  </blockquote>
                  <figcaption className="mt-md flex min-w-0 items-center gap-xs pb-14 sm:pr-28 sm:pb-0">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent-indigo-light/30 bg-accent-indigo/20 text-accent-indigo-light"
                    >
                      <UserRound className="size-5" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-text-primary wrap-anywhere">
                        {story.displayName}
                      </p>
                      <p className="mt-1 text-[0.625rem] leading-relaxed tracking-[0.12em] text-text-secondary uppercase wrap-anywhere">
                        {story.category}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          {/* Fuera de las tarjetas: no se remontan ni se desplazan al navegar. */}
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
        </div>
        <p id={`${id}-notice`} className="sr-only">
          Ejemplos ilustrativos para desarrollo y revisión.
        </p>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {hasNavigated ? `Testimonio ${activeIndex + 1} de ${total}` : ""}
      </p>
    </section>
  );
}
