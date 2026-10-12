import { getSupabaseUrl } from "./env";

export const AVATARS_BUCKET = "avatars";
export const CAPTURES_BUCKET = "captures";
export const SHARE_CARDS_BUCKET = "share-cards";

export function publicStorageUrl(bucket: string, path: string) {
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${encoded}`;
}
