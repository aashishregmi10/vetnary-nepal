import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProductsResponse {
  items: ProductCardData[];
  total: number;
  page: number;
  totalPages: number;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(sp.q || sp.sort || sp.page);
  return {
    title: "Shop All Pet Supplies",
    description: "Browse food, toys, and care essentials for dogs and cats — priced in NPR with cash on delivery across Nepal.",
    alternates: { canonical: "/products" },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const sort = sp.sort || "newest";
  const page = sp.page || "1";

  let data: ProductsResponse = { items: [], total: 0, page: 1, totalPages: 1 };
  try {
    data = await apiGet<ProductsResponse>("/products", {
      searchParams: { sort, page, q: sp.q },
    });
  } catch {
    /* fall through to the empty state below */
  }

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
      <h1 className="font-display text-3xl text-text">Shop all products</h1>
      <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted">
        Food, toys, and everyday care essentials for dogs and cats, picked for Nepali homes — every price in NPR,
        every order cash on delivery.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <p className="font-data text-xs text-muted">{data.total} products</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/products?sort=${opt.value}`}
              className={`rounded-md border px-3 py-1.5 font-data text-xs uppercase tracking-wide transition-colors ${
                sort === opt.value ? "border-accent bg-accent text-white" : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="mt-10 font-body text-muted">Couldn&apos;t sniff that one out — try a different sort or check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/products?sort=${sort}&page=${n}`}
              className={`grid size-9 place-items-center rounded-md border font-data text-sm ${
                data.page === n ? "border-accent bg-accent text-white" : "border-border text-text hover:border-accent"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
