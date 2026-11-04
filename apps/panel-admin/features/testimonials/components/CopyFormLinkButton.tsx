"use client";

import { useEffect, useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

const COPIED_LABEL = "Link copiado";
const COPY_ERROR = "No se pudo copiar el link.";

/** Copia el link del formulario público. Si `href` es null, no renderiza nada. */
export function CopyFormLinkButton({ href }: { href: string | null }) {
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

  return (
    <div className="flex max-w-full shrink-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => {
          void copy(href);
        }}
        aria-describedby={error ? errorId : undefined}
        aria-label="Copiar link del formulario"
        data-copied={copied ? "" : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "xs" }),
          "max-w-full transition-[border-color,background-color,color] duration-200 active:border-primary",
          copied && "border-primary bg-primary/10 text-primary",
        )}
      >
        <span key={ack} className={cn("inline-flex", copied && "motion-safe:animate-copy-ack")}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </span>
        <span className="min-w-0 truncate">Link del formulario</span>
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
