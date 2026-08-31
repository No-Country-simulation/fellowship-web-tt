import { LeadBriefForm } from "@/components/landing/lead-brief-form"
import { Section } from "@/components/section"
import { finalCtaHeading } from "@/lib/landing"

/**
 * Cierre HF: recuadro con borde, titular y brief de requerimiento.
 */
function FinalCta() {
  return (
    <Section
      surface="light"
      className="relative scroll-mt-2xl pt-0 pb-2xl md:pb-3xl"
      id="contacto"
    >
      <div className="relative rounded-md border border-accent-cyan/50 bg-accent-cyan/10 px-md py-xl md:px-2xl md:py-2xl">
        <div className="flex flex-col items-center gap-lg">
          <h2 className="w-full text-center text-heading-3 text-pretty text-brand-gradient md:whitespace-nowrap md:text-[2rem]">
            {finalCtaHeading}
          </h2>
          <div className="w-full max-w-2xl">
            <LeadBriefForm
              accessKey={process.env.WEB3FORMS_ACCESS_KEY?.trim() ?? ""}
            />
          </div>
        </div>
      </div>
    </Section>
  )
}

export { FinalCta }
