import {
  BarChart3Icon,
  FileCheckIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Section } from "@/components/section"
import { evidenceHeading, evidenceItems } from "@/lib/landing"

const featureIcons = [
  BarChart3Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  FileCheckIcon,
] as const

/**
 * Evidencia HF: H2 y 4 cards con icono, título y descripción.
 */
function Evidence() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="evidencia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {evidenceHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0">
          {evidenceItems.map((item, index) => {
            const Icon = featureIcons[index]

            return (
              <article
                key={item.title}
                className="flex min-w-0 flex-col gap-sm rounded-md border border-border/60 bg-brand-gradient-secondary p-md"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-cyan/10 text-accent-cyan"
                >
                  <Icon className="size-5 stroke-[1.5]" />
                </span>
                <h3 className="text-heading-3 text-text-primary">
                  {item.title}
                </h3>
                <p className="text-body text-text-secondary">{item.body}</p>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

export { Evidence }
