import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { apiGet, apiGetOrNull } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { itemListLd, breadcrumbLd } from "@/lib/seo";
import type { Category, ProductCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductsResponse {
  items: ProductCardData[];
  total: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

async function getCategory(slug: string) {
  return apiGetOrNull<Category>(`/categories/${slug}`, { revalidate: 3600, tags: ["categories", `category:${slug}`] });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategory(slug);
  if (!category) return {};

  const filtered = Boolean(sp.sort || sp.page);
  return {
    title: category.metaTitle || `${category.name} — Shop Online in Nepal`,
    description:
      category.metaDescription ||
      `Buy ${category.name.toLowerCase()} online in Nepal with cash on delivery to all seven provinces.`,
    alternates: { canonical: `/category/${category.slug}` },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { category: slug } = await params;
  const sp = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();

  const sort = sp.sort || "newest";
  let data: ProductsResponse = { items: [], total: 0 };
  try {
    data = await apiGet<ProductsResponse>("/products", { searchParams: { category: slug, sort } });
  } catch {
    /* empty state below */
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
      <JsonLd
        data={[
          itemListLd(category, data.items),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: category.name, path: `/category/${category.slug}` },
          ]),
        ]}
      />
      <nav className="font-data text-xs text-muted">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>{" "}
        / <span className="text-text">{category.name}</span>
      </nav>

      <h1 className="mt-3 font-display text-3xl text-text">{category.name}</h1>
      <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted">
        {category.description ||
          `PawMart stocks ${category.name.toLowerCase()} for Nepali pet parents — every price in NPR, every order cash on delivery to all seven provinces.`}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <p className="font-data text-xs text-muted">{data.total} products</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/category/${slug}?sort=${opt.value}`}
              className={`rounded-md border px-3 py-1.5 font-data text-xs uppercase tracking-wide transition-colors ${
                sort === opt.value
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="mt-10 font-body text-muted">
          Nothing on this shelf yet — check back soon or browse everything else we&apos;ve got.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
