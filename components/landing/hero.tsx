import Image from "next/image"

import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"

const allies = [
  {
    src: "/brand/logo-oracle-white.svg",
    alt: "Oracle Next Education",
    width: 106,
    height: 56,
  },
  {
    src: "/brand/logo-alura.svg",
    alt: "Alura",
    width: 122,
    height: 56,
  },
  {
    src: "/brand/logo-decrypto.svg",
    alt: "Decrypto",
    width: 110,
    height: 56,
  },
  {
    src: "/brand/logo-stellar.svg",
    alt: "Stellar",
    width: 51,
    height: 56,
  },
  {
    src: "/brand/logo-tecnologico-de-monterrey.svg",
    alt: "Tecnológico de Monterrey",
    width: 212,
    height: 56,
  },
  {
    src: "/brand/logo-viamatica.svg",
    alt: "Viamatica",
    width: 196,
    height: 56,
  },
] as const

const allyTrack = [...allies, ...allies]

function AllyLogo({
  src,
  alt,
  width,
  height,
}: (typeof allies)[number]) {
  return (
    <li className="flex h-14 shrink-0 items-center justify-center px-md">
      {/* Logos blancos, sin pastilla ni borde — el carrusel vive sobre fondo oscuro. */}
      <Image
        src={encodeURI(src)}
        alt=""
        width={width}
        height={height}
        unoptimized
        className="h-8 w-auto max-w-none object-contain brightness-0 invert md:h-10"
      />
    </li>
  )
}

function AllyTrack() {
  return (
    <ul className="flex shrink-0 items-center gap-md pl-md">
      {allyTrack.map((ally, index) => (
        <AllyLogo key={`${ally.alt}-${index}`} {...ally} />
      ))}
    </ul>
  )
}

/**
 * Hero HF: pill, H1 natural, CTA gradiente, captura de índice y franja de aliados.
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
              Talento junior con{" "}
              <span className="text-brand-gradient">
                evidencia real de cómo trabaja
              </span>{" "}
              — antes de contratar.
            </h1>
            <p className="text-body-large max-w-xl text-text-secondary">
              Semanas de comportamiento documentado en simulaciones reales —
              evidencia que ningún CV ni entrevista te muestra. Con garantía
              de reemplazo en 30 días.
            </p>
            <AdvisorCta />
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-md">
            <Image
              src="/product/indice-actividad.svg"
              alt="Índice de actividad del equipo: trayectoria semanal y contribuciones en simulación"
              width={1124}
              height={723}
              unoptimized
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </Section>

      <section
        aria-label="Aliados y partners"
        className="overflow-hidden bg-transparent py-md"
      >
        <ul className="sr-only">
          {allies.map((ally) => (
            <li key={ally.alt}>{ally.alt}</li>
          ))}
        </ul>
        <div
          aria-hidden
          className="flex w-max animate-allies-marquee hover:paused focus-within:paused motion-reduce:hidden"
        >
          <AllyTrack />
          <AllyTrack />
        </div>
        <ul className="hidden flex-wrap items-center justify-center gap-md px-md motion-reduce:flex">
          {allies.map((ally) => (
            <AllyLogo key={ally.alt} {...ally} />
          ))}
        </ul>
      </section>
    </div>
  )
}

export { Hero }
