import { getSiteUrl, SITE_BRAND } from "@/lib/site";
import type { TestimonialRow } from "@/lib/supabase/database";
import { communityEmbedFromRow } from "@/lib/testimonials/community-embed";

const BRAND_COLOR = 0xfe0096;
const WEBHOOK_TIMEOUT_MS = 8000;
const INBOX_USERNAME = "Testimonios inbox";
const COMMUNITY_USERNAME = SITE_BRAND;

export type DiscordPostStatus = "posted" | "skipped" | "failed";

export function hasInboxWebhook() {
  return Boolean(inboxWebhookUrl());
}

export function hasCommunityWebhook() {
  return Boolean(communityWebhookUrl());
}

export async function notifyInboxNewTestimonial(input: {
  id: string;
  fullName: string;
  typeLabel: string;
}): Promise<DiscordPostStatus> {
  const webhookUrl = inboxWebhookUrl();
  if (!webhookUrl) {
    return "skipped";
  }

  return postWebhook(webhookUrl, {
    username: INBOX_USERNAME,
    avatar_url: brandLogoUrl(),
    content: [
      `Nuevo testimonio · ${input.fullName} · ${input.typeLabel}`,
      `${getSiteUrl()}/admin/${input.id}`,
    ].join("\n"),
    allowed_mentions: { parse: [] },
  });
}

export async function postCommunityTestimonial(
  row: TestimonialRow,
): Promise<DiscordPostStatus> {
  const webhookUrl = communityWebhookUrl();
  if (!webhookUrl) {
    return "skipped";
  }

  const community = communityEmbedFromRow(row);
  const embed: DiscordEmbed = {
    author: {
      name: community.authorName,
      icon_url: community.authorIconUrl,
    },
    title: community.title,
    description: community.description,
    color: BRAND_COLOR,
    footer: { text: community.footer },
  };

  if (community.imageUrl) {
    embed.image = { url: community.imageUrl };
  }
  if (community.fields.length > 0) {
    embed.fields = community.fields;
  }

  return postWebhook(webhookUrl, {
    username: COMMUNITY_USERNAME,
    avatar_url: brandLogoUrl(),
    embeds: [embed],
    allowed_mentions: { parse: [] },
  });
}

type DiscordEmbed = {
  author?: { name: string; icon_url?: string };
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  image?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
};

type DiscordWebhookBody = {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
  allowed_mentions?: { parse: string[] };
};

function inboxWebhookUrl() {
  return parseWebhookUrl(process.env.DISCORD_INBOX_WEBHOOK_URL);
}

function communityWebhookUrl() {
  return parseWebhookUrl(process.env.DISCORD_COMMUNITY_WEBHOOK_URL);
}

function brandLogoUrl() {
  return `${getSiteUrl()}/brand/logo-no-country.png`;
}

function parseWebhookUrl(value: string | undefined) {
  const raw = value?.trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") {
      return null;
    }
    if (host !== "discord.com" && host !== "discordapp.com") {
      return null;
    }
    if (!/^\/api\/webhooks\/\d+\/[^/]+$/.test(url.pathname)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function postWebhook(
  webhookUrl: string,
  body: DiscordWebhookBody,
): Promise<DiscordPostStatus> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("Discord webhook failed", response.status);
      return "failed";
    }

    return "posted";
  } catch {
    console.error("Discord webhook failed");
    return "failed";
  }
}
