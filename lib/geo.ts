export const siteName = "No Country";

export const siteTitle =
  "Talento junior con evidencia real de cómo trabaja";

export const siteDescription =
  "Talento junior con semanas de comportamiento documentado en simulaciones reales — evidencia que ningún CV ni entrevista te muestra. Garantía de reemplazo en 30 días.";

export const serviceName =
  "Contratación de talento junior con evidencia real";

export const productSummary =
  "No Country ofrece a empresas talento junior con evidencia real de cómo trabaja. En lugar de decidir con un CV y una entrevista de una hora, las empresas ven semanas de comportamiento documentado en simulaciones laborales: índice de actividad, trayectoria semanal, peer review anónimo y entregables concretos.";

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
  "Evidencia conductual real antes de contratar: índice de actividad, trayectoria semanal, peer review anónimo y entregables concretos.",
  "Proceso: reunión de descubrimiento (20 min), catálogo curado, entrevistas coordinadas, onboarding en 72 horas desde el pago.",
  "Garantía de reemplazo: si el perfil no funciona en los primeros 30 días, se reemplaza en 72 horas sin costo adicional.",
  "Contratos de 3 o 6 meses. Al finalizar, el talento puede incorporarse de forma permanente sin comisión.",
  `Roles junior disponibles: ${roles.join(", ")}.`,
  `Verticales: ${verticals.join(", ")}.`,
  `Geografías con talento activo: ${countriesServed.join(", ")} y otros países.`,
  "Comunidad: más de 30.000 personas en Discord, más de 1 millón de alcance vía aliados, talento activo en más de 100 países.",
  "Más de 2.500 perfiles validados conductualmente.",
  "4 acuerdos consecutivos con Oracle Next Education.",
  `Aliados visibles en la landing: ${allies.join(", ")}.`,
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
      "LinkedIn y las bolsas muestran un CV y una entrevista. No Country entrega semanas de comportamiento documentado en simulaciones reales: índice de actividad, trayectoria semanal, peer review y entregables.",
  },
  {
    question: "¿Qué roles y niveles de seniority están disponibles?",
    answer: `Talento junior. Roles: ${roles.join(", ")}. Verticales: ${verticals.join(", ")}.`,
  },
  {
    question: "¿Cómo accedo al dashboard?",
  },
  {
    question: "¿Qué pasa si el perfil que incorporo no funciona?",
    answer:
      "Si el perfil no funciona en los primeros 30 días, se reemplaza en 72 horas sin costo adicional.",
  },
  {
    question: "¿Puedo observar a un equipo durante una simulación activa antes de decidir?",
  },
  {
    question: "¿Cuánto tiempo tarda el proceso desde la reunión hasta que el talento arranca?",
    answer:
      "Reunión de descubrimiento (20 min), catálogo curado y entrevistas coordinadas. Confirmado el match, el talento arranca en 72 horas desde el pago.",
  },
];

export function getAnsweredFaqs(): Array<Required<FaqItem>> {
  return faqs.filter((faq): faq is Required<FaqItem> => Boolean(faq.answer));
}
