import { CheckIcon } from "lucide-react"

import { MediaPlaceholder } from "@/components/media-placeholder"
import { Section } from "@/components/section"
import { howItWorksHeading, howItWorksSteps } from "@/lib/landing"

/**
 * Cómo funciona HF: H2 centrado, 4 pasos con check + ventana B2B.
 */
function HowItWorks() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="como-funciona">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 text-center text-text-primary">
          {howItWorksHeading}
        </h2>

        <ol className="grid min-w-0 gap-lg sm:grid-cols-2 lg:grid-cols-4 lg:[&>*]:min-w-0">
          {howItWorksSteps.map((item) => (
            <li key={item.step} className="flex min-w-0 flex-col items-start gap-sm">
              <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-full bg-brand-gradient"
              >
                <CheckIcon className="size-5 text-white" />
              </span>
              <p className="text-body-small text-text-secondary">Paso {item.step}</p>
              <h3 className="text-heading-3 text-text-primary">{item.title}</h3>
              <p className="text-body text-text-secondary">{item.body}</p>
            </li>
          ))}
        </ol>

        <MediaPlaceholder
          label="Vista del proceso"
          note="V1 — placeholder. Preview del dashboard/perfil para conectar proceso con evidencia. Captura B2B en V2."
          className="min-h-96"
        />
      </div>
    </Section>
  )
}

export { HowItWorks }
