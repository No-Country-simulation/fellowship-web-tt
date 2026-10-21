import "server-only";

import type { PublicTestimonial } from "@/lib/testimonials/public";

export type HeroStory = Pick<
  PublicTestimonial,
  "id" | "slug" | "quote" | "fullName" | "typeLabel" | "avatarUrl"
>;

/** Elige hasta tres publicados sin reemplazo en servidor, sin alterar el orden de la galería. */
export function selectHeroStories(testimonials: readonly PublicTestimonial[]): HeroStory[] {
  const candidates = [...testimonials];

  if (candidates.length > 3) {
    // Fisher–Yates parcial: solo necesitamos las tres primeras posiciones.
    for (let index = 0; index < 3; index++) {
      const selected = index + Math.floor(Math.random() * (candidates.length - index));
      [candidates[index], candidates[selected]] = [candidates[selected], candidates[index]];
    }
  }

  return candidates.slice(0, 3).map(({ id, slug, quote, fullName, typeLabel, avatarUrl }) => ({
    id,
    slug,
    quote,
    fullName,
    typeLabel,
    avatarUrl,
  }));
}
