import * as React from "react"

import { cn } from "@/lib/utils"

type SectionProps = React.ComponentProps<"section"> & {
  /** Clases del inner `container-content` (max-width 1280px). */
  containerClassName?: string
}

/**
 * Wrapper de bloque de landing: margen horizontal de frame + contenedor de contenido.
 *
 * Mobile `px-md` (24px), desktop `md:px-3xl` (80px). El vertical padding va por `className`.
 *
 * @example
 * <Section className="py-2xl" id="como-funciona">
 *   <h2 className="text-heading-2">Cómo funciona</h2>
 * </Section>
 */
function Section({
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("min-w-0 overflow-x-clip px-md md:px-3xl", className)}
      {...props}
    >
      <div className={cn("container-content", containerClassName)}>
        {children}
      </div>
    </section>
  )
}

export { Section }
export type { SectionProps }
