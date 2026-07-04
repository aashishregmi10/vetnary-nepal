import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { apiGetOrNull } from "@/lib/api";
import { npr, discountPct } from "@/lib/format";
import { ProductCover } from "@/components/products/ProductCover";
import { WishlistButton } from "@/components/products/WishlistButton";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { JsonLd } from "@/components/ui/JsonLd";
import { productLd, breadcrumbLd } from "@/lib/seo";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { Star } from "lucide-react";
import type { ProductDetail } from "@/lib/types";

async function getProduct(slug: string) {
  return apiGetOrNull<ProductDetail>(`/products/${slug}`, { revalidate: 300, tags: [`product:${slug}`] });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};

  const soldOut = product.stockStatus === "out-of-stock" || product.stockStatus === "discontinued";
  return {
    title: product.metaTitle || `${product.name} — ${npr(product.price)}`,
    description:
      product.metaDescription ||
      `Buy ${product.name} by ${product.brand} online in Nepal for ${npr(product.price)}. ${
        soldOut ? "Currently out of stock — see similar products." : "In stock, cash on delivery across Nepal."
      }`,
    alternates: { canonical: `/products/${product.slug}` },
    robots: soldOut ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const soldOut = product.stockStatus === "out-of-stock" || product.stockStatus === "discontinued";
  const off = discountPct(product.price, product.comparePrice);

  const specs: [string, string | undefined][] = [
    ["Brand", product.brand],
    ["Weight", product.specifications?.weight],
    ["Suitable for", product.specifications?.suitableFor],
    ["Ingredients", product.specifications?.ingredients],
    ["Material", product.specifications?.material],
    ["Country of origin", product.specifications?.countryOfOrigin],
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
      <JsonLd
        data={[
          productLd(product),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: product.category.name, path: `/category/${product.category.slug}` },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <nav className="font-data text-xs text-muted">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/category/${product.category.slug}`} className="hover:text-accent">
          {product.category.name}
        </Link>{" "}
        / <span className="text-text">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
            <ProductCover
              src={product.coverImage?.secureUrl}
              alt={`${product.name} by ${product.brand} — product photo`}
              title={product.name}
              sizes="(max-width: 768px) 90vw, 40vw"
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-7">
          <p className="font-data text-xs uppercase tracking-wide text-accent">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl leading-snug text-text sm:text-4xl">{product.name}</h1>

          {product.reviewCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 font-data text-sm text-muted">
              <Star className="size-4 fill-star text-star" />
              {product.avgRating.toFixed(1)} <span>({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* BLUF — a short, extractable summary before any other copy on the page. */}
          <p className="mt-4 max-w-2xl font-body text-lg leading-relaxed text-muted">
            {product.shortDescription ||
              `${product.name} by ${product.brand} is a ${product.species} product suited for ${
                product.specifications?.suitableFor?.toLowerCase() || "everyday use"
              }, priced at ${npr(product.price)} with cash on delivery across Nepal.`}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-data text-2xl font-semibold text-accent">{npr(product.price)}</span>
            {off > 0 && product.comparePrice && (
              <>
                <span className="font-data text-base text-muted line-through">{npr(product.comparePrice)}</span>
                <span className="rounded-full bg-sale px-2.5 py-1 font-data text-[10px] font-semibold uppercase text-white">
                  -{off}%
                </span>
              </>
            )}
          </div>

          <p className="mt-2 font-data text-sm text-muted">
            {soldOut ? <span className="text-sale">Currently out of stock</span> : "In stock — cash on delivery"}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <AddToCartButton
              product={{
                productId: product._id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                coverImage: product.coverImage?.secureUrl,
                price: product.price,
              }}
              disabled={soldOut}
              className="flex-1 sm:flex-none"
            />
            <WishlistButton productId={product._id} className="border border-border" />
          </div>

          {product.description && (
            <p className="mt-8 max-w-2xl border-t border-border pt-6 font-body leading-relaxed text-text">
              {product.description}
            </p>
          )}

          <section aria-label="Product specifications" className="mt-8 border-t border-border pt-6">
            <h2 className="font-display text-xl text-text">Specifications</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {specs
                .filter(([, v]) => v !== undefined && v !== "")
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border/60 py-1.5">
                    <dt className="font-body text-sm text-muted">{k}</dt>
                    <dd className="font-data text-sm text-text">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <ProductReviews slug={product.slug} />
        </div>
      </div>
    </div>
  );
}
