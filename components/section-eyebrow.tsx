import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionEyebrowProps = {
  children: ReactNode
  className?: string
}

/**
 * Pill de sección de la HF: borde cyan, sentence case.
 */
function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex max-w-full bg-bg-surface-1 rounded-full border border-accent-cyan/70 px-sm py-1 text-center text-body-small text-pretty text-text-primary",
        className
      )}
    >
      {children}
    </p>
  )
}

export { SectionEyebrow }
export type { SectionEyebrowProps }
