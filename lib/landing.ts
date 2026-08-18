/**
 * Copy de secciones de la landing Empresa (HF Desktop 1440).
 * Hechos y plazos alineados a `lib/geo.ts`. No inventar respuestas de FAQ.
 */

export const differentialHeading =
  "Por qué un CV no alcanza para contratar junior"

export const differentialIntro =
  "El CV dice lo que el candidato quiere que veas. No predice comportamiento en equipo, consistencia bajo carga o cómo reacciona cuando algo falla."

export const differentialHighlights = [
  {
    value: "1 hora",
    body: "Una entrevista de una hora mide cómo alguien se presenta bajo presión de evaluación. No cómo trabaja bajo presión real durante semanas junto a un equipo.",
  },
  {
    value: "3–6x",
    body: "El costo de una mala contratación junior — onboarding perdido, rotación, tiempo del equipo — es entre tres y seis veces el salario mensual del rol. Y es evitable.",
  },
] as const

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
    body: "En 3 a 5 días hábiles desde la reunión, preseleccionamos los perfiles de nuestro pool que mejor matchean con tu requerimiento. Solo incluimos perfiles que confirmaron disponibilidad y aceptaron el modelo.",
  },
  {
    step: "3",
    title: "Entrevistas coordinadas",
    body: "Si un perfil te interesa, nosotros coordinamos la entrevista. Vos llegás con evidencia de semanas de comportamiento documentado.",
  },
  {
    step: "4",
    title: "Onboarding en 72 horas",
    body: "Confirmado el match, el talento arranca en 72 horas. Garantía de reemplazo en 72 horas dentro de los primeros 30 días, sin costo adicional.",
  },
] as const

export const profilesHeading = "Roles junior con evidencia, en +100 países"

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

export const guaranteeHeading = "Garantía de reemplazo en 30 días"

export const guaranteeItems = [
  "Reemplazo en 72 horas si el perfil no funciona en los primeros 30 días, sin costo adicional.",
  "Basado en evidencia de comportamiento real documentada durante semanas — no en un CV armado para impresionar.",
  "Al finalizar el período contratado (3 o 6 meses), el talento queda libre para incorporarlo directo, sin comisión.",
  "Ya lo conocés. Ya sabés cómo trabaja. Es el camino más seguro a una contratación permanente.",
] as const

export const faqHeading = "Preguntas frecuentes"

export const finalCtaLabel = "Agendá una reunión de 20 minutos"
