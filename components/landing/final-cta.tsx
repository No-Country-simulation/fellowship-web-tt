import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { finalCtaLabel } from "@/lib/landing"

/**
 * Cierre HF: titular centrado, CTA gradiente, glow de marca (Gradient.png).
 */
function FinalCta() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="bg-landing-glow pointer-events-none absolute top-1/2 left-1/2 h-[28rem] w-[140%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />

      <Section
        className="relative scroll-mt-2xl py-2xl md:py-3xl"
        id="contacto"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-md text-center">
          <h2 className="text-heading-2 max-w-full text-pretty text-text-primary">
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
      </Section>
    </div>
  )
}

export { FinalCta }
