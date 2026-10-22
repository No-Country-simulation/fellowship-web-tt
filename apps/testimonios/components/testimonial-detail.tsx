import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";

import { TestimonialCapture } from "@/components/testimonial-capture";
import { YoutubeEmbed } from "@/components/youtube-embed";
import {
  formatPublishedAt,
  type PublicTestimonial,
} from "@/lib/testimonials/public";
import { cn } from "@/lib/utils";

import styles from "./testimonial-detail.module.css";

// Copy provisional para revisar con el equipo.
const CLOSING_COPY = {
  title: "Tu historia también cuenta.",
  description:
    "Cada experiencia puede inspirar a alguien que está empezando su camino.",
  primaryAction: "Enviar testimonio",
  secondaryAction: "Ver más historias",
} as const;

type TestimonialDetailProps = {
  testimonial: PublicTestimonial;
};

const eyebrowClassName =
  "type-eyebrow flex items-center gap-sm text-text-primary/80";
const accentClassName =
  "h-0.5 w-8 shrink-0 rounded-full bg-brand-gradient";
const chipClassName =
  "max-w-full rounded-full border border-border bg-bg-surface-3 px-sm py-xs text-sm leading-relaxed text-text-primary/90";
const targetChipClassName =
  "border-accent-cyan/40 bg-accent-cyan/10 text-text-primary";

/** Ficha editorial de servidor con un único main; solo la foto testimonial es cliente. */
export function TestimonialDetail({ testimonial }: TestimonialDetailProps) {
  return (
    <main
      className={cn(
        styles.page,
        "min-h-0 min-w-0 flex-1 overflow-y-auto px-md pt-md pb-2xl md:px-lg md:pb-3xl",
      )}
    >
      <div className="mx-auto w-full max-w-[70rem] wrap-anywhere">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-xs rounded-sm text-sm font-medium text-text-secondary transition-colors hover:text-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan motion-reduce:transition-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
          Volver a la galería
        </Link>

        <header className="flex flex-col gap-lg pt-lg pb-2xl md:flex-row-reverse md:items-center md:justify-between md:gap-xl md:pt-xl md:pb-3xl">
          <div className="w-fit shrink-0 rounded-full border border-accent-indigo/20 p-xs">
            <div className="size-28 rounded-full bg-linear-to-br from-brand-pink/60 via-accent-indigo/60 to-brand-cyan/60 p-[3px] md:size-40">
              <div className="relative size-full overflow-hidden rounded-full border-4 border-bg-surface-3 bg-bg-surface-3">
                <Image
                  src={testimonial.avatarUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 146px, 98px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className={eyebrowClassName}>
              <span aria-hidden="true" className={accentClassName} />
              {testimonial.typeLabel}
            </p>
            <h1 className="mt-md text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1] font-bold tracking-tight text-text-primary">
              {testimonial.fullName}
            </h1>
            <ProfessionalContext testimonial={testimonial} />
            {testimonial.country || testimonial.publishedAt ? (
              <p className="mt-md flex flex-wrap items-center gap-x-sm gap-y-xs text-sm leading-relaxed text-text-secondary">
                {testimonial.country ? <span>{testimonial.country}</span> : null}
                {testimonial.country && testimonial.publishedAt ? (
                  <span
                    aria-hidden="true"
                    className="size-1 rounded-full bg-text-secondary"
                  />
                ) : null}
                {testimonial.publishedAt ? (
                  <span>
                    Publicado el{" "}
                    <time dateTime={testimonial.publishedAt}>
                      {formatPublishedAt(testimonial.publishedAt)}
                    </time>
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </header>

        <div className="flex flex-col gap-2xl md:gap-3xl">
          <section aria-labelledby="testimonial-story-title">
            <DetailHeading id="testimonial-story-title">Su historia</DetailHeading>
            <p className="mt-md max-w-[44rem] text-lg leading-[1.85] whitespace-pre-wrap text-text-primary/85">
              {testimonial.story}
            </p>
          </section>

          {testimonial.captureUrl ? (
            <section aria-labelledby="testimonial-photo-title">
              <DetailHeading id="testimonial-photo-title">Foto testimonial</DetailHeading>
              <div className="mt-md w-full max-w-3xl">
                <TestimonialCapture
                  src={testimonial.captureUrl}
                  participantName={testimonial.fullName}
                />
              </div>
            </section>
          ) : null}

          {testimonial.youtubeEmbedUrl ? (
            <section aria-labelledby="testimonial-video-title">
              <DetailHeading id="testimonial-video-title">En video</DetailHeading>
              <div className="mt-md w-full max-w-3xl">
                <YoutubeEmbed
                  src={testimonial.youtubeEmbedUrl}
                  title={`Video de ${testimonial.fullName}`}
                />
              </div>
            </section>
          ) : null}

          <section
            aria-labelledby="testimonial-closing-title"
            className={cn(
              styles.closing,
              "flex min-w-0 flex-col gap-md rounded-card border border-border p-md md:p-lg lg:flex-row lg:items-center lg:justify-between lg:gap-lg",
            )}
          >
            <div className="min-w-0">
              <h2
                id="testimonial-closing-title"
                className="text-2xl leading-snug font-semibold tracking-tight text-text-primary"
              >
                {CLOSING_COPY.title}
              </h2>
              <p className="mt-xs max-w-[30rem] text-sm leading-relaxed text-text-primary/70">
                {CLOSING_COPY.description}
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-xs sm:flex-row sm:flex-wrap lg:shrink-0">
              <Link
                href="/enviar"
                className={cn(
                  buttonVariants({ variant: "gradient", size: "lg" }),
                  "min-h-11 px-sm focus-visible:border-transparent motion-reduce:transition-none",
                )}
              >
                {CLOSING_COPY.primaryAction}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-h-11 px-sm motion-reduce:transition-none",
                )}
              >
                {CLOSING_COPY.secondaryAction}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/** Encabezado semántico compartido por las secciones editoriales de la ficha. */
function DetailHeading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className={eyebrowClassName}>
      <span aria-hidden="true" className={accentClassName} />
      {children}
    </h2>
  );
}

/** Chips de la categoría real; los campos ausentes no generan texto ni flechas. */
function ProfessionalContext({ testimonial }: TestimonialDetailProps) {
  const role =
    testimonial.type === "simulation"
      ? testimonial.simulation?.primary_role?.trim()
      : testimonial.type === "first_job"
        ? testimonial.firstJob?.role_achieved?.trim()
        : testimonial.careerChange?.new_role?.trim();
  const company =
    testimonial.type === "first_job" ? testimonial.firstJob?.company?.trim() : null;
  const previousProfession =
    testimonial.type === "career_change"
      ? testimonial.careerChange?.previous_profession?.trim()
      : null;

  if (!role && !company && !previousProfession) {
    return null;
  }

  return (
    <p className="mt-md flex flex-wrap items-center gap-xs">
      {previousProfession ? (
        <span className={chipClassName}>
          <span className="sr-only">Profesión anterior: </span>
          {previousProfession}
        </span>
      ) : null}
      {previousProfession && role ? (
        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-brand-pink" />
      ) : null}
      {role ? (
        <span className={cn(chipClassName, targetChipClassName)}>
          <span className="sr-only">
            {testimonial.type === "career_change" ? "Nuevo rol: " : "Rol: "}
          </span>
          {role}
        </span>
      ) : null}
      {company ? (
        <span className={chipClassName}>
          <span className="sr-only">Empresa: </span>
          {company}
        </span>
      ) : null}
    </p>
  );
}
