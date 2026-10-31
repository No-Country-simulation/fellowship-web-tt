"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

const COPIED_LABEL = "Link copiado";
const COPY_ERROR = "No se pudo copiar el link.";

/** Copia el link del formulario público. Si `href` es null, no renderiza nada. */
export function CopyFormLinkButton({
  href,
  compact = false,
}: {
  href: string | null;
  /** Columna angosta: el texto se achica o se trunca, el nombre accesible no. */
  compact?: boolean;
}) {
  const errorId = useId();
  const [copied, setCopied] = useState(false);
  const [ack, setAck] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  if (!href) {
    return null;
  }

  async function copy(formHref: string) {
    try {
      await navigator.clipboard.writeText(formHref);
      setError(null);
      setCopied(true);
      setAck((n) => n + 1);
    } catch {
      setCopied(false);
      setError(COPY_ERROR);
    }
  }

  const fullLabel = "Link del formulario";

  return (
    <div
      className={cn(
        "flex max-w-full flex-col gap-1",
        compact ? "min-w-0 w-full" : "shrink-0 items-start",
      )}
    >
      <button
        type="button"
        onClick={() => {
          void copy(href);
        }}
        aria-describedby={error ? errorId : undefined}
        aria-label="Copiar link del formulario"
        data-copied={copied ? "" : undefined}
        title={compact ? "Copiar link del formulario" : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "xs" }),
          "transition-[border-color,background-color,color] duration-200 active:border-primary",
          compact
            ? "h-8 w-full min-w-0 shrink justify-start gap-1 overflow-hidden px-1.5 text-admin-caption"
            : "max-w-full",
          copied && "border-primary bg-primary/10 text-primary",
        )}
      >
        <span key={ack} className={cn("inline-flex", copied && "motion-safe:animate-copy-ack")}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </span>
        <span className="min-w-0 truncate">{compact ? "Link" : fullLabel}</span>
      </button>
      <p className="sr-only" aria-live="polite">
        {copied ? COPIED_LABEL : ""}
      </p>
      {error ? (
        <p id={errorId} className="text-admin-micro text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
