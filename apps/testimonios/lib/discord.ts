import { getSiteUrl } from "@/lib/site";

const WEBHOOK_TIMEOUT_MS = 8000;
const INBOX_USERNAME = "Testimonios inbox";

export type DiscordPostStatus = "posted" | "skipped" | "failed";

export function hasInboxWebhook() {
  return Boolean(inboxWebhookUrl());
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

  const lines = [
    `Nuevo testimonio · ${input.fullName} · ${input.typeLabel}`,
  ];
  const panelUrl = adminTestimonialUrl(input.id);
  if (panelUrl) {
    lines.push(panelUrl);
  } else {
    console.error("Discord inbox: ADMIN_PANEL_URL missing or invalid");
  }

  return postWebhook(webhookUrl, {
    username: INBOX_USERNAME,
    avatar_url: brandLogoUrl(),
    content: lines.join("\n"),
    allowed_mentions: { parse: [] },
  });
}

type DiscordWebhookBody = {
  username?: string;
  avatar_url?: string;
  content?: string;
  allowed_mentions?: { parse: string[] };
};

function adminTestimonialUrl(id: string) {
  const raw = process.env.ADMIN_PANEL_URL?.trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    const base = `${url.origin}${url.pathname}`.replace(/\/$/, "");
    return `${base}/testimonials/${encodeURIComponent(id)}`;
  } catch {
    return null;
  }
}

function inboxWebhookUrl() {
  return parseWebhookUrl(process.env.DISCORD_INBOX_WEBHOOK_URL);
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
