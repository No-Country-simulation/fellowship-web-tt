import Image from "next/image"

import { AdvisorCta } from "@/components/advisor-cta"
import { MediaPlaceholder } from "@/components/media-placeholder"
import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"

const allies = [
  {
    src: "/brand/logo-viamatica.png",
    alt: "Viamatica",
    width: 160,
    height: 35,
  },
  {
    src: "/brand/logo-oracle-one.png",
    alt: "Oracle Next Education",
    width: 106,
    height: 56,
  },
  {
    src: "/brand/logo-alura.png",
    alt: "Alura",
    width: 115,
    height: 56,
  },
] as const

/**
 * Hero HF: pill, H1 natural, CTA gradiente, ventana B2B y franja de aliados.
 */
function Hero() {
  return (
    <div>
      <Section className="relative py-xl md:py-2xl">
        <div className="grid min-w-0 items-center gap-xl lg:grid-cols-2 lg:*:min-w-0">
          <div className="flex min-w-0 flex-col items-start gap-md">
            <SectionEyebrow>
              Evidencia conductual real — antes de contratar
            </SectionEyebrow>
            <h1 className="text-heading-1 max-w-full text-pretty text-text-primary">
              Talento junior con evidencia real de cómo trabaja — antes de
              contratar.
            </h1>
            <p className="text-body-large max-w-xl text-text-secondary">
              Semanas de comportamiento documentado en simulaciones reales —
              evidencia que ningún CV ni entrevista te muestra. Con garantía
              de reemplazo en 30 días.
            </p>
            <AdvisorCta />
          </div>

          <div className="relative min-w-0">
            <div
              aria-hidden
              className=" pointer-events-none absolute -inset-4  "
            />
            <MediaPlaceholder
              label="Captura B2B"
              note="V1 — placeholder. Mostrar índice de actividad, trayectoria semanal y peer review. Captura B2B en V2."
              className="relative min-h-80 min-w-0"
            />
          </div>
        </div>
      </Section>

      <div className="relative">
        <div
          aria-hidden
          className="bg-landing-glow pointer-events-none absolute inset-0"
        />
        <Section className="relative py-md">
          <ul className="flex min-h-16 max-w-full flex-wrap items-center justify-center gap-xl px-lg">
            {allies.map((ally) => (
              <li key={ally.alt} className="flex-1 max-w-40 min-h-12 items-center justify-center rounded-full bg-gray-900 relative h-full">
                <Image
                  src={ally.src}
                  layout="fill"
                  objectFit="contain"
                  objectPosition="center"
                  alt={ally.alt}
                  className="p-1"
                />
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}

export { Hero }
