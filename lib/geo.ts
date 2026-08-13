export const siteName = "Fellowship";
export const alternateName = "No Country";

export const siteTitle = "Talento junior con evidencia real";

export const siteDescription =
  "Talento junior con semanas de evidencia conductual documentada en simulaciones laborales reales, antes de contratar. Garantía de reemplazo en 30 días.";

export const productSummary =
  "Fellowship es el canal de No Country para empresas. En lugar de decidir con un CV y una entrevista de una hora, las empresas ven cómo trabaja cada perfil durante semanas: índice de actividad, trayectoria semanal, peer review anónimo y entregables concretos.";

export const keywords = [
  "talento junior",
  "evidencia conductual",
  "simulaciones laborales",
  "peer review",
  "garantía de reemplazo",
  "contratar junior",
] as const;

export const productFacts = [
  "Evidencia conductual real antes de contratar, no solo lo que el candidato dice de sí mismo.",
  "Proceso: reunión de descubrimiento (20 min), catálogo curado, entrevistas coordinadas, onboarding en 72 horas desde el pago.",
  "Garantía de reemplazo: si el perfil no funciona en los primeros 30 días, se reemplaza en 72 horas sin costo adicional.",
  "Contratos de 3 o 6 meses. Al finalizar, el talento puede incorporarse de forma permanente sin comisión.",
  "Roles junior disponibles: Frontend, Backend, Full Stack, Data Scientist, UX/UI Designer, Product Manager, QA, Data Analyst, Mobile Developer.",
  "Geografías con talento activo: Argentina, Brasil, México, Colombia y otros países.",
  "Comunidad: más de 30.000 personas en Discord, más de 1 millón de alcance vía aliados, talento activo en más de 100 países.",
  "Aliados que ya confiaron en No Country: Oracle, Alura ONE.",
  "Primera conversación sin compromiso y sin costo.",
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

export const countriesServed = [
  "Argentina",
  "Brasil",
  "México",
  "Colombia",
] as const;

export type FaqItem = {
  question: string;
  answer?: string;
};

export const faqs: FaqItem[] = [
  {
    question: "¿En qué se diferencia de LinkedIn o una bolsa de empleo?",
    answer:
      "LinkedIn y las bolsas muestran un CV y una entrevista. Fellowship entrega semanas de comportamiento documentado en simulaciones reales.",
  },
  {
    question: "¿Qué roles y niveles de seniority están disponibles?",
    answer: `Talento junior. Roles: ${roles.join(", ")}.`,
  },
  {
    question: "¿Cómo accedo al dashboard?",
  },
  {
    question: "¿Qué pasa si el perfil que incorporo no funciona?",
    answer:
      "Hay garantía de reemplazo de 30 días: se reemplaza en 72 horas sin costo adicional.",
  },
  {
    question: "¿Puedo observar a un equipo durante una simulación activa antes de decidir?",
  },
  {
    question: "¿Cuánto tiempo tarda el proceso desde la reunión hasta que el talento arranca?",
    answer:
      "Tras la reunión de descubrimiento se presenta un catálogo curado y se coordinan entrevistas. Confirmado el match, el talento arranca en 72 horas desde el pago.",
  },
];

export function getAnsweredFaqs(): Array<Required<FaqItem>> {
  return faqs.filter((faq): faq is Required<FaqItem> => Boolean(faq.answer));
}
