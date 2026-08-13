import {
  alternateName,
  countriesServed,
  getAnsweredFaqs,
  productSummary,
  siteDescription,
  siteName,
  siteTitle,
} from "@/lib/geo";
import { getSiteUrl } from "@/lib/site";

type IdRef = { "@id": string };

type OrganizationNode = {
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName: string;
  url: string;
  description: string;
  knowsAbout: string[];
};

type WebSiteNode = {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  inLanguage: string;
  description: string;
  publisher: IdRef;
};

type WebPageNode = {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  inLanguage: string;
  description: string;
  isPartOf: IdRef;
  about: IdRef;
  mainEntity: IdRef;
};

type ServiceNode = {
  "@type": "Service";
  "@id": string;
  name: string;
  serviceType: string;
  description: string;
  provider: IdRef;
  areaServed: Array<{ "@type": "Country"; name: string }>;
  audience: {
    "@type": "BusinessAudience";
    audienceType: string;
  };
};

type FaqPageNode = {
  "@type": "FAQPage";
  "@id": string;
  isPartOf: IdRef;
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

export type JsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Array<
    OrganizationNode | WebSiteNode | WebPageNode | ServiceNode | FaqPageNode
  >;
};

function getIds() {
  const siteUrl = getSiteUrl();

  return {
    siteUrl,
    organizationId: `${siteUrl}/#organization`,
    websiteId: `${siteUrl}/#website`,
    webpageId: `${siteUrl}/#webpage`,
    serviceId: `${siteUrl}/#service`,
    faqId: `${siteUrl}/#faq`,
  };
}

export function getSiteJsonLd(): JsonLdGraph {
  const { siteUrl, organizationId, websiteId } = getIds();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        alternateName,
        url: siteUrl,
        description: siteDescription,
        knowsAbout: [
          "Talento junior",
          "Evidencia conductual",
          "Simulaciones laborales",
          "Peer review",
          "Garantía de reemplazo",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteName,
        url: siteUrl,
        inLanguage: "es",
        description: siteDescription,
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function getLandingJsonLd(): JsonLdGraph {
  const { siteUrl, organizationId, websiteId, webpageId, serviceId, faqId } =
    getIds();

  const graph: JsonLdGraph["@graph"] = [
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: siteUrl,
      name: `${siteTitle} | ${siteName}`,
      inLanguage: "es",
      description: siteDescription,
      isPartOf: { "@id": websiteId },
      about: { "@id": serviceId },
      mainEntity: { "@id": serviceId },
    },
    {
      "@type": "Service",
      "@id": serviceId,
      name: "Contratación de talento junior con evidencia conductual",
      serviceType: "Staffing",
      description: productSummary,
      provider: { "@id": organizationId },
      areaServed: countriesServed.map((name) => ({
        "@type": "Country" as const,
        name,
      })),
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Empresas que buscan talento junior",
      },
    },
  ];

  const answeredFaqs = getAnsweredFaqs();
  if (answeredFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": faqId,
      isPartOf: { "@id": webpageId },
      mainEntity: answeredFaqs.map((faq) => ({
        "@type": "Question" as const,
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
