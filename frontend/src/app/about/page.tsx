import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PawMart",
  description:
    "PawMart is a small, opinionated pet shop in Kathmandu — handpicked food, toys, and care essentials, honest prices in NPR, and cash on delivery across all seven provinces.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-data text-xs uppercase tracking-wide text-accent">Our story</p>
      <h1 className="mt-3 font-display text-4xl text-text">A pet shop that actually knows what it's selling.</h1>

      <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-muted">
        PawMart started because we were tired of guessing whether a bag of kibble on a marketplace listing was
        actually in stock, actually fresh, or actually going to show up. We pick every product ourselves, price it
        honestly in NPR, and ship it cash-on-delivery to all seven provinces.
      </p>

      <div className="mt-10 space-y-6 border-t border-border pt-8 font-body leading-relaxed text-text">
        <p>
          We're based in Kathmandu and started small on purpose — a tight catalog of food, toys, and everyday care
          essentials for dogs and cats, chosen because we'd actually give them to our own pets. No mystery brands,
          no expired stock, no guessing games.
        </p>
        <p>
          Every order ships cash on delivery, because we know that's what works for most of Nepal right now. As we
          grow, we're adding more species, more brands, and more of the things pet parents actually ask us for.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8 text-center">
        <Stat value="7" label="Provinces delivered" />
        <Stat value="100%" label="Cash on delivery" />
        <Stat value="NPR" label="Honest pricing" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-accent">{value}</p>
      <p className="mt-1 font-body text-sm text-muted">{label}</p>
    </div>
  );
}
