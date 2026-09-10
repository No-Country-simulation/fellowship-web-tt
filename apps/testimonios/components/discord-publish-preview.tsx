import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { buildCommunityEmbed } from "@/lib/testimonials/community-embed";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";

type DiscordPublishPreviewProps = {
  testimonial: AdminTestimonial;
  quote: string;
  /** Cuando el contenedor ya dice "Discord". */
  hideLabel?: boolean;
};

/** Cómo queda el embed en Discord. */
export function DiscordPublishPreview({
  testimonial,
  quote,
  hideLabel = false,
}: DiscordPublishPreviewProps) {
  const embed = buildCommunityEmbed({
    fullName: testimonial.fullName,
    avatarUrl: testimonial.avatarUrl,
    typeLabel: testimonial.typeLabel,
    quote,
    firstJob: testimonial.firstJob,
    careerChange: testimonial.careerChange,
    captureUrl: testimonial.captureUrl,
    videoUrl: testimonial.videoUrl,
  });

  return (
    <div className="flex min-w-0 flex-col gap-xs">
      {hideLabel ? null : (
        <p className="text-body-small text-text-secondary">Discord</p>
      )}
      <DiscordEmbedPreview embed={embed} />
    </div>
  );
}
