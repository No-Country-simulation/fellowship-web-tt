export {
  QUOTE_EDIT_MAX_CHARS,
  QUOTE_EDIT_WARN_CHARS,
  QUOTE_TOO_LONG_MESSAGE,
  CAPTION_MAX_CHARS,
  IG_HASHTAGS,
  defaultCaptionIntro,
  stripWrappingQuotes,
  buildShareCaption,
  buildDiscordCaption,
  buildIgCaption,
  buildLiCaption,
  linkedInMention,
  captionIncludesVideo,
  setCaptionVideo,
  videoCaptionLine,
  omitVideoLine,
} from "./captionTemplates";

export {
  reviewCaptions,
  omitQuotedCaption,
  extractCaptionIntro,
  followsShareCaptionTemplate,
} from "./captionLegacy";

export { rebuildCaptionsForName, captionRenameNotice } from "./captionRename";
