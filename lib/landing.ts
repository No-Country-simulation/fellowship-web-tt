/**
 * Copy de secciones de la landing Empresa (HF Desktop 1440).
 * Hechos y plazos alineados a `lib/geo.ts`. No inventar respuestas de FAQ.
 */

export const evidenceHeading =
  "Esto es lo que vas a poder ver de cada talento — antes de decidir."

export const evidenceItems = [
  {
    title: "Índice de actividad",
    body: "Calculado semana a semana contra el pool completo. Mide presencia real — mensajes, reuniones, conexión.",
  },
  {
    title: "Trayectoria semanal",
    body: "La evolución del índice semana a semana: si mantiene el ritmo, si acelera bajo presión, si tiene caídas y cómo las recupera.",
  },
  {
    title: "Peer review",
    body: "Evaluación anónima de compañeros de equipo después de trabajar juntos bajo presión real.",
  },
  {
    title: "Entregables",
    body: "Lo que construyó concretamente — código, documentación, diseños, análisis.",
  },
] as const

export const howItWorksHeading = "Cómo funciona"

export const howItWorksSteps = [
  {
    step: "1",
    title: "Reunión de descubrimiento (20 min)",
    body: "Entendemos exactamente qué perfil necesitás — rol, stack, zona horaria, urgencia, cantidad. No te mandamos un catálogo genérico.",
  },
  {
    step: "2",
    title: "Catálogo curado",
    body: "Preseleccionamos los perfiles de nuestro pool que mejor matchean con tu requerimiento. Solo incluimos perfiles que confirmaron disponibilidad y aceptaron el modelo.",
  },
  {
    step: "3",
    title: "Entrevistas coordinadas",
    body: "Si un perfil te interesa, nosotros coordinamos la entrevista. Vos llegás con evidencia de semanas de comportamiento documentado.",
  },
  {
    step: "4",
    title: "Onboarding en 72 horas",
    body: "Confirmado el match, el talento arranca en 72 horas desde el pago. Con garantía de reemplazo de 30 días sin costo si no funciona.",
  },
] as const

export const profilesHeading = "Perfiles disponibles"

/** Cifras alineadas a `productFacts` en geo.ts. */
export const profileStats = [
  {
    value: "+30.000",
    label: "Comunidad directa en Discord",
  },
  {
    value: "+1M",
    label: "Alcance vía aliados y partners",
  },
  {
    value: "+100",
    label: "Países con talento activo",
  },
] as const

export const socialProofHeading = "No Country ya funcionó en un caso real."

export const socialProofQuote = {
  quote:
    "Oracle Next Education necesitaba conectar graduados con empresas reales — No Country nos dio evidencia de comportamiento que ningún CV mostraba.",
  name: "Amanda Gelumbauskas",
  role: "LATAM Head of Oracle Next Education",
} as const

/** Fuente visual: mockup Desktop 1440. */
export const socialProofStats = [
  {
    value: "4",
    label: "Acuerdos consecutivos con Oracle Next Education",
  },
  {
    value: "+2.500",
    label: "Perfiles validados conductualmente",
  },
] as const

export const faqHeading = "Preguntas frecuentes"

export const finalCtaLabel = "Agendá una reunión de 20 minutos"
