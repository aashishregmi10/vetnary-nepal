import { Star } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { fullName: string } | null;
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="font-body text-sm text-muted">No reviews yet — be the first to share what you think.</p>;
  }

  return (
    <ul className="space-y-5">
      {reviews.map((r) => (
        <li key={r._id} className="border-b border-border pb-5 last:border-0">
          <div className="flex items-center gap-2">
            <span className="flex text-star">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-4 ${i < r.rating ? "fill-current" : "text-star-empty"}`} />
              ))}
            </span>
            <span className="font-body text-sm font-medium text-text">{r.user?.fullName || "Anonymous"}</span>
            {r.isVerifiedPurchase && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-body text-[11px] text-accent">
                Verified purchase
              </span>
            )}
          </div>
          {r.title && <p className="mt-2 font-body font-medium text-text">{r.title}</p>}
          <p className="mt-1 font-body text-sm text-muted">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}
