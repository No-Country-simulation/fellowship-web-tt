import "server-only";
import { after } from "next/server";

import type { PublicTestimonial } from "@/lib/testimonials/public";
import type { HeroTestimonialCardContent } from "@/components/hero-testimonial-card";
import { publicStorageUrl } from "@/lib/supabase/storage";
import { availableShareCardUrls } from "@/lib/testimonials/share-card-availability";

export type HeroStory = HeroTestimonialCardContent &
  Pick<PublicTestimonial, "id" | "slug" | "typeLabel">;
export type HeroStories = readonly HeroStory[] | null;
export type HeroStoriesSource = HeroStories | Promise<HeroStories>;

function shareCardUrl(slug: string): string | null {
  return slug && slug !== "." && slug !== ".." && !/[\\/?#]/.test(slug)
    ? publicStorageUrl("share-cards", `${slug}/instagram.png`) : null;
}

/** Stream as soon as three images are confirmed, or all bounded checks finish; warm the rest with after(). */
export async function selectAvailableHeroStories(testimonials: readonly PublicTestimonial[]): Promise<HeroStory[]> {
  const candidates = testimonials.map(testimonial => ({ testimonial, url: shareCardUrl(testimonial.slug) }));
  // Randomize the probe order as well, so a cold request does not always favour the newest records.
  for (let index = candidates.length - 1; index > 0; index--) {
    const selected = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[selected]] = [candidates[selected], candidates[index]];
  }
  const available = new Set<string>();
  let confirmThree!: () => void;
  const enough = new Promise<void>(resolve => { confirmThree = resolve; });
  const checking = availableShareCardUrls(candidates.flatMap(({ url }) => url ? [url] : []), available, () => {
    if (available.size >= 3) confirmThree();
  });
  await Promise.race([checking, enough]);
  if (available.size >= 3) after(() => checking.then(() => undefined));
  const eligible = candidates.filter(({ url }) => url && available.has(url)).map(({ testimonial }) => testimonial);
  if (eligible.length) return selectHeroStories(eligible);
  return selectHeroStories(testimonials).map(story => ({ ...story, imageUrl: null }));
}

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
    const { id, slug, type, quote, story, fullName, typeLabel, country } = testimonial;
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
      story,
      fullName,
      typeLabel,
      imageUrl: shareCardUrl(slug),
      country,
      role: role?.trim() || null,
      company: type === "first_job" ? testimonial.firstJob?.company.trim() || null : null,
      previousRole: type === "career_change"
        ? testimonial.careerChange?.previous_profession.trim() || null
        : null,
    };
  });
}
