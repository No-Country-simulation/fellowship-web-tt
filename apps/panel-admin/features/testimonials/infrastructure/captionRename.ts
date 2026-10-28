import type { TestimonialType } from "../types/testimonial";
import { formatNetworkList, type ShareNetwork } from "../types/share";
import {
  buildShareCaption,
  defaultCaptionIntro,
  linkedInMention,
  normalizeCaption,
  omitVideoLine,
  videoCaptionLine,
  withVideoLine,
} from "./captionTemplates";

export type ShareCaptions = {
  instagram: string;
  linkedin: string;
  discord: string;
};

export type RebuildCaptionsInput = {
  oldName: string;
  newName: string;
  captions: ShareCaptions;
  handles: {
    instagram: string | null;
    linkedin: string | null;
  };
  type: TestimonialType;
  videoUrl?: string | null;
};

export type RebuildCaptionsResult = {
  captions: ShareCaptions;
  /** Redes cuya plantilla se reescribió con el nombre nuevo. */
  updated: ShareNetwork[];
  /** False si el nombre, ya recortado, quedó igual o vacío. */
  changed: boolean;
};

const NETWORKS = ["instagram", "linkedin", "discord"] as const satisfies readonly ShareNetwork[];

/**
 * Reescribe solo las descripciones que siguen la plantilla del nombre anterior.
 * Conserva la intro del propio texto. Una edición manual no se toca.
 * Instagram no lleva el link del video. En LinkedIn y Discord, si el admin lo
 * había sacado, no se vuelve a poner; si estaba, queda al final.
 */
export function rebuildCaptionsForName(input: RebuildCaptionsInput): RebuildCaptionsResult {
  const oldName = input.oldName.trim();
  const newName = input.newName.trim();
  if (!oldName || !newName || oldName === newName) {
    return { captions: input.captions, updated: [], changed: false };
  }

  const updated: ShareNetwork[] = [];
  const captions: ShareCaptions = { ...input.captions };

  for (const network of NETWORKS) {
    const next = rebuildNetwork({
      network,
      caption: input.captions[network],
      oldName,
      newName,
      type: input.type,
      handles: handlesFor(network, input.handles),
      hashtags: network !== "discord",
      keepVideo: network !== "instagram",
      videoUrl: input.videoUrl,
    });
    captions[network] = next.text;
    if (next.updated) {
      updated.push(network);
    }
  }

  return { captions, updated, changed: true };
}

/** Aviso después de un renombre. Null si las tres seguían la plantilla. */
export function captionRenameNotice(updated: readonly ShareNetwork[]): string | null {
  if (updated.length === 0) {
    return "Las descripciones editadas a mano quedaron igual.";
  }
  if (updated.length >= NETWORKS.length) {
    return null;
  }
  return `Se actualizaron las descripciones de ${formatNetworkList(updated)}; las editadas a mano quedaron igual.`;
}

function handlesFor(
  network: ShareNetwork,
  handles: RebuildCaptionsInput["handles"],
): (string | null | undefined)[] {
  if (network === "instagram") {
    return [handles.instagram];
  }
  if (network === "linkedin") {
    return [linkedInMention(handles.linkedin)];
  }
  return [];
}

function rebuildNetwork(input: {
  network: ShareNetwork;
  caption: string;
  oldName: string;
  newName: string;
  type: TestimonialType;
  handles: (string | null | undefined)[];
  hashtags: boolean;
  keepVideo: boolean;
  videoUrl?: string | null;
}): { text: string; updated: boolean } {
  const hadVideo = hasVideoLine(input.caption);
  if (!input.keepVideo && hadVideo) {
    return { text: input.caption, updated: false };
  }
  if (input.keepVideo && hadVideo && !videoCaptionLine(input.videoUrl)) {
    return { text: input.caption, updated: false };
  }

  const body = normalizeCaption(omitVideoLine(input.caption));
  const intro = firstBlock(body);
  if (!intro) {
    return { text: input.caption, updated: false };
  }

  const expected = normalizeCaption(
    shareCaption({
      network: input.network,
      type: input.type,
      intro,
      fullName: input.oldName,
      handles: input.handles,
      hashtags: input.hashtags,
    }),
  );
  if (body !== expected) {
    return { text: input.caption, updated: false };
  }

  const rebuilt = shareCaption({
    network: input.network,
    type: input.type,
    intro,
    fullName: input.newName,
    handles: input.handles,
    hashtags: input.hashtags,
  });
  const text = input.keepVideo && hadVideo ? withVideoLine(rebuilt, input.videoUrl) : rebuilt;
  return { text, updated: true };
}

function shareCaption(input: {
  network: ShareNetwork;
  type: TestimonialType;
  intro: string;
  fullName: string;
  handles: (string | null | undefined)[];
  hashtags: boolean;
}): string {
  return buildShareCaption({
    intro: input.intro.trim() || defaultCaptionIntro(input.network, input.type),
    fullName: input.fullName,
    handles: input.handles,
    hashtags: input.hashtags,
  });
}

function firstBlock(caption: string): string | null {
  const index = caption.indexOf("\n\n");
  if (index <= 0) {
    return null;
  }
  const intro = caption.slice(0, index).trim();
  return intro || null;
}

function hasVideoLine(caption: string): boolean {
  return normalizeCaption(omitVideoLine(caption)) !== normalizeCaption(caption);
}
