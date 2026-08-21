export const siteName = "No Country";

export const siteTitle =
  "Talento junior con evidencia real de cómo trabaja";

export const siteDescription =
  "Talento junior con semanas de comportamiento documentado en simulaciones reales — evidencia que ningún CV ni entrevista te muestra. Garantía de reemplazo en 30 días.";

export const serviceName =
  "Contratación de talento junior y junior-mid con evidencia real";

export const productSummary =
  "No Country ofrece a empresas perfiles junior y junior-mid con evidencia real de cómo trabajan. En lugar de decidir con un CV y una entrevista de una hora, las empresas ven semanas de comportamiento documentado en simulaciones laborales: índice de actividad, trayectoria semanal, peer review anónimo y entregables concretos.";

export const keywords = [
  "No Country",
  "talento junior",
  "contratar junior",
  "evidencia conductual",
  "simulaciones laborales",
  "peer review",
  "garantía de reemplazo",
] as const;

export const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack",
  "Data Scientist",
  "UX/UI Designer",
  "Product Manager",
  "QA",
  "Data Analyst",
  "Mobile Developer",
] as const;

export const verticals = [
  "Web App",
  "AI Automation",
  "Business Intelligence",
  "Mobile",
  "UX Research",
  "Data Science",
] as const;

export const countriesServed = [
  "Argentina",
  "Brasil",
  "México",
  "Colombia",
] as const;

export const allies = [
  "Viamatica",
  "Oracle Next Education",
  "Alura",
] as const;

export const productFacts = [
  "Evidencia conductual real antes de contratar: índice de actividad, trayectoria semanal, peer review anónimo y entregables concretos. El ranking se basa en semanas de comportamiento observado en equipo, no en keywords del CV.",
  "Proceso: reunión de descubrimiento (20 min), catálogo curado en 3 a 5 días hábiles, entrevistas coordinadas. Confirmado el match, el talento arranca en 72 horas desde el pago.",
  "Garantía de reemplazo en 72 horas dentro de los primeros 30 días, sin costo adicional.",
  "Contratos de 3 o 6 meses. Al finalizar, el talento puede incorporarse de forma permanente sin comisión.",
  `Pool junior y junior-mid (0 a 2 años de experiencia laboral formal) en desarrollo, diseño, datos, IA y producto. Roles: ${roles.join(", ")}.`,
  `Verticales: ${verticals.join(", ")}.`,
  `Geografías con talento activo: ${countriesServed.join(", ")} y más de 100 países.`,
  "Dashboard para empresas: companies.nocountry.tech, con email corporativo. Acceso inmediato a la simulación activa o a la más reciente completada.",
  "Si hay una simulación en curso, se puede observar la actividad de los equipos en tiempo real antes de hacer contacto.",
  "Comunidad: más de 30.000 personas en Discord, más de 1 millón de alcance vía aliados, talento activo en más de 100 países.",
  "Más de 2.500 perfiles validados conductualmente.",
  "4 acuerdos consecutivos con Oracle Next Education.",
  `Aliados: ${allies.join(", ")}.`,
  "Primera conversación: reunión de 20 minutos, sin compromiso y sin costo.",
] as const;

export type FaqItem = {
  question: string;
  answer?: string;
};

export const faqs: FaqItem[] = [
  {
    question: "¿En qué se diferencia de LinkedIn o una bolsa de empleo?",
    answer:
      "En LinkedIn ves lo que el candidato declara. En No Country ves cómo trabaja. El ranking no está basado en keywords del CV — está basado en semanas de comportamiento observado en equipo bajo presión real. No podés falsificar cinco semanas de trabajo.",
  },
  {
    question: "¿Qué roles y niveles de seniority están disponibles?",
    answer:
      "El pool incluye perfiles junior y junior-mid en roles de desarrollo, diseño, datos, IA y producto. La mayoría tiene entre 0 y 2 años de experiencia laboral formal, con formación técnica en bootcamps, universidades o programas de certificación.",
  },
  {
    question: "¿Cómo accedo al dashboard?",
    answer:
      "Creás tu cuenta en companies.nocountry.tech con tu email corporativo. El acceso es inmediato. Podés ver los perfiles de la simulación activa o la más reciente completada.",
  },
  {
    question: "¿Qué pasa si el perfil que incorporo no funciona?",
    answer:
      "Garantía de reemplazo en 72 horas dentro de los primeros 30 días. Sin costo adicional.",
  },
  {
    question: "¿Puedo observar a un equipo durante una simulación activa antes de decidir?",
    answer:
      "Sí. Si hay una simulación en curso podés acceder al dashboard y observar la actividad de los equipos en tiempo real antes de hacer cualquier contacto.",
  },
  {
    question: "¿Cuánto tiempo tarda el proceso desde la reunión hasta que el talento arranca?",
    answer:
      "Desde la reunión de descubrimiento hasta el catálogo curado: 3 a 5 días hábiles. Confirmado el match, el talento arranca en 72 horas desde el pago.",
  },
];

export function getAnsweredFaqs(): Array<Required<FaqItem>> {
  return faqs.filter((faq): faq is Required<FaqItem> => Boolean(faq.answer));
}
