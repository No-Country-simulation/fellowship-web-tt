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
    body: "El costo de una mala contratación junior — onboarding perdido, rotación, tiempo del equipo — es entre tres y seis veces el salario mensual del rol. Y es evitable.",
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
  "Esto es lo que vas a poder ver de cada talento — antes de decidir."

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

export const evidenceMetricHighlights = [
  {
    label: "Índice de actividad",
    value: "97",
    suffix: "/100",
    footer: "Calculado sobre los 248 participantes de esta simulación",
    glow: "bg-accent-indigo",
  },
  {
    label: "Pool de la simulación",
    value: "248",
    suffix: "participantes",
    footer: "Distribuidos en 31 equipos activos",
    glow: "bg-accent-cyan",
  },
  {
    label: "Peer review promedio",
    value: "9.2",
    suffix: "/10",
    footer: "7 reseñas de tus compañeros de equipo",
    glow: "bg-accent-mint",
    starred: true,
  },
] as const

export const evidenceMetricStats = [
  {
    value: "27",
    label: "Reuniones asistidas",
    footer: "Durante las 4 semanas de simulación",
    accent: "cyan",
  },
  {
    value: "486",
    label: "Mensajes enviados",
    footer: "En canales del equipo",
    accent: "pink",
  },
  {
    value: "32h 15m",
    label: "Tiempo en reuniones",
    footer: "Acumulado en las 4 semanas",
    accent: "indigo",
  },
] as const

export const evidenceStrengths = [
  {
    quote:
      "Su capacidad para tomar feedback y iterar rápido sobre el diseño fue clave para llegar a tiempo al handoff.",
    source: "Compañero/a de Back-End - anónimo",
  },
  {
    quote:
      "Muy generosa compartiendo conocimiento de Figma con el resto del equipo, incluso fuera de su rol.",
    source: "Compañero/a de QA Tester - anónimo",
  },
  {
    quote:
      "Excelente comunicación de las decisiones de diseño — siempre explica el «por qué», no solo el «qué».",
    source: "Compañero/a de Front-End - anónimo",
  },
  {
    quote:
      "Sostuvo el ritmo del equipo en las semanas de más carga, dando el ejemplo con su propia dedicación.",
    source: "Compañero/a de Team Leader - anónimo",
  },
] as const

export const evidenceImprovements = [
  {
    quote:
      "Podría delegar más tareas de detalle visual para enfocarse en las decisiones de mayor impacto.",
    source: "Compañero/a de Team Leader - anónimo",
  },
  {
    quote:
      "A veces tarda en responder mensajes fuera del horario de las ceremonias — ayudaría ser más ágil ahí.",
    source: "Compañero/a de Back-End - anónimo",
  },
  {
    quote:
      "Podría involucrar antes a QA en el proceso de diseño para detectar edge cases más temprano.",
    source: "Compañero/a de QA Tester - anónimo",
  },
] as const

export const howItWorksHeading =
  "Cómo incorporar un junior, de la reunión al día 1"

export const howItWorksSteps = [
  {
    step: "1",
    title: "Reunión de descubrimiento (20 min)",
    body: "Entendemos exactamente qué perfil necesitás — rol, stack, zona horaria, urgencia, cantidad. No te mandamos un catálogo genérico. Nos aseguramos de que lo que te presentamos sea lo que buscás.",
  },
  {
    step: "2",
    title: "Catálogo curado",
    body: "En 3 a 5 días hábiles desde la reunión, preseleccionamos los perfiles de nuestro pool que mejor matchean con tu requerimiento. Solo incluimos perfiles que confirmaron disponibilidad y aceptaron el modelo. Recibís nombres, roles, datos conductuales y resúmenes de peer review — sin datos de contacto hasta confirmar el interés.",
  },
  {
    step: "3",
    title: "Entrevistas coordinadas",
    body: "Si un perfil te interesa, nosotros coordinamos la entrevista. Vos llegás con evidencia de semanas de comportamiento documentado — la conversación confirma lo que los datos ya te dijeron.",
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
  "Las recomendaciones están basadas en datos reales de ejecución y comportamiento, capturados durante las simulaciones — no en CV ni entrevistas."

export const howItWorksProfilePreviews = [
  {
    src: "/product/perfil-micaela.svg",
    alt: "Perfil validado de Micaela Juárez, Backend Developer Jr, con índice de actividad, peer review y proyectos en simulación",
    width: 225,
    height: 272,
  },
  {
    src: "/product/perfil-diego.svg",
    alt: "Perfil validado de Diego Fernández, con métricas de simulación, soft skills y disponibilidad para entrevista",
    width: 225,
    height: 272,
  },
  {
    src: "/product/perfil-valentina.svg",
    alt: "Perfil validado de Valentina Rocha, con reseñas, progreso entre simulaciones y proyectos",
    width: 225,
    height: 272,
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

export const socialProofEyebrow = "Caso de éxito"

export const socialProofHeading = "No Country ya funcionó en un caso real."

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
      width: 106,
      height: 56,
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
      width: 196,
      height: 56,
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
      width: 196,
      height: 56,
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
      width: 122,
      height: 56,
    },
  },
] as const

/** Fuente visual: mockup Desktop 1440. */
export const socialProofStats = [
  {
    value: "4",
    label: "Acuerdos consecutivos con partners corporativos",
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
