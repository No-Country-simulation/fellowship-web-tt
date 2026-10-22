"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

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
  searchLabel: "Buscar testimonios",
  searchPlaceholder: "Buscar por nombre o historia",
  clearSearch: "Limpiar búsqueda",
  searchEmptyTitle: "No encontramos testimonios con esa búsqueda.",
  searchEmptyDescription: "Probá con otro nombre o algunas palabras de la historia.",
  combinedEmptyTitle: "No encontramos testimonios con esa búsqueda y esos filtros.",
  combinedEmptyDescription: "Probá con otra búsqueda o restablecé los filtros.",
  resetFilters: "Restablecer filtros",
  reset: "Ver todas",
  storyAction: "Ver historia",
} as const;

const FILTERS: { value: GalleryFilter; label: string }[] = [
  { value: "all", label: GALLERY_COPY.all },
  ...TESTIMONIAL_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] })),
];

const FOCUS_CLASSES =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan";

/** Normaliza mayúsculas, marcas diacríticas Unicode y espacios exteriores. */
function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** Combina búsqueda por nombre/extracto y categoría en memoria, sin nuevas consultas. */
export function TestimonialsGallery({ testimonials }: TestimonialsGalleryProps) {
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const allFilterRef = useRef<HTMLButtonElement>(null);
  const normalizedQuery = normalizeSearchText(query);
  const hasSearch = normalizedQuery.length > 0;
  const visible = testimonials.filter((testimonial) =>
    (filter === "all" || testimonial.type === filter) &&
    (!hasSearch ||
      normalizeSearchText(testimonial.fullName).includes(normalizedQuery) ||
      normalizeSearchText(testimonial.quote).includes(normalizedQuery)),
  );

  function clearSearch() {
    setQuery("");
    searchRef.current?.focus();
  }

  function resetFilters() {
    setFilter("all");
    clearSearch();
  }

  function showAll() {
    setFilter("all");
    allFilterRef.current?.focus();
  }

  return (
    <>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mb-xs text-xs leading-relaxed text-text-secondary"
      >
        {GALLERY_COPY.countPrefix}{" "}
        <strong className="font-semibold text-text-primary">{visible.length}</strong>{" "}
        {visible.length === 1 ? GALLERY_COPY.story : GALLERY_COPY.stories}
      </p>
      <div className="@container flex flex-col gap-md rounded-card border border-border bg-bg-surface-2/70 px-sm py-sm md:px-md lg:flex-row lg:flex-wrap lg:items-center lg:py-xs">
        {testimonials.length > 0 ? (
          <div className="relative w-full min-w-0 max-w-full lg:order-2 lg:ml-auto lg:w-72 lg:flex-none xl:w-80">
            <label htmlFor={searchId} className="sr-only">{GALLERY_COPY.searchLabel}</label>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-[12px] size-[16px] -translate-y-1/2 text-text-secondary" />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={GALLERY_COPY.searchPlaceholder}
              autoComplete="off"
              aria-controls="gallery-results"
              className="block h-11 min-w-0 w-full rounded-md border border-border bg-bg-surface-2/70 pr-[48px] pl-[40px] text-sm text-text-primary outline-none placeholder:text-text-muted focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                aria-label={GALLERY_COPY.clearSearch}
                onClick={clearSearch}
                className={cn(
                  "absolute top-1/2 right-0 grid size-[44px] -translate-y-1/2 cursor-pointer place-items-center rounded-md text-text-secondary transition-colors hover:text-accent-cyan motion-reduce:transition-none",
                  FOCUS_CLASSES,
                )}
              >
                <X aria-hidden="true" className="size-[16px]" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div
          role="group"
          aria-label={GALLERY_COPY.filterLabel}
          className="grid min-w-0 max-w-full grid-cols-2 gap-xs @max-[14rem]:grid-cols-1 sm:flex sm:flex-wrap lg:order-1 lg:shrink-0"
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
                  "relative isolate min-h-11 w-full min-w-0 max-w-full cursor-pointer rounded-full border-2 border-border bg-bg-surface-2 px-2 py-xs text-[0.8125rem] font-medium wrap-anywhere transition-[color,border-color] duration-200 ease-out hover:border-accent-cyan/50 motion-reduce:transition-none sm:w-auto sm:px-2.5",
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
              {hasSearch
                ? filter === "all" ? GALLERY_COPY.searchEmptyTitle : GALLERY_COPY.combinedEmptyTitle
                : GALLERY_COPY.filteredEmptyTitle}
            </h3>
            <p className="mt-xs text-base leading-relaxed text-text-secondary">
              {hasSearch
                ? filter === "all" ? GALLERY_COPY.searchEmptyDescription : GALLERY_COPY.combinedEmptyDescription
                : GALLERY_COPY.filteredEmptyDescription}
            </p>
            <button
              type="button"
              onClick={hasSearch ? filter === "all" ? clearSearch : resetFilters : showAll}
              className={cn(
                "mt-md min-h-11 cursor-pointer rounded-button border border-border bg-bg-surface-3 px-sm text-sm font-semibold text-text-primary hover:border-accent-cyan/50",
                FOCUS_CLASSES,
              )}
            >
              {hasSearch
                ? filter === "all" ? GALLERY_COPY.clearSearch : GALLERY_COPY.resetFilters
                : GALLERY_COPY.reset}
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
