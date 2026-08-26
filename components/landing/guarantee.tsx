import {
  FileCheckIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UnlockIcon,
} from "lucide-react"

import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { guaranteeHeading, guaranteeItems } from "@/lib/landing"

const guaranteeIcons = [
  RefreshCwIcon,
  FileCheckIcon,
  UnlockIcon,
  ShieldCheckIcon,
] as const

/**
 * Garantía HF: H2 centrado, 4 filas con icono cyan + CTA outline.
 */
function Guarantee() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="garantia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {guaranteeHeading}
        </h2>

        <ul className="flex w-full flex-col gap-sm">
          {guaranteeItems.map((item, index) => {
            const Icon = guaranteeIcons[index]

            return (
              <li
                key={item}
                className="flex min-w-0 items-center gap-md rounded-md border border-border/60 bg-brand-gradient-secondary px-md py-md"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-cyan/10"
                >
                  <Icon className="size-5 stroke-[1.5] text-accent-cyan drop-shadow-[0_0_6px_var(--accent-cyan)]" />
                </span>
                <p className="text-body min-w-0 text-pretty text-text-primary">
                  {item}
                </p>
              </li>
            )
          })}
        </ul>

        <AdvisorCta
          variant="outline"
          className="self-start border-text-primary/80 bg-transparent text-text-primary hover:bg-text-primary/10"
        />
      </div>
    </Section>
  )
}

export { Guarantee }
