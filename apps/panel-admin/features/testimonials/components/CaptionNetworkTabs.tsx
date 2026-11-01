"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@repo/ui/utils";

import type { VisualTone } from "@shared/ui/patterns/visualTone";

export const CAPTION_NETWORKS = ["instagram", "linkedin", "discord"] as const;

export type CaptionNetwork = (typeof CAPTION_NETWORKS)[number];

const LABELS: Record<CaptionNetwork, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  discord: "Discord",
};

const STORAGE_PREFIX = "testimonial-caption-tab:";

const TONE_TEXT: Record<VisualTone, string> = {
  neutral: "text-tone-neutral",
  info: "text-tone-info",
  success: "text-tone-success",
  warning: "text-tone-warning",
  destructive: "text-tone-destructive",
};

export type CaptionTabNote = {
  /** Texto corto bajo el nombre: "sin configurar" o el estado de la red. */
  text?: string;
  tone?: VisualTone;
  /** Punto verde si la red se publica; gris si no está configurada. */
  publishes?: boolean;
};

function isCaptionNetwork(value: string | null): value is CaptionNetwork {
  return value === "instagram" || value === "linkedin" || value === "discord";
}

export function captionTabStorageKey(testimonialId: string) {
  return `${STORAGE_PREFIX}${testimonialId}`;
}

/** Tab de la red, recordado por testimonio para que sobreviva a guardar el borrador. */
export function useRememberedCaptionNetwork(testimonialId?: string) {
  const [network, setNetwork] = useState<CaptionNetwork>("instagram");

  useEffect(() => {
    if (!testimonialId) {
      return;
    }
    const timeout = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem(captionTabStorageKey(testimonialId));
        if (isCaptionNetwork(stored)) {
          setNetwork(stored);
        }
      } catch {
        // sessionStorage no disponible.
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [testimonialId]);

  function select(next: CaptionNetwork) {
    setNetwork(next);
    if (!testimonialId) {
      return;
    }
    try {
      sessionStorage.setItem(captionTabStorageKey(testimonialId), next);
    } catch {
      // sessionStorage no disponible.
    }
  }

  return [network, select] as const;
}

function tabAria(network: CaptionNetwork, note: CaptionTabNote | undefined) {
  const parts = [LABELS[network]];
  if (note?.text) {
    parts.push(note.text);
  }
  return parts.join(", ");
}

/** Tabs de la red del texto. Mismo patrón visual que los tabs de estado del inbox. */
export function CaptionNetworkTabs({
  value,
  onChange,
  controls,
  notes,
  attached = false,
}: {
  value: CaptionNetwork;
  onChange: (network: CaptionNetwork) => void;
  /** id del tabpanel. */
  controls: string;
  notes?: Partial<Record<CaptionNetwork, CaptionTabNote>>;
  /** Pegadas al panel de abajo: la activa no tiene borde inferior y comparte el fondo. */
  attached?: boolean;
}) {
  const buttons = useRef<Partial<Record<CaptionNetwork, HTMLButtonElement>>>({});

  function focusNetwork(network: CaptionNetwork) {
    onChange(network);
    buttons.current[network]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Home") {
      event.preventDefault();
      const first = CAPTION_NETWORKS[0];
      if (first) {
        focusNetwork(first);
      }
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const last = CAPTION_NETWORKS[CAPTION_NETWORKS.length - 1];
      if (last) {
        focusNetwork(last);
      }
      return;
    }
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const index = CAPTION_NETWORKS.indexOf(value);
    const next =
      event.key === "ArrowRight"
        ? CAPTION_NETWORKS[(index + 1) % CAPTION_NETWORKS.length]
        : CAPTION_NETWORKS[(index - 1 + CAPTION_NETWORKS.length) % CAPTION_NETWORKS.length];
    if (next) {
      focusNetwork(next);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Red del texto"
      className={cn("grid grid-cols-3", attached ? "relative z-10 -mb-px" : "gap-1")}
      onKeyDown={onKeyDown}
    >
      {CAPTION_NETWORKS.map((network) => {
        const selected = network === value;
        const note = notes?.[network];
        return (
          <button
            key={network}
            ref={(node) => {
              buttons.current[network] = node ?? undefined;
            }}
            type="button"
            role="tab"
            id={`${controls}-${network}`}
            aria-controls={controls}
            aria-selected={selected}
            aria-label={note ? tabAria(network, note) : undefined}
            tabIndex={selected ? 0 : -1}
            className={cn(
              "flex h-full min-w-0 cursor-pointer flex-col items-center justify-center px-1 py-1.5 text-center leading-tight",
              attached
                ? selected
                  ? "relative z-10 rounded-t-md border border-b-0 border-primary bg-primary/10 font-medium text-foreground"
                  : "rounded-t-md border border-b-0 border-transparent text-muted-foreground hover:text-foreground"
                : selected
                  ? "rounded-md border border-primary bg-muted text-foreground"
                  : "rounded-md border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            onClick={() => onChange(network)}
          >
            {attached && selected ? (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-card" />
            ) : null}
            <span className="relative flex max-w-full items-center justify-center gap-1">
              {typeof note?.publishes === "boolean" ? (
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    note.publishes ? "bg-tone-success" : "bg-muted-foreground",
                  )}
                />
              ) : null}
              <span className="max-w-full truncate text-admin-caption">{LABELS[network]}</span>
            </span>
            {note?.text ? (
              <span
                className={cn(
                  "relative max-w-full truncate text-admin-micro",
                  note.tone ? TONE_TEXT[note.tone] : "text-muted-foreground",
                )}
              >
                {note.text}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
