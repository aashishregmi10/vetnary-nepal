import Link from "next/link";
import type { ProductCardData } from "@/lib/types";
import { npr, discountPct } from "@/lib/format";
import { WishlistButton } from "./WishlistButton";
import { AddToCartButton } from "./AddToCartButton";
import { ProductCover } from "./ProductCover";

export function ProductCard({ product }: { product: ProductCardData }) {
  const off = discountPct(product.price, product.comparePrice);
  const soldOut = product.stockStatus === "out-of-stock" || product.stockStatus === "discontinued";

  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-surface p-3 shadow-sm transition-colors hover:border-accent"
      title={product.name}
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`} title={product.name} className="block">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
            <ProductCover
              src={product.coverImage?.secureUrl}
              alt={`${product.name} by ${product.brand} — product photo`}
              title={product.name}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {product.stockStatus === "low-stock" && (
              <span className="absolute inset-x-0 bottom-0 bg-text/70 px-2 py-1 text-center font-body text-[11px] text-white">
                Only a few left
              </span>
            )}
            {soldOut && (
              <span className="absolute inset-x-0 bottom-0 bg-text/75 px-2 py-1 text-center font-body text-[11px] text-white">
                Out of stock
              </span>
            )}
          </div>
        </Link>

        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-sale px-2.5 py-1 font-body text-[11px] font-semibold text-white">
            {off}% OFF
          </span>
        )}
        <div className="absolute right-2 top-2">
          <WishlistButton productId={product._id} />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/products/${product.slug}`} title={product.name}>
          <h3 className="line-clamp-1 font-body text-sm font-medium text-text transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-body text-base font-bold text-accent">{npr(product.price)}</span>
          {off > 0 && product.comparePrice && (
            <span className="font-body text-xs text-muted line-through">{npr(product.comparePrice)}</span>
          )}
        </div>

        <p className="mt-1 font-body text-xs text-muted">
          {product.reviewCount > 0 ? `★ ${product.avgRating.toFixed(1)} (${product.reviewCount})` : "No reviews yet"}
        </p>

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
          full
          size="sm"
          className="mt-3"
        />
      </div>
    </article>
  );
}
