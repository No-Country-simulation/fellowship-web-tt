import { BarChart3Icon, ClockIcon } from "lucide-react"

import { Section } from "@/components/section"
import { problemHeading, problemHighlights, problemIntro } from "@/lib/landing"

const highlightIcons = [ClockIcon, BarChart3Icon] as const

/**
 * Problema HF: por qué el CV/entrevista no alcanza, dos cifras en índigo.
 */
function Problem() {
  return (
    <Section
      surface="light"
      className="scroll-mt-2xl py-2xl md:py-3xl"
      id="problema"
    >
      <div className="flex flex-col items-center gap-xl">
        <div className="flex max-w-4xl flex-col items-center gap-sm text-center">
          <h2 className="text-heading-2 text-pretty text-text-primary">
            {problemHeading}
          </h2>
          <p className="text-body-large text-pretty text-text-primary">
            {problemIntro}
          </p>
        </div>

        <div className="grid w-full min-w-0 gap-xl sm:grid-cols-2 sm:*:min-w-0">
          {problemHighlights.map((item, index) => {
            const Icon = highlightIcons[index]

            return (
              <article
                key={item.value}
                className="flex min-w-0 flex-col items-start gap-sm"
              >
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-md bg-bg-brand-subtle"
                >
                  <Icon className="size-5 stroke-[1.5] text-accent-indigo" />
                </span>
                <p className="text-heading-2 text-accent-indigo">{item.value}</p>
                <p className="text-body text-pretty text-text-secondary">
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

export { Problem }
