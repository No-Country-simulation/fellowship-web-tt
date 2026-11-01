import { SITE_BRAND } from "../site";
import { getFormMessages } from "./messages";

/** Shared by initial server metadata and the in-place client language change. */
export function getFormMetadata(locale: unknown) {
  const copy = getFormMessages(locale).form.metadata;
  return { title: `${copy.title} · ${SITE_BRAND}`, description: copy.description };
}
