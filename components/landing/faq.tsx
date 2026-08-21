import { MinusIcon, PlusIcon } from "lucide-react"

import { Section } from "@/components/section"
import { getAnsweredFaqs } from "@/lib/geo"
import { faqHeading } from "@/lib/landing"

/**
 * FAQ HF: H2 centrado, barras independientes con icono +.
 * `<details>` nativo para que pregunta y respuesta estén en el HTML
 * del servidor (crawlers / GEO), sin hidratar un acordeón cliente.
 */
function Faq() {
  const items = getAnsweredFaqs()

  if (items.length === 0) {
    return null
  }

  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="faq">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 text-center text-text-primary">
          {faqHeading}
        </h2>

        <div className="flex flex-col gap-sm">
          {items.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-md border border-border/60 bg-bg-surface-1/70 px-md backdrop-blur-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-md py-md text-left text-body font-medium text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 text-pretty">{faq.question}</span>
                <span className="relative size-5 shrink-0">
                  <PlusIcon className="size-5 text-text-primary group-open:hidden" />
                  <MinusIcon className="absolute inset-0 hidden size-5 text-text-primary group-open:block" />
                </span>
              </summary>
              <p className="pb-md text-body text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

export { Faq }
