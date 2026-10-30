import "server-only";

import type { PublicTestimonial } from "@/lib/testimonials/public";
import type { HeroTestimonialCardContent } from "@/components/hero-testimonial-card";

export type HeroStory = HeroTestimonialCardContent &
  Pick<PublicTestimonial, "id" | "slug" | "typeLabel">;

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

  return candidates.slice(0, 3).map((testimonial) => {
    const { id, slug, type, quote, fullName, typeLabel, avatarUrl, country } = testimonial;
    const role = type === "simulation"
      ? testimonial.simulation?.primary_role
      : type === "first_job"
        ? testimonial.firstJob?.role_achieved
        : testimonial.careerChange?.new_role;

    return {
      id,
      slug,
      type,
      quote,
      fullName,
      typeLabel,
      avatarUrl,
      country,
      role: role?.trim() || null,
      company: type === "first_job" ? testimonial.firstJob?.company.trim() || null : null,
      previousRole: type === "career_change"
        ? testimonial.careerChange?.previous_profession.trim() || null
        : null,
    };
  });
}
