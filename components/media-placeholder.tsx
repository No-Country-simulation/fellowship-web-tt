import * as React from "react"

import { cn } from "@/lib/utils"

const DEFAULT_NOTE = "Captura de producto prevista para V2."

type MediaPlaceholderProps = React.ComponentProps<"figure"> & {
  /** Qué representa el recuadro (hero B2B, perfil, dashboard). */
  label: string
  /** Nota de diseño V1. */
  note?: string
}

/**
 * Marco tipo ventana de la HF (3 dots + surface). Hueco V1 hasta las
 * capturas B2B de V2.
 */
function MediaPlaceholder({
  label,
  note = DEFAULT_NOTE,
  className,
  ...props
}: MediaPlaceholderProps) {
  return (
    <figure
      className={cn(
        "flex min-h-72 w-full min-w-0 flex-col overflow-hidden rounded-md bg-bg-surface-1",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-xs px-md py-sm">
        <span className="size-2.5 rounded-full bg-brand-pink" aria-hidden />
        <span className="size-2.5 rounded-full bg-accent-yellow" aria-hidden />
        <span className="size-2.5 rounded-full bg-accent-cyan" aria-hidden />
      </div>
      <figcaption className="flex flex-1 flex-col items-center justify-center gap-xs px-md py-xl text-center">
        <p className="sr-only">{label}</p>
        <p className="text-body-small max-w-md text-text-muted">{note}</p>
      </figcaption>
    </figure>
  )
}

export { MediaPlaceholder }
export type { MediaPlaceholderProps }
