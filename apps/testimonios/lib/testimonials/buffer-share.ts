import { createPost, hasInstagramChannel, hasLinkedInChannel } from "@/lib/buffer";
import type { BufferCreatePostResult } from "@/lib/buffer";
import type { TestimonialRow } from "@/lib/supabase/database";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  CAPTURES_BUCKET,
  SHARE_CARDS_BUCKET,
  publicStorageUrl,
} from "@/lib/supabase/storage";

const SHARE_CARD_MAX_BYTES = 5 * 1024 * 1024;
const SHARE_CARD_NAME = "instagram.png";

export type BufferShareResult = {
  instagram: BufferCreatePostResult;
  linkedin: BufferCreatePostResult;
};

export function readIgCard(formData: FormData): File | null {
  const value = formData.get("ig_card");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  const png =
    value.type === "image/png" || value.name.toLowerCase().endsWith(".png");
  if (!png || value.size > SHARE_CARD_MAX_BYTES) {
    return null;
  }
  return value;
}

export async function sharePublishedToBuffer(
  row: TestimonialRow,
  igCard: File | null,
): Promise<BufferShareResult> {
  const [instagram, linkedin] = await Promise.all([
    row.buffer_instagram_posted_at
      ? alreadyPosted()
      : shareInstagram(row, igCard),
    row.buffer_linkedin_posted_at ? alreadyPosted() : shareLinkedIn(row),
  ]);

  return { instagram, linkedin };
}

async function shareInstagram(
  row: TestimonialRow,
  igCard: File | null,
): Promise<BufferCreatePostResult> {
  if (!hasInstagramChannel()) {
    return { status: "skipped" };
  }

  const path = shareCardPath(row.slug);
  if (igCard) {
    const uploaded = await uploadShareCard(path, igCard);
    if (!uploaded) {
      return { status: "failed" };
    }
  } else if (!(await shareCardExists(path))) {
    console.error("Buffer Instagram failed: missing share card");
    return { status: "failed" };
  }

  return createPost({
    network: "instagram",
    text: row.ig_caption,
    imageUrl: publicStorageUrl(SHARE_CARDS_BUCKET, path),
  });
}

async function shareLinkedIn(row: TestimonialRow): Promise<BufferCreatePostResult> {
  if (!hasLinkedInChannel()) {
    return { status: "skipped" };
  }

  return createPost({
    network: "linkedin",
    text: row.li_caption || row.ig_caption,
    imageUrl: row.capture_path
      ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path)
      : null,
    videoUrl: row.video_url,
  });
}

function alreadyPosted(): BufferCreatePostResult {
  return {
    status: "created",
    post: { id: "", status: "scheduled", sentAt: null },
  };
}

function shareCardPath(slug: string) {
  return `${slug}/${SHARE_CARD_NAME}`;
}

async function uploadShareCard(path: string, file: File) {
  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(SHARE_CARDS_BUCKET).upload(
    path,
    file,
    {
      contentType: "image/png",
      upsert: true,
    },
  );

  if (error) {
    console.error("Buffer share-cards upload failed");
    return false;
  }

  return true;
}

async function shareCardExists(path: string) {
  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const slash = path.lastIndexOf("/");
  const folder = slash === -1 ? "" : path.slice(0, slash);
  const name = slash === -1 ? path : path.slice(slash + 1);
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(SHARE_CARDS_BUCKET)
    .list(folder, { search: name });

  if (error) {
    return false;
  }

  return Boolean(data?.some((object) => object.name === name));
}
