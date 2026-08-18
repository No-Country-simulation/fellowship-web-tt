import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"

const replacementCopy =
  "Si el perfil que incorporaste no funciona en los primeros 30 días, lo reemplazamos en 72 horas sin costo adicional. Podemos garantizarlo porque no estamos apostando — estamos trabajando con evidencia de comportamiento real documentada durante semanas, no con un CV que el candidato armó para impresionar."

const hireCopy =
  "Al finalizar el período contratado — 3 o 6 meses — el talento queda libre para que lo incorporés directamente sin comisión. Ya lo conocés. Ya sabés cómo trabaja. Es el camino más seguro a una contratación permanente."

/**
 * Garantía HF: H2 a la derecha, dos cards rectangulares a la izquierda + CTA outline.
 */
function Guarantee() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="garantia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 text-center text-text-primary">Garantía</h2>

        <div className="flex flex-col items-start gap-md">
          <div className="w-full rounded-md bg-bg-surface-1 p-md backdrop-blur-sm border border-border max-w-2xl">
            <p className="text-body-small mb-sm inline-block rounded-sm bg-bg-surface-4 px-xs py-1 text-text-secondary">
              Garantía de reemplazo en 30 días.
            </p>
            <p className="text-body-large text-text-secondary">{replacementCopy}</p>
          </div>

          <div className="w-full rounded-md bg-bg-surface-1 p-md backdrop-blur-sm border border-border max-w-2xl">
            <p className="text-body-large text-text-secondary">{hireCopy}</p>
          </div>

          <AdvisorCta variant="outline" />
        </div>
      </div>
    </Section>
  )
}

export { Guarantee }
