import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionEyebrowProps = {
  children: ReactNode
  className?: string
}

/**
 * Pill de sección de la HF: borde cyan, sentence case.
 * En bandas claras (`surface="light"`) el texto y el wash siguen en cyan.
 */
function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        "inline-flex max-w-full bg-bg-surface-1 rounded-full border border-accent-cyan/70 px-sm py-1 text-center text-body-small text-pretty text-text-primary in-data-[surface=light]:bg-accent-cyan/10 in-data-[surface=light]:text-accent-cyan",
        className
      )}
    >
      {children}
    </p>
  )
}

export { SectionEyebrow }
export type { SectionEyebrowProps }
