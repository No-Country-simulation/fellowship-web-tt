import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEFAULT_HREF = "#contacto"
const LABEL = "Hablar con un asesor"

type AdvisorCtaProps = {
  /** Destino del CTA. Default `#contacto` hasta tener Calendly o ruta. */
  href?: string
  className?: string
  /** `gradient` = hero / cierre HF. `outline` = bloque de garantía. */
  variant?: "gradient" | "outline"
  /** Texto del botón. Default “Hablar con un asesor”. */
  label?: string
}

/**
 * CTA primario de la landing Empresa: “Hablar con un asesor”.
 *
 * Destino real (Calendly / ruta) fuera de este lote; default `#contacto`.
 */
function AdvisorCta({
  href = DEFAULT_HREF,
  className,
  variant = "gradient",
  label = LABEL,
}: AdvisorCtaProps) {
  return (
    <Button
      size="lg"
      variant={variant}
      className={cn("h-11 max-w-full px-lg text-body", className)}
      nativeButton={false}
      render={<a href={href} />}
    >
      {label}
    </Button>
  )
}

export { AdvisorCta }
export type { AdvisorCtaProps }
