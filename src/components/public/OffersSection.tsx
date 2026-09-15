import type { Offer } from "@/types/models";
import { formatPrice } from "@/lib/format";

export function OffersSection({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Special Offers
      </h2>
      <div className="flex flex-col gap-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{offer.title}</p>
                {offer.description ? (
                  <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {offer.description}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                {offer.oldPrice ? (
                  <p className="text-sm text-zinc-400 line-through">
                    {formatPrice(offer.oldPrice)}
                  </p>
                ) : null}
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {formatPrice(offer.price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
