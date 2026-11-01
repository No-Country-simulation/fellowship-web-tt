import {
  AVATAR_MAX_BYTES,
  CAPTURE_MAX_BYTES,
  FIELD_MAX_CHARS,
  NAME_MAX_CHARS,
  STORY_MAX_CHARS,
  STORY_MIN_CHARS,
} from "../testimonials/parse";

/** Presentation values derived from existing rules; this module does not validate data. */
export const FORM_LIMITS = {
  story: { min: STORY_MIN_CHARS, max: STORY_MAX_CHARS },
  nameMax: NAME_MAX_CHARS,
  fieldMax: FIELD_MAX_CHARS,
  avatar: { maxBytes: AVATAR_MAX_BYTES, maxMb: AVATAR_MAX_BYTES / (1024 * 1024) },
  capture: { maxBytes: CAPTURE_MAX_BYTES, maxMb: CAPTURE_MAX_BYTES / (1024 * 1024) },
} as const;
