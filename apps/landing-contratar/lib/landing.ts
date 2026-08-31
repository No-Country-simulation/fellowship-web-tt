/**
 * Copy de secciones de la landing Empresa (HF Desktop 1440).
 * Hechos y plazos alineados a `lib/geo.ts`. No inventar respuestas de FAQ.
 */

export const problemHeading = "Por qué un CV no alcanza para contratar junior"

export const problemIntro =
  "El CV dice lo que el candidato quiere que veas. No predice comportamiento en equipo, consistencia bajo carga o cómo reacciona cuando algo falla."

export const problemHighlights = [
  {
    value: "1 hora",
    body: "Una entrevista de una hora mide cómo alguien se presenta bajo presión de evaluación. No cómo trabaja bajo presión real durante semanas junto a un equipo.",
  },
  {
    value: "3–6x",
    body: "El costo de una mala contratación junior (onboarding perdido, rotación, tiempo del equipo) es entre tres y seis veces el salario mensual del rol. Y es evitable.",
  },
] as const

export const differentialHeading = "Por qué no alcanza con las palabras"

export const differentialTraditionalItems = [
  "Mide cómo alguien se presenta, no cómo trabaja",
  "Sin evidencia de comportamiento real",
  "Decisión basada en una hora de conversación",
] as const

export const differentialNoCountryItems = [
  "Semanas de comportamiento documentado",
  "Validación conductual con evidencia real",
  "Decisión basada en cómo trabaja, no cómo se presenta",
] as const

export const differentialContrasts = [
  { from: "Se presenta", to: "Se observa" },
  { from: "Declarado", to: "Documentado" },
  { from: "1 hora", to: "Semanas" },
] as const

export const evidenceHeading =
  "Esto es lo que vas a poder ver de cada talento, antes de decidir."

export const evidenceItems = [
  {
    title: "Índice de actividad",
    body: "Presencia real semana a semana: mensajes, reuniones y conexión.",
  },
  {
    title: "Trayectoria semanal",
    body: "Cómo evoluciona el ritmo de trabajo: si acelera, cae o se recupera.",
  },
  {
    title: "Peer review",
    body: "Cómo lo describen sus compañeros después de semanas trabajando juntos.",
  },
  {
    title: "Entregables",
    body: "Lo que construyó de verdad: código, documentación y diseños.",
  },
] as const

export const howItWorksHeading =
  "Cómo incorporar un junior, de la reunión al día 1"

export const howItWorksSteps = [
  {
    step: "1",
    title: "Reunión de descubrimiento",
    body: "En 20 minutos entendemos exactamente qué perfil necesitás: rol, stack, zona horaria, urgencia, cantidad. No te mandamos un catálogo genérico. Nos aseguramos de que lo que te presentamos sea lo que buscás.",
  },
  {
    step: "2",
    title: "Catálogo curado",
    body: "En 3 a 5 días hábiles desde la reunión, preseleccionamos los perfiles de nuestro pool que mejor matchean con tu requerimiento. Solo incluimos perfiles que confirmaron disponibilidad y aceptaron el modelo. Recibís nombres, roles, datos conductuales y resúmenes de peer review, sin datos de contacto hasta confirmar el interés.",
  },
  {
    step: "3",
    title: "Entrevistas coordinadas",
    body: "Si un perfil te interesa, nosotros coordinamos la entrevista. Vos llegás con evidencia de semanas de comportamiento documentado. La conversación confirma lo que los datos ya te dijeron.",
  },
  {
    step: "4",
    title: "Onboarding en 72 horas",
    body: "Confirmado el match, el talento arranca en 72 horas desde el pago. Con garantía de reemplazo de 30 días sin costo si no funciona.",
  },
] as const

export const howItWorksProfilesHeading = {
  lead: "Perfiles validados",
  rest: "para tu búsqueda",
} as const

export const howItWorksProfilesIntro =
  "Las recomendaciones están basadas en datos reales de ejecución y comportamiento, capturados durante las simulaciones, no en CV ni entrevistas."

export const howItWorksProfilePreviews = [
  {
    src: "/product/perfil-micaela.webp",
    alt: "Ficha de candidato de Micaela Juárez, Backend Developer Jr en Argentina, con índice de actividad, peer review y proyectos en simulación",
    width: 389,
    height: 475,
  },
  {
    src: "/product/perfil-diego.webp",
    alt: "Ficha de candidato de Diego Fernández, Frontend Developer Jr en México, con métricas de simulación, soft skills y disponibilidad para entrevista",
    width: 389,
    height: 477,
  },
  {
    src: "/product/perfil-valentina.webp",
    alt: "Ficha de candidato de Valentina Rocha, QA Tester en Colombia, con reseñas, progreso entre simulaciones y proyectos",
    width: 389,
    height: 475,
  },
] as const

/**
 * Perfiles de las fichas de producto, en formato compacto para el hero.
 * Rotación CSS: una card visible a la vez, mismo lugar.
 */
export const heroValidatedProfiles = [
  {
    name: "Micaela Juárez",
    role: "Backend Developer Jr",
    country: "Argentina",
    avatar: {
      src: "/product/avatar-micaela.webp",
      width: 256,
      height: 256,
    },
    rating: 9.4,
    metrics: [
      { value: "94%", label: "Actividad" },
      { value: "3", label: "Equipos" },
      { value: "15", label: "Semanas" },
      { value: "27", label: "Reseñas" },
    ],
    peerReviews: [
      { skill: "Trabajo en equipo", score: 9.5 },
      { skill: "Proactividad", score: 9.4 },
      { skill: "Comunicación", score: 9.2 },
      { skill: "Resolución de problemas", score: 8.8 },
    ],
  },
  {
    name: "Diego Fernández",
    role: "Frontend Developer Jr",
    country: "México",
    avatar: {
      src: "/product/avatar-diego.webp",
      width: 256,
      height: 256,
    },
    rating: 9.1,
    metrics: [
      { value: "91%", label: "Actividad" },
      { value: "2", label: "Equipos" },
      { value: "10", label: "Semanas" },
      { value: "18", label: "Reseñas" },
    ],
    peerReviews: [
      { skill: "Adaptabilidad", score: 9.3 },
      { skill: "Comunicación", score: 9.0 },
      { skill: "Trabajo en equipo", score: 8.9 },
      { skill: "Liderazgo", score: 8.4 },
    ],
  },
  {
    name: "Valentina Rocha",
    role: "QA Tester",
    country: "Colombia",
    avatar: {
      src: "/product/avatar-valentina.webp",
      width: 256,
      height: 256,
    },
    rating: 9.0,
    metrics: [
      { value: "95%", label: "Actividad" },
      { value: "4", label: "Equipos" },
      { value: "20", label: "Semanas" },
      { value: "34", label: "Reseñas" },
    ],
    peerReviews: [
      { skill: "Atención al detalle", score: 9.6 },
      { skill: "Resolución de problemas", score: 9.2 },
      { skill: "Comunicación", score: 8.8 },
      { skill: "Proactividad", score: 9.0 },
    ],
  },
] as const

export const profilesHeading = "Roles junior con evidencia, en +100 países"

/** Cifras alineadas a `productFacts` en geo.ts. */
export const profileStats = [
  {
    value: "+30k",
    label: "Comunidad directa",
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

export const socialProofEyebrow = "Testimonios"

export const socialProofHeading =
  "Lo que dicen quienes ya trabajaron con nosotros"

export const socialProofQuotes = [
  {
    quote:
      "La calidad de los proyectos y el nivel de colaboración que vimos en los equipos fue excepcional. No Country ha creado un modelo único para identificar talento real.",
    name: "Amanda Gelumbauskas",
    role: "LATAM Head of Oracle Next Education",
    avatar: {
      src: "/product/avatar-amanda-gelumbauskas.svg",
      alt: "Amanda Gelumbauskas",
      width: 56,
      height: 56,
    },
    logo: {
      src: "/brand/logo-oracle-white.svg",
      alt: "ONE Oracle Next Education",
      width: 388,
      height: 208,
    },
  },
  {
    quote:
      "El nivel de innovación y la calidad de los prototipos desarrollados en solo 4 días fue impresionante. No Country ha creado un ecosistema único para conectar talento con desafíos reales.",
    name: "Jorge Cobo",
    role: "Founder",
    avatar: {
      src: "/product/avatar-jorge-cobo.svg",
      alt: "Jorge Cobo",
      width: 56,
      height: 56,
    },
    logo: {
      src: "/brand/logo-viamatica.svg",
      alt: "Viamatica",
      width: 389,
      height: 77,
    },
  },
  {
    quote:
      "La capacidad de los equipos para entregar soluciones funcionales de IA en tiempo récord demostró el nivel de talento que existe en Ecuador. Identificamos varios perfiles que se alinean con nuestras necesidades de transformación digital.",
    name: "Jorge Portalanza",
    role: "Gerente de Proyecto",
    avatar: {
      src: "/product/avatar-jorge-portalanza.svg",
      alt: "Jorge Portalanza",
      width: 56,
      height: 56,
    },
    logo: {
      src: "/brand/logo-viamatica.svg",
      alt: "Viamatica",
      width: 389,
      height: 77,
    },
  },
  {
    quote:
      "Ver a los equipos trabajar en tiempo real nos dio una perspectiva invaluable sobre cómo colaboran y resuelven problemas. Identificamos varios candidatos que se alinean perfectamente con nuestra cultura.",
    name: "Christian Velasco Argañaraz",
    role: "Head of Alura Latam",
    avatar: {
      src: "/product/avatar-christian-velasco-arganaraz.svg",
      alt: "Christian Velasco Argañaraz",
      width: 56,
      height: 56,
    },
    logo: {
      src: "/brand/logo-alura.svg",
      alt: "Alura",
      width: 75,
      height: 35,
    },
  },
] as const

export const guaranteeHeading = "Garantía de reemplazo en 30 días"

export const guaranteeItems = [
  "Reemplazo en 72 horas si el perfil no funciona en los primeros 30 días, sin costo adicional.",
  "Basado en evidencia de comportamiento real documentada durante semanas, no en un CV armado para impresionar.",
  "Al finalizar el período contratado (3 o 6 meses), el talento queda libre para incorporarlo directo, sin comisión.",
  "Ya lo conocés. Ya sabés cómo trabaja. Es el camino más seguro a una contratación permanente.",
] as const

export const faqHeading = "Preguntas frecuentes"

export const finalCtaLabel = "Agendá una reunión de 20 minutos"

export const finalCtaHeading =
  "¿Necesitás incorporar talento junior en los próximos 30 días?"

export const finalCtaNote =
  "Sin compromiso. Te contactamos para armar el catálogo."

export const leadBriefSubmitLabel = "Enviar requerimiento"

export const leadBriefRolesPlaceholder = "Frontend, Backend, UX/UI"

export const leadBriefNotesMaxLength = 600

export const leadBriefNotesLabel = "Algo más que debamos saber"

export const leadBriefNotesPlaceholder =
  "Stack, zona horaria u otro detalle del rol (opcional)"

export const leadBriefUrgencies = [
  { value: "inmediata", label: "Inmediata" },
  { value: "este-mes", label: "Este mes" },
  { value: "1-a-3-meses", label: "1 a 3 meses" },
  { value: "explorando", label: "Explorando" },
] as const
