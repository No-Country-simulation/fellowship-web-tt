import { MinusIcon, PlusIcon } from "lucide-react"

import { Section } from "@/components/section"
import { getAnsweredFaqs } from "@/lib/geo"
import { faqHeading } from "@/lib/landing"

/**
 * FAQ HF: H2 centrado, barras rosa-lavanda con icono +, sin borde.
 * `<details>` nativo para que pregunta y respuesta estén en el HTML
 * del servidor (crawlers / GEO), sin hidratar un acordeón cliente.
 */
function Faq() {
  const items = getAnsweredFaqs()

  if (items.length === 0) {
    return null
  }

  return (
    <Section surface="light" className="scroll-mt-2xl py-2xl md:py-3xl" id="faq">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 text-center text-text-primary">
          {faqHeading}
        </h2>

        <div className="flex flex-col gap-xs">
          {items.map((faq) => (
            <details
              key={faq.question}
              className="faq-details group rounded-md bg-[#FF00940D] px-md md:px-lg"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-md py-md text-left text-body font-medium text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 text-pretty">{faq.question}</span>
                <span className="relative size-5 shrink-0">
                  <PlusIcon className="size-5 text-text-primary transition-all duration-300 ease-out group-open:scale-75 group-open:opacity-0 motion-reduce:transition-none" />
                  <MinusIcon className="absolute inset-0 size-5 scale-75 text-text-primary opacity-0 transition-all duration-300 ease-out group-open:scale-100 group-open:opacity-100 motion-reduce:transition-none" />
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
