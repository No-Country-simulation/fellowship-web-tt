import { buildCommunityEmbed } from "../infrastructure/community-embed";
import type { AdminTestimonial } from "../types/testimonial";
import { DiscordEmbedPreview } from "./DiscordEmbedPreview";

/** Cómo queda el embed en Discord. */
export function DiscordPublishPreview({
  testimonial,
  quote,
}: {
  testimonial: AdminTestimonial;
  quote: string;
}) {
  const embed = buildCommunityEmbed({
    fullName: testimonial.fullName,
    avatarUrl: testimonial.avatarUrl,
    typeLabel: testimonial.typeLabel,
    quote,
    country: testimonial.country,
    simulation: testimonial.simulation,
    firstJob: testimonial.firstJob,
    careerChange: testimonial.careerChange,
    captureUrl: testimonial.captureUrl,
    videoUrl: testimonial.videoUrl,
  });

  return <DiscordEmbedPreview embed={embed} />;
}
