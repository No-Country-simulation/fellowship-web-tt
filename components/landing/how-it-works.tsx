import { CheckIcon } from "lucide-react"
import Image from "next/image"

import { Section } from "@/components/section"
import {
  howItWorksHeading,
  howItWorksProfilePreviews,
  howItWorksProfilesHeading,
  howItWorksProfilesIntro,
  howItWorksSteps,
} from "@/lib/landing"

/**
 * Cómo funciona HF: H2 centrado, 4 pasos numerados y perfiles validados.
 * Hover CSS: card activa en cyan; pasos previos muestran check.
 */
function HowItWorks() {
  return (
    <Section
      surface="light"
      className="scroll-mt-2xl py-2xl md:py-3xl"
      id="como-funciona"
    >
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {howItWorksHeading}
        </h2>

        <ol className="how-it-works-steps grid min-w-0 sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0 gap-2 md:gap-4">
          {howItWorksSteps.map((item) => (
            <li
              key={item.step}
              className="how-it-works-step flex min-w-0 flex-col items-start gap-sm rounded-md border border-transparent p-sm"
            >
              <span
                aria-hidden
                className="how-it-works-step-icon relative flex size-10 shrink-0 items-center justify-center rounded-full text-body font-semibold"
              >
                <span className="how-it-works-step-number">{item.step}</span>
                <CheckIcon className="how-it-works-step-check size-5 stroke-[2.5]" />
              </span>
              <p className="text-body-small text-text-secondary">
                Paso {item.step}
              </p>
              <h3 className="how-it-works-step-title text-[1.25rem] font-semibold leading-[1.3] whitespace-nowrap tracking-tight text-text-primary">
                {item.title}
              </h3>
              <p className="text-body-small text-text-secondary">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-lg rounded-lg bg-accent-cyan/15 px-md py-lg md:px-xl md:py-xl">
          <div className="flex flex-col items-center gap-sm text-center">
            <h3 className="text-heading-3 text-pretty text-text-primary">
              <span className="text-brand-gradient">
                {howItWorksProfilesHeading.lead}
              </span>{" "}
              {howItWorksProfilesHeading.rest}
            </h3>
            <p className="text-body-small max-w-3xl text-text-secondary">
              {howItWorksProfilesIntro}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-3 md:gap-md *:min-w-0">
            {howItWorksProfilePreviews.map((preview) => (
              <figure key={preview.src} className="min-w-0">
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  width={preview.width}
                  height={preview.height}
                  className="h-auto w-full"
                  quality={90}
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export { HowItWorks }
