"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { TestimonialCard } from "@/components/testimonial-card";
import type { PublicTestimonial } from "@/lib/testimonials/public";
import {
  TESTIMONIAL_TYPES,
  TYPE_LABELS,
  type TestimonialType,
} from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

export type GalleryTestimonial = Pick<
  PublicTestimonial,
  "id" | "slug" | "type" | "typeLabel" | "fullName" | "quote" | "avatarUrl"
>;

type TestimonialsGalleryProps = {
  testimonials: GalleryTestimonial[];
};

type GalleryFilter = "all" | TestimonialType;

// Copy provisional de los controles y estados de la galería.
const GALLERY_COPY = {
  all: "Todos",
  filterLabel: "Filtrar testimonios por tipo",
  resultsLabel: "Testimonios publicados",
  countPrefix: "Mostrando",
  story: "historia",
  stories: "historias",
  emptyTitle: "Todavía no hay envíos publicados.",
  emptyDescription:
    "Si estuviste en un Demo Day, podés dejar el tuyo ahora. El equipo lo revisa antes de que salga acá o en Discord.",
  emptyAction: "Compartí tu experiencia",
  filteredEmptyTitle: "No hay historias en esta categoría.",
  filteredEmptyDescription: "Probá con otro tipo de experiencia.",
  reset: "Ver todas",
  storyAction: "Ver historia",
} as const;

const FILTERS: { value: GalleryFilter; label: string }[] = [
  { value: "all", label: GALLERY_COPY.all },
  ...TESTIMONIAL_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
];

const FOCUS_CLASSES =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan";

/** Filtra en memoria las historias recibidas del servidor, sin nuevas consultas. */
export function TestimonialsGallery({ testimonials }: TestimonialsGalleryProps) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const allFilterRef = useRef<HTMLButtonElement>(null);
  const visible =
    filter === "all"
      ? testimonials
      : testimonials.filter((testimonial) => testimonial.type === filter);

  return (
    <>
      <div className="flex flex-wrap items-center gap-xs rounded-card border border-border bg-bg-surface-2/70 px-sm py-xs md:px-md">
        <div
          role="group"
          aria-label={GALLERY_COPY.filterLabel}
          className="flex flex-wrap gap-xs"
        >
          {FILTERS.map(({ value, label }) => {
            const active = filter === value;

            return (
              <button
                key={value}
                ref={value === "all" ? allFilterRef : undefined}
                type="button"
                aria-pressed={active}
                aria-controls="gallery-results"
                onClick={() => setFilter(value)}
                className={cn(
                  "relative isolate min-h-11 cursor-pointer rounded-full border-2 border-border bg-bg-surface-2 px-2.5 py-xs text-[0.8125rem] font-medium transition-[color,border-color] duration-200 ease-out hover:border-accent-cyan/50 motion-reduce:transition-none",
                  FOCUS_CLASSES,
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -inset-0.5 z-0 rounded-[inherit] border-2 border-transparent transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--bg-surface-3), var(--bg-surface-2)) padding-box, var(--gradient-brand) border-box",
                    boxShadow:
                      "inset 0 0 16px color-mix(in srgb, var(--accent-indigo) 18%, transparent)",
                  }}
                />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="ml-auto text-xs leading-relaxed text-text-secondary"
        >
          {GALLERY_COPY.countPrefix}{" "}
          <strong className="font-semibold text-text-primary">{visible.length}</strong>{" "}
          {visible.length === 1 ? GALLERY_COPY.story : GALLERY_COPY.stories}
        </p>
      </div>
      <div id="gallery-results" className="mt-md">
        {testimonials.length === 0 ? (
          <div className="rounded-card border border-border bg-card px-md py-xl text-center">
            <h3 className="text-lg font-semibold text-text-primary">
              {GALLERY_COPY.emptyTitle}
            </h3>
            <p className="mx-auto mt-xs max-w-[36rem] text-base leading-relaxed text-text-secondary">
              {GALLERY_COPY.emptyDescription}
            </p>
            <Link
              href="/enviar"
              className={cn(
                "mt-md inline-flex min-h-11 items-center rounded-button px-xs text-sm font-semibold text-accent-cyan hover:underline",
                FOCUS_CLASSES,
              )}
            >
              {GALLERY_COPY.emptyAction}
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-card border border-border bg-card px-md py-xl text-center">
            <h3 className="text-lg font-semibold text-text-primary">
              {GALLERY_COPY.filteredEmptyTitle}
            </h3>
            <p className="mt-xs text-base leading-relaxed text-text-secondary">
              {GALLERY_COPY.filteredEmptyDescription}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                allFilterRef.current?.focus();
              }}
              className={cn(
                "mt-md min-h-11 cursor-pointer rounded-button border border-border bg-bg-surface-3 px-sm text-sm font-semibold text-text-primary hover:border-accent-cyan/50",
                FOCUS_CLASSES,
              )}
            >
              {GALLERY_COPY.reset}
            </button>
          </div>
        ) : (
          <ul
            aria-label={GALLERY_COPY.resultsLabel}
            className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((testimonial) => (
              <li key={testimonial.id} className="min-w-0">
                <TestimonialCard
                  variant="gallery"
                  name={testimonial.fullName}
                  typeLabel={testimonial.typeLabel}
                  quote={testimonial.quote}
                  avatarUrl={testimonial.avatarUrl}
                  href={`/t/${testimonial.slug}`}
                  lineClamp={3}
                  cta={GALLERY_COPY.storyAction}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
