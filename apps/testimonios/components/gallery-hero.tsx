import Link from "next/link";
import { UsersRound } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";

import { cn } from "@/lib/utils";

// Copy provisional para revisar junto con la composición de la galería.
const HERO_COPY = {
  eyebrow: "Galería de testimonios",
  title: "Historias de",
  highlight: "talento real.",
  description:
    "Conocé las experiencias reales de nuestra comunidad y cómo la tecnología transformó sus carreras.",
  moderation:
    "El equipo valida cada historia antes de que salga acá o en Discord.",
  action: "Enviar testimonio",
  communityTitle: "Historias que inspiran nuevas oportunidades.",
  communityDescription: "Simulación · Primer empleo · Reconversión profesional",
} as const;

/** Presentación estática de la galería y enlace al formulario de envío. */
export function GalleryHero() {
  return (
    <section
      aria-labelledby="gallery-title"
      className="border-b border-border-subtle px-md py-xl md:px-lg md:py-3xl"
    >
      <div className="mx-auto grid w-full max-w-[70rem] gap-lg lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-3xl">
        <div className="min-w-0">
          <p className="type-eyebrow flex items-center gap-xs text-text-secondary">
            <span
              aria-hidden="true"
              className="h-0.5 w-7 shrink-0 rounded-full bg-brand-gradient"
            />
            {HERO_COPY.eyebrow}
          </p>
          <h1
            id="gallery-title"
            className="mt-md text-[2.125rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl"
          >
            {HERO_COPY.title}
            <span className="text-brand-gradient block w-fit">
              {HERO_COPY.highlight}
            </span>
          </h1>
          <p className="mt-md max-w-[36rem] text-base leading-relaxed text-text-secondary sm:text-lg">
            {HERO_COPY.description}
          </p>
          <p className="mt-sm max-w-[36rem] text-sm leading-relaxed text-text-secondary">
            {HERO_COPY.moderation}
          </p>
          <Link
            href="/enviar"
            className={cn(
              buttonVariants({ variant: "gradient", size: "lg" }),
              "mt-md min-h-12 px-md text-base focus-visible:border-transparent motion-reduce:transition-none",
            )}
          >
            {HERO_COPY.action}
          </Link>
        </div>
        <aside
          aria-labelledby="gallery-community-title"
          className="rounded-card border border-border bg-card p-md md:p-lg"
        >
          <UsersRound
            aria-hidden="true"
            className="size-10 text-accent-cyan"
            strokeWidth={1.5}
          />
          <h2
            id="gallery-community-title"
            className="mt-md text-lg font-bold leading-snug text-text-primary"
          >
            {HERO_COPY.communityTitle}
          </h2>
          <p className="mt-sm text-sm leading-relaxed text-text-secondary">
            {HERO_COPY.communityDescription}
          </p>
        </aside>
      </div>
    </section>
  );
}
