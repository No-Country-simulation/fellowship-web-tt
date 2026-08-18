import { ChartColumnIcon, ClockIcon } from "lucide-react"

import { Section } from "@/components/section"
import {
  differentialHeading,
  differentialHighlights,
  differentialIntro,
} from "@/lib/landing"

const highlightIcons = [ClockIcon, ChartColumnIcon] as const

/**
 * Problema HF: H2 + intro, dos highlights (1 hora / 3–6x) en magenta.
 */
function Differential() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="diferencial">
      <div className="flex flex-col gap-2xl">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-md text-center">
          <h2 className="text-heading-2 text-pretty text-text-primary">
            {differentialHeading}
          </h2>
          <p className="text-body-large text-pretty text-text-secondary">
            {differentialIntro}
          </p>
        </div>

        <div className="grid min-w-0 w-full gap-xl md:grid-cols-2 md:*:min-w-0">
          {differentialHighlights.map((item, index) => {
            const Icon = highlightIcons[index]

            return (
              <article key={item.value} className="flex min-w-0 flex-col gap-sm">
                <Icon
                  aria-hidden
                  className="size-8 stroke-[1.5] text-brand-pink"
                />
                <p className="text-heading-2 text-brand-pink">{item.value}</p>
                <p className="text-body-large text-pretty text-text-secondary">
                  {item.body}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export { Differential }
