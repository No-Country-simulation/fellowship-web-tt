import { SITE_BRAND } from "./site";
import { youtubeWatchUrl } from "./youtube";
import { buildDiscordDescription } from "./quote";
import type { CareerChangePayload, FirstJobPayload } from "../types/testimonial";

export type CommunityEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type CommunityEmbed = {
  authorName: string;
  authorIconUrl: string;
  title: string;
  description: string;
  fields: CommunityEmbedField[];
  imageUrl: string | null;
  footer: string;
};

export function buildCommunityEmbed(input: {
  fullName: string;
  avatarUrl: string;
  typeLabel: string;
  quote: string;
  country: string | null;
  simulation: { primary_role?: string } | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
  captureUrl: string | null;
  videoUrl: string | null;
}): CommunityEmbed {
  const fields: CommunityEmbedField[] = [
    ...(input.country
      ? [{ name: "País", value: input.country, inline: true }]
      : []),
    ...(input.simulation?.primary_role
      ? [
          {
            name: "Puesto principal",
            value: input.simulation.primary_role,
            inline: true,
          },
        ]
      : []),
    ...(input.firstJob
      ? [
          { name: "Empresa", value: input.firstJob.company, inline: true },
          { name: "Puesto", value: input.firstJob.role_achieved, inline: true },
        ]
      : []),
    ...(input.careerChange
      ? [
          {
            name: "Oficio anterior",
            value: input.careerChange.previous_profession,
            inline: true,
          },
          { name: "Rol nuevo", value: input.careerChange.new_role, inline: true },
        ]
      : []),
  ];

  if (input.videoUrl) {
    fields.push({
      name: "Video",
      value: youtubeWatchUrl(input.videoUrl),
      inline: false,
    });
  }

  return {
    authorName: input.fullName,
    authorIconUrl: input.avatarUrl,
    title: input.typeLabel,
    description: buildDiscordDescription(input.quote),
    fields,
    imageUrl: input.captureUrl,
    footer: SITE_BRAND,
  };
}
