import type { ProductDetail, ProductCardData, Category } from "./types";

const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010";

export const SITE = {
  name: "PawMart",
  url,
  description:
    "PawMart is a Nepali pet shop for food, toys, and care essentials — honest prices in NPR and cash on delivery across all seven provinces.",
  locale: "en_NP",
  email: "hello@pawmart.example",
};

const abs = (path: string) => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    areaServed: { "@type": "Country", name: "Nepal" },
    currenciesAccepted: "NPR",
    paymentAccepted: "Cash on Delivery",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kathmandu",
      addressCountry: "NP",
    },
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

function availability(status: string) {
  return status === "out-of-stock" || status === "discontinued"
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
}

export function productLd(product: ProductDetail) {
  const priceValid = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 300),
    sku: product._id,
    brand: { "@type": "Brand", name: product.brand },
    image: product.coverImage?.secureUrl ? [product.coverImage.secureUrl] : undefined,
    offers: {
      "@type": "Offer",
      url: abs(`/products/${product.slug}`),
      priceCurrency: "NPR",
      price: product.price,
      priceValidUntil: priceValid,
      availability: availability(product.stockStatus),
      seller: { "@type": "Organization", name: SITE.name },
      acceptedPaymentMethod: "Cash on Delivery",
    },
  };
  if (product.reviewCount > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
    };
  }
  return ld;
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function itemListLd(category: Pick<Category, "name" | "slug">, products: ProductCardData[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} — PawMart`,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: abs(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}

export function faqLd(qas: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  };
}
