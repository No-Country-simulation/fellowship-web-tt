import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { guaranteeHeading, guaranteeItems } from "@/lib/landing"

/**
 * Garantía HF: H2 centrado, 4 filas con acento cyan + CTA outline.
 */
function Guarantee() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="garantia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {guaranteeHeading}
        </h2>

        <ul className="flex w-full flex-col gap-sm">
          {guaranteeItems.map((item) => (
            <li
              key={item}
              className="flex min-w-0 items-center gap-md rounded-md bg-bg-surface-1/70 px-md py-md backdrop-blur-sm"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full bg-accent-cyan"
              />
              <p className="text-body min-w-0 text-pretty text-text-primary">
                {item}
              </p>
            </li>
          ))}
        </ul>

        <AdvisorCta variant="outline" />
      </div>
    </Section>
  )
}

export { Guarantee }
