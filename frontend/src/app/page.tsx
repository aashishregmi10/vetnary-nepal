import { Banknote, Truck, Package, Star, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { apiGet } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationLd, websiteLd } from "@/lib/seo";
import { npr } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

async function getFeaturedProducts() {
  try {
    const res = await apiGet<{ items: ProductCardData[] }>("/products", {
      searchParams: { sort: "newest" },
      revalidate: 300,
      tags: ["products"],
    });
    return res.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd()]} />
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-6 py-8 sm:px-8 lg:px-16 xl:px-24 md:grid-cols-12 md:py-12">
          <div className="md:col-span-7">
            <p className="font-data text-xs uppercase tracking-[0.18em] text-muted">Kathmandu · pet supplies</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.05] text-text sm:text-6xl md:text-7xl">
              Food, toys and care,
              <br />
              <span className="text-accent">delivered across Nepal.</span>
            </h1>
            <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-muted">
              A small, opinionated pet shop — handpicked food, toys, and everyday essentials for dogs and cats,
              honest prices in NPR, and cash on delivery to all seven provinces.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/products"
                className="inline-flex items-center rounded-md bg-accent px-5 py-3 font-data text-sm uppercase tracking-wide text-white transition-colors hover:bg-accent-hover"
              >
                Shop all products
              </a>
              <a
                href="/species/dogs"
                className="inline-flex items-center rounded-md border border-border px-5 py-3 font-data text-sm uppercase tracking-wide text-text transition-colors hover:border-accent hover:text-accent"
              >
                Shop for dogs
              </a>
            </div>
          </div>
          <div className="hidden md:col-span-5 md:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-sm">
              <Image
                src="/hero-pets.jpg"
                alt="A dog and cat, PawMart customers' pets, side by side"
                fill
                priority
                sizes="(max-width: 1024px) 40vw, 480px"
                className="object-cover"
              />

              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-sm">
                <Star className="size-3.5 fill-star text-star" />
                <span className="font-body text-xs font-medium text-text">4.9 · from 320 Nepali homes</span>
              </div>

              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 shadow-sm">
                <CheckCircle2 className="size-3.5 fill-accent text-white" />
                <span className="font-body text-xs font-medium text-text">Order confirmed · Bhaktapur</span>
              </div>

              <div className="absolute bottom-3 left-3 max-w-[75%] rounded-xl bg-surface p-4 shadow-sm">
                <p className="font-body text-[11px] uppercase tracking-wide text-muted">Today&apos;s pick</p>
                <p className="mt-1 font-display text-lg leading-snug text-text">Bone biscuits, freshly baked</p>
                <p className="mt-1 font-body text-sm font-bold text-accent">{npr(380)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-3 sm:px-8 lg:px-16 xl:px-24">
          <Trust icon={Banknote} title="Cash on Delivery" sub="Pay when it arrives — all 7 provinces" />
          <Trust icon={Truck} title="Reliable delivery" sub="Kathmandu Valley and beyond" />
          <Trust icon={Package} title="Carefully packed" sub="Wrapped well and shipped safely" />
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:px-16 xl:px-24">
        <h2 className="font-display text-2xl text-text">Newly in stock</h2>
        {products.length === 0 ? (
          <p className="mt-4 font-body text-muted">The shelves are being restocked — check back shortly.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Trust({ icon: Icon, title, sub }: { icon: typeof Truck; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="size-5 shrink-0 text-accent" />
      <div>
        <p className="font-data text-sm font-medium text-text">{title}</p>
        <p className="font-body text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}
