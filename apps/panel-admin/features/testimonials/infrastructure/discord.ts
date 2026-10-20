import { getGalleryUrl, SITE_BRAND } from "./site";
import { youtubeWatchUrl } from "./youtube";

const BRAND_COLOR = 0xfe0096;
const WEBHOOK_TIMEOUT_MS = 8000;

export type DiscordPostStatus = "posted" | "skipped" | "failed";

export function hasCommunityWebhook() {
  return Boolean(communityWebhookUrl());
}

/**
 * Post al canal de comunidad: mismo texto y misma card que Instagram y LinkedIn.
 * El aviso de inbox se queda en la app pública.
 */
export async function postCommunityTestimonial(post: {
  fullName: string;
  avatarUrl: string;
  caption: string;
  imageUrl: string;
  videoUrl: string | null;
}): Promise<DiscordPostStatus> {
  const webhookUrl = communityWebhookUrl();
  if (!webhookUrl) {
    return "skipped";
  }

  const embed: DiscordEmbed = {
    author: { name: post.fullName, icon_url: post.avatarUrl },
    description: post.caption,
    color: BRAND_COLOR,
    image: { url: post.imageUrl },
  };

  if (post.videoUrl) {
    embed.fields = [{ name: "Video", value: youtubeWatchUrl(post.videoUrl), inline: false }];
  }

  return postWebhook(webhookUrl, {
    username: SITE_BRAND,
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

function communityWebhookUrl() {
  return parseWebhookUrl(process.env.DISCORD_COMMUNITY_WEBHOOK_URL);
}

/** Sin galería configurada, el post sale con el avatar default: no frena la publicación. */
function brandLogoUrl() {
  try {
    return `${getGalleryUrl()}/brand/logo-no-country.png`;
  } catch (error) {
    console.error("Discord community:", error);
    return undefined;
  }
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
