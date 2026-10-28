import type { BufferPostState, BufferPostStatus } from "../types/share";

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

const POST_QUERY = `
query GetPost($input: PostInput!) {
  post(input: $input) {
    id
    status
    dueAt
    sentAt
    externalLink
    error {
      message
    }
  }
}
`;

const BUFFER_POST_STATUSES: readonly BufferPostStatus[] = [
  "draft",
  "error",
  "needs_approval",
  "scheduled",
  "sending",
  "sent",
];

export function bufferPublishesImmediately() {
  return trimEnv(process.env.BUFFER_ENV)?.toLowerCase() === "production";
}

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

export type CreatePostInput = {
  network: BufferNetwork;
  text: string;
  /** Card PNG del testimonio. Es la misma en todas las redes. */
  imageUrl: string;
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
    schedulingType: "automatic",
    ...bufferShareTiming(),
  };

  const imageUrl = parseHttpsUrl(input.imageUrl);
  if (!imageUrl) {
    console.error("Buffer createPost failed: image URL must be https");
    return { status: "failed" };
  }
  payload.assets = [{ image: { url: imageUrl } }];

  if (input.network === "instagram") {
    payload.metadata = {
      instagram: { type: "post", shouldShareToFeed: true },
    };
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

/** Estado actual de un post creado con `createPost`. `null` si falta la key o Buffer no responde. */
export async function getPost(id: string): Promise<BufferPostState | null> {
  const key = apiKey();
  if (!key) {
    return null;
  }

  try {
    const response = await bufferGraphql(key, POST_QUERY, { input: { id } });
    if (!response) {
      return null;
    }

    const post = parsePost(response.post);
    if (!post) {
      console.error("Buffer getPost failed: unexpected payload");
    }
    return post;
  } catch {
    console.error("Buffer getPost failed");
    return null;
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

function bufferShareTiming() {
  if (bufferPublishesImmediately()) {
    return { mode: "shareNow" as const };
  }

  return {
    mode: "customScheduled" as const,
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
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
    post?: unknown;
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

function parsePost(post: unknown): BufferPostState | null {
  if (!isRecord(post) || !isBufferPostStatus(post.status)) {
    return null;
  }

  const error = isRecord(post.error) && typeof post.error.message === "string" ? post.error.message : null;

  return {
    status: post.status,
    dueAt: typeof post.dueAt === "string" ? post.dueAt : null,
    sentAt: typeof post.sentAt === "string" ? post.sentAt : null,
    externalLink: typeof post.externalLink === "string" ? parseHttpsUrl(post.externalLink) : null,
    errorMessage: error?.trim() || null,
  };
}

function isBufferPostStatus(value: unknown): value is BufferPostStatus {
  return typeof value === "string" && (BUFFER_POST_STATUSES as readonly string[]).includes(value);
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
