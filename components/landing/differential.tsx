import { CheckIcon } from "lucide-react"

import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { cn } from "@/lib/utils"

const traditionalItems = [
  "Mide cómo alguien se presenta, no cómo trabaja",
  "Sin evidencia de comportamiento real",
  "Decisión basada en una hora de conversación",
] as const

const noCountryItems = [
  "Semanas de comportamiento documentado",
  "Validación conductual con evidencia real",
  "Decisión basada en cómo trabaja, no cómo se presenta",
] as const

const costCopy = [
  "Una entrevista de una hora mide cómo alguien se presenta bajo presión de evaluación. No cómo trabaja bajo presión real durante semanas junto a un equipo.",
  "El CV dice lo que el candidato quiere que veas. No predice comportamiento en equipo, consistencia bajo carga o cómo reacciona cuando algo falla.",
  "El costo de una mala contratación junior — onboarding perdido, rotación, tiempo del equipo — es entre tres y seis veces el salario mensual del rol. Y es evitable.",
] as const

/**
 * Comparativa CV vs No Country (HF): card tradicional sin iconos,
 * card positiva con checks blancos y borde cyan.
 */
function Differential() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="diferencial">
      <div className="flex flex-col items-center">
        <div className="mb-xl flex flex-col items-center gap-sm text-center">
          <SectionEyebrow>El diferencial</SectionEyebrow>
          <h2 className="text-heading-2 max-w-3xl text-pretty text-text-primary">
            Por qué no alcanza con las palabras
          </h2>
        </div>

        <div className="mb-2xl flex w-full flex-wrap items-center justify-center gap-md">
          <ComparisonCard
            title="CV o entrevista tradicional"
            items={traditionalItems}
            highlighted={false}
          />
          <ComparisonCard
            title="No Country"
            items={noCountryItems}
            highlighted
          />
        </div>

        <div className="flex w-full flex-col gap-lg">
          {costCopy.map((paragraph) => (
            <p key={paragraph} className="text-body-large text-text-primary">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </Section>
  )
}

function ComparisonCard({
  title,
  items,
  highlighted,
}: {
  title: string
  items: readonly string[]
  highlighted: boolean
}) {
  return (
    <article
      className={cn(
        "flex size-80 shrink-0 flex-col justify-center gap-sm rounded-md bg-bg-surface-1 p-md backdrop-blur-sm",
        highlighted
          ? "border-2 border-solid border-accent-cyan"
          : "border-2 border-solid border-border"
      )}
    >
      <h3 className="text-heading-3 text-text-primary">{title}</h3>
      <ul className="flex flex-col gap-sm">
        {items.map((item) => (
          <li
            key={item}
            className="flex min-w-0 gap-sm text-body text-text-secondary"
          >
            {highlighted ? (
              <CheckIcon
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-text-primary"
              />
            ) : null}
            <span className="min-w-0 text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export { Differential }
