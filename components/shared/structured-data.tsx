import { SITE_CONFIG } from "@/lib/utils";

/**
 * LocalBusiness Schema.org — injetado no <head> do layout raiz.
 * Ajuda no SEO local e no aparecimento em buscas como
 * "bronzeamento Vicente Pires".
 */
export function LocalBusinessSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    image: `${SITE_CONFIG.url}/images/logo-redondo-color.jpeg`,
    "@id": SITE_CONFIG.url,
    url: SITE_CONFIG.url,
    telephone: `+55${SITE_CONFIG.whatsapp}`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vicente Pires, Colônia Agrícola",
      addressLocality: SITE_CONFIG.city,
      addressRegion: SITE_CONFIG.state,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -15.795,
      longitude: -48.025,
    },
    sameAs: [SITE_CONFIG.instagramUrl],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "15:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

interface FAQ {
  question: string;
  answer: string;
}

export function FAQSchema({ faqs }: { faqs: FAQ[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string | null;
  publishedAt: string;
  author?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  image,
  publishedAt,
  author = "Mércia Regina",
  url,
}: ArticleSchemaProps) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : [`${SITE_CONFIG.url}/images/logo-redondo-color.jpeg`],
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/images/logo-horizontal-color.jpeg`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
