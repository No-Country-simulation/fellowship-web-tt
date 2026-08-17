import { MinusIcon, PlusIcon } from "lucide-react"

import { Section } from "@/components/section"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from "@/lib/geo"
import { faqHeading } from "@/lib/landing"

/**
 * FAQ HF: H2 centrado, 6 barras independientes con icono +.
 */
function Faq() {
  if (faqs.length === 0) {
    return null
  }

  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="faq">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 text-center text-text-primary">
          {faqHeading}
        </h2>

        <Accordion className="gap-sm">
          {faqs.map((faq, index) => {
            const hasAnswer = Boolean(faq.answer)

            return (
              <AccordionItem
                key={faq.question}
                value={`faq-${index + 1}`}
                disabled={!hasAnswer}
                className="rounded-md border border-border bg-bg-surface-1 px-md aria-disabled:opacity-100"
              >
                <AccordionTrigger className="items-center rounded-md py-md text-left text-body font-medium text-text-primary hover:no-underline aria-disabled:opacity-100 **:data-[slot=accordion-trigger-icon]:hidden">
                  {faq.question}
                  <PlusIcon className="size-5 shrink-0 text-text-primary group-aria-expanded/accordion-trigger:hidden" />
                  <MinusIcon className="hidden size-5 shrink-0 text-text-primary group-aria-expanded/accordion-trigger:inline" />
                </AccordionTrigger>
                {hasAnswer ? (
                  <AccordionContent className="pb-md text-body text-text-secondary">
                    <p>{faq.answer}</p>
                  </AccordionContent>
                ) : null}
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </Section>
  )
}

export { Faq }
