import { MediaPlaceholder } from "@/components/media-placeholder"
import { Section } from "@/components/section"
import { evidenceHeading, evidenceItems } from "@/lib/landing"
import { cn } from "@/lib/utils"

const accents = [
  "bg-accent-cyan",
  "bg-accent-mint",
  "bg-accent-indigo-light",
  "bg-accent-yellow",
] as const

/**
 * Evidencia HF: H2 centrado, 4 cards cuadradas con acento + ventana B2B.
 */
function Evidence() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="evidencia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {evidenceHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0">
          {evidenceItems.map((item, index) => (
            <article
              key={item.title}
              className="flex aspect-square min-w-0 flex-col gap-sm rounded-md bg-bg-surface-1/70 p-md backdrop-blur-sm"
            >
              <span
                aria-hidden
                className={cn("size-6 shrink-0 rounded-full", accents[index])}
              />
              <h3 className="text-heading-3 text-text-primary">{item.title}</h3>
              <p className="text-body text-text-secondary">{item.body}</p>
            </article>
          ))}
        </div>

        <MediaPlaceholder
          label="Dashboard de evidencia"
          note="V1 — placeholder. Mostrar índice, trayectoria, peer review y entregables. Perfil B2B en V2."
          className="min-h-96"
        />
      </div>
    </Section>
  )
}

export { Evidence }
