import type { MetadataRoute } from "next";
import { apiGet } from "@/lib/api";
import { SITE } from "@/lib/seo";

interface FeedEntry {
  slug: string;
  updatedAt: string;
}
interface Feed {
  products: FeedEntry[];
  categories: FeedEntry[];
}

export const revalidate = 21600; // 6h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE.url}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  let feed: Feed = { products: [], categories: [] };
  try {
    feed = await apiGet<Feed>("/feed/sitemap");
  } catch {
    return staticEntries;
  }

  const productEntries: MetadataRoute.Sitemap = feed.products.map((p) => ({
    url: `${SITE.url}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = feed.categories.map((c) => ({
    url: `${SITE.url}/category/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
