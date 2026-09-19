import { youtubeWatchUrl } from "@/lib/testimonials/parse";

const BUFFER_API_URL = "https://api.buffer.com";
const BUFFER_TIMEOUT_MS = 15000;

const CREATE_POST_MUTATION = `
mutation CreateScheduledPost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess {
      post {
        id
        status
        dueAt
        sentAt
        sharedNow
      }
    }
    ... on MutationError {
      message
    }
  }
}
`;

/** Pruebas: mañana 12:00 ART. Volver a `shareNow` (sin dueAt) cuando se publique de verdad. */
const BUFFER_SHARE = {
  schedulingType: "automatic",
  mode: "customScheduled",
} as const;

export type BufferNetwork = "instagram" | "linkedin";

export type BufferCreatePostResult =
  | { status: "skipped" }
  | { status: "failed" }
  | {
      status: "created";
      post: {
        id: string;
        status: string;
        sentAt: string | null;
      };
    };

export function hasInstagramChannel() {
  return Boolean(apiKey() && instagramChannelId());
}

export function hasLinkedInChannel() {
  return Boolean(apiKey() && linkedInChannelId());
}

export type CreatePostInput =
  | { network: "instagram"; text: string; imageUrl: string }
  | {
      network: "linkedin";
      text: string;
      /** Captura opcional del proyecto (no la card de Instagram). */
      imageUrl?: string | null;
      /** YouTube: se agrega al texto, igual que el campo Video de Discord. */
      videoUrl?: string | null;
    };

export async function createPost(
  input: CreatePostInput,
): Promise<BufferCreatePostResult> {
  const key = apiKey();
  const channelId =
    input.network === "instagram" ? instagramChannelId() : linkedInChannelId();

  if (!key || !channelId) {
    return { status: "skipped" };
  }

  const payload: Record<string, unknown> = {
    text: input.text,
    channelId,
    ...BUFFER_SHARE,
    dueAt: tomorrowNoonArtIso(),
  };

  if (input.network === "instagram") {
    const imageUrl = parseHttpsUrl(input.imageUrl);
    if (!imageUrl) {
      console.error("Buffer createPost failed: image URL must be https");
      return { status: "failed" };
    }

    payload.assets = [{ image: { url: imageUrl } }];
    payload.metadata = {
      instagram: { type: "post", shouldShareToFeed: true },
    };
  } else {
    payload.text = linkedInText(input.text, input.videoUrl);

    const captureUrl = input.imageUrl?.trim();
    if (captureUrl) {
      const imageUrl = parseHttpsUrl(captureUrl);
      if (!imageUrl) {
        console.error("Buffer createPost failed: image URL must be https");
        return { status: "failed" };
      }
      payload.assets = [{ image: { url: imageUrl } }];
    }
  }

  try {
    const response = await bufferGraphql(key, CREATE_POST_MUTATION, {
      input: payload,
    });

    if (!response) {
      return { status: "failed" };
    }

    const created = parseCreatePostPayload(response.createPost);
    if (!created) {
      const message = mutationErrorMessage(response.createPost);
      console.error("Buffer createPost failed", message ?? "MutationError");
      return { status: "failed" };
    }

    return { status: "created", post: created };
  } catch {
    console.error("Buffer createPost failed");
    return { status: "failed" };
  }
}

function apiKey() {
  return trimEnv(process.env.BUFFER_API_KEY);
}

function instagramChannelId() {
  return trimEnv(process.env.BUFFER_IG_CHANNEL_ID);
}

function linkedInChannelId() {
  return trimEnv(process.env.BUFFER_LI_CHANNEL_ID);
}

function trimEnv(value: string | undefined) {
  const raw = value?.trim();
  return raw ? raw : null;
}

function tomorrowNoonArtIso() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  // 12:00 ART = 15:00 UTC (sin DST).
  return new Date(
    Date.UTC(value("year"), value("month") - 1, value("day") + 1, 15, 0, 0),
  ).toISOString();
}

function linkedInText(caption: string, videoUrl: string | null | undefined) {
  const video = videoUrl?.trim();
  if (!video) {
    return caption;
  }

  return [caption, `Video: ${youtubeWatchUrl(video)}`].filter(Boolean).join(
    "\n\n",
  );
}

function parseHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

type GraphqlBody = {
  data?: {
    createPost?: unknown;
  };
  errors?: { message?: string }[];
};

type BufferPost = {
  id: string;
  status: string;
  sentAt: string | null;
};

async function bufferGraphql(
  key: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphqlBody["data"] | null> {
  const response = await fetch(BUFFER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(BUFFER_TIMEOUT_MS),
  });

  if (!response.ok) {
    console.error("Buffer GraphQL failed", response.status);
    return null;
  }

  const body = (await response.json()) as GraphqlBody;
  if (body.errors?.length) {
    console.error("Buffer GraphQL failed", body.errors[0]?.message);
    return null;
  }

  return body.data ?? null;
}

function parseCreatePostPayload(payload: unknown): BufferPost | null {
  if (!isRecord(payload)) {
    return null;
  }

  const post = payload.post;
  if (!isRecord(post) || typeof post.id !== "string" || !post.id) {
    return null;
  }

  return {
    id: post.id,
    status: typeof post.status === "string" ? post.status : "",
    sentAt: typeof post.sentAt === "string" ? post.sentAt : null,
  };
}

function mutationErrorMessage(payload: unknown) {
  if (!isRecord(payload) || typeof payload.message !== "string") {
    return null;
  }
  return payload.message;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
