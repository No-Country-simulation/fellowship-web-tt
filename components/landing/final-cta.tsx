import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { finalCtaLabel } from "@/lib/landing"

/**
 * Cierre HF: recuadro con borde, titular en gradiente de marca y CTA.
 */
function FinalCta() {
  return (
    <Section
      className="relative scroll-mt-2xl py-2xl md:py-3xl"
      id="contacto"
    >
      <div className="relative rounded-md border border-accent-cyan/50 bg-accent-cyan/10 px-md py-xl md:px-2xl md:py-2xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-md text-center">
          <h2 className="text-heading-2 max-w-full text-pretty text-brand-gradient">
            ¿Necesitás incorporar talento junior en los próximos 30 días?
          </h2>
          <AdvisorCta
            label={finalCtaLabel}
            className="h-auto min-h-11 whitespace-normal sm:whitespace-nowrap"
          />
          <p className="text-body-small text-text-secondary">
            Sin compromiso. Sin costo. Solo una conversación para entender si
            podemos ayudarte.
          </p>
        </div>
      </div>
    </Section>
  )
}

export { FinalCta }
