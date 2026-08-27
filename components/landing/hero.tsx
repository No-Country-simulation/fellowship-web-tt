import Image from "next/image"

import { AdvisorCta } from "@/components/advisor-cta"
import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"

const allies = [
  {
    src: "/brand/logo-oracle-white.svg",
    alt: "Oracle Next Education",
    width: 388,
    height: 208,
    scale: 1.45,
  },
  {
    src: "/brand/logo-oracle.svg",
    alt: "Oracle",
    width: 214,
    height: 28,
    scale: 0.58,
  },
  {
    src: "/brand/logo-alura.svg",
    alt: "Alura",
    width: 75,
    height: 35,
    scale: 0.9,
  },
  {
    src: "/brand/logo-decrypto.svg",
    alt: "Decrypto",
    width: 193,
    height: 56,
    scale: 1.15,
  },
  {
    src: "/brand/logo-stellar.svg",
    alt: "Stellar",
    width: 128,
    height: 32,
    scale: 0.85,
  },
  {
    src: "/brand/logo-tecnologico-de-monterrey.svg",
    alt: "Tecnológico de Monterrey",
    width: 195,
    height: 52,
    scale: 1.1,
  },
  {
    src: "/brand/logo-viamatica.svg",
    alt: "Viamatica",
    width: 389,
    height: 77,
    scale: 1,
  },
] as const

const allyTrack = [...allies, ...allies]

function AllyLogo({
  src,
  alt,
  width,
  height,
  scale,
}: (typeof allies)[number]) {
  return (
    <li className="flex h-16 shrink-0 items-center justify-center px-md">
      <Image
        src={encodeURI(src)}
        alt=""
        width={width}
        height={height}
        unoptimized
        className="w-auto max-w-none object-contain"
        style={{ height: `calc(var(--ally-logo-h) * ${scale})` }}
      />
    </li>
  )
}

function AllyTrack() {
  return (
    <ul className="flex shrink-0 items-center gap-lg pl-lg">
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
              <span className="text-[0.78em]">Talento junior con </span>
              <span className="text-brand-gradient">evidencia real</span>
              <br />
              <span className="text-[0.78em]">antes de contratar.</span>
            </h1>
            <p className="text-body-large max-w-xl text-text-secondary">
              Cada persona fue observada trabajando en equipo durante 5
              semanas, actividad, entregas y peer reviews. Con garantía de
              reemplazo en 30 días.
            </p>
            <AdvisorCta href="#como-funciona" label="Ver cómo funciona" />
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-md">
            <Image
              src="/product/indice-actividad.webp"
              alt="Índice de actividad del equipo: trayectoria semanal y contribuciones en simulación"
              width={1124}
              height={723}
              priority
              fetchPriority="high"
              unoptimized
              className="h-auto w-full"
            />
          </div>
        </div>
      </Section>

      <section
        aria-label="Aliados y partners"
        className="overflow-hidden bg-transparent py-md [--ally-logo-h:2rem] md:[--ally-logo-h:2.5rem]"
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
        <ul className="hidden flex-wrap items-center justify-center gap-lg px-md motion-reduce:flex">
          {allies.map((ally) => (
            <AllyLogo key={ally.alt} {...ally} />
          ))}
        </ul>
      </section>
    </div>
  )
}

export { Hero }
