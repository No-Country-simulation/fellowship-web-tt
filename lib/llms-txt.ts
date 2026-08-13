import {
  getAnsweredFaqs,
  productFacts,
  productSummary,
  siteDescription,
  siteName,
} from "@/lib/geo";
import { getSiteUrl } from "@/lib/site";

export function getLlmsTxt(): string {
  const siteUrl = getSiteUrl();
  const facts = productFacts.map((fact) => `- ${fact}`).join("\n");
  const faqLines = getAnsweredFaqs()
    .map((faq) => `- ${faq.question} ${faq.answer}`)
    .join("\n");

  return `# ${siteName}

> ${siteDescription}

${productSummary}

Hechos del producto:

${facts}

Preguntas frecuentes:

${faqLines}

## Páginas

- [Buscar talento](${siteUrl}): Landing para empresas que contratan talento junior con evidencia real.
`;
}
