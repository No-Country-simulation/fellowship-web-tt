import { SITE_BRAND } from "@/lib/site";
import type { TestimonialRow } from "@/lib/supabase/database";
import {
  AVATARS_BUCKET,
  CAPTURES_BUCKET,
  publicStorageUrl,
} from "@/lib/supabase/storage";

import { youtubeWatchUrl } from "./parse";
import { buildDiscordDescription } from "./quote";
import {
  careerChangeFields,
  firstJobFields,
  typeOption,
  type CareerChangePayload,
  type FirstJobPayload,
} from "./types";

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
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
  captureUrl: string | null;
  videoUrl: string | null;
}): CommunityEmbed {
  const fields: CommunityEmbedField[] = [
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

export function communityEmbedFromRow(row: TestimonialRow): CommunityEmbed {
  return buildCommunityEmbed({
    fullName: row.full_name,
    avatarUrl: publicStorageUrl(AVATARS_BUCKET, row.avatar_path),
    typeLabel: typeOption(row.type).label,
    quote: row.quote,
    firstJob: firstJobFields(row.payload),
    careerChange: careerChangeFields(row.payload),
    captureUrl: row.capture_path
      ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path)
      : null,
    videoUrl: row.video_url,
  });
}
