import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEFAULT_HREF = "#contacto"
const LABEL = "Hablar con un asesor"

type AdvisorCtaProps = {
  /** Destino del CTA. Default `#contacto` (brief de requerimiento). */
  href?: string
  className?: string
  /** `gradient` = hero. `outline` = bloque de garantía. */
  variant?: "gradient" | "outline"
  /** Texto del botón. Default “Hablar con un asesor”. */
  label?: string
}

/**
 * CTA primario de la landing Empresa: “Hablar con un asesor”.
 *
 * Default `#contacto` (brief de requerimiento en el cierre).
 */
function AdvisorCta({
  href = DEFAULT_HREF,
  className,
  variant = "gradient",
  label = LABEL,
}: AdvisorCtaProps) {
  return (
    <a
      href={href}
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        "h-11 max-w-full px-lg text-body",
        className
      )}
    >
      {label}
    </a>
  )
}

export { AdvisorCta }
export type { AdvisorCtaProps }
