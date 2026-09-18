import type { Offer } from "@/types/models";
import { formatPrice } from "@/lib/format";
import { TagIcon, ChevronRightIcon } from "@/components/public/icons";

export function OffersSection({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="px-4 py-4">
      {offers.length > 1 ? (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Special Offers
        </h2>
      ) : null}
      <div className="flex flex-col gap-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent p-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
              <TagIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-400">
                Special Offer
              </p>
              <p className="truncate font-semibold text-white">{offer.title}</p>
              {offer.description ? (
                <p className="truncate text-sm text-zinc-400">{offer.description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="text-right">
                {offer.oldPrice ? (
                  <p className="text-xs text-zinc-500 line-through">
                    {formatPrice(offer.oldPrice)}
                  </p>
                ) : null}
                <p className="text-lg font-bold text-amber-400">{formatPrice(offer.price)}</p>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
