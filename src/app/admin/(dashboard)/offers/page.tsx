"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSalon } from "@/lib/salon/SalonContext";
import {
  addOffer,
  deleteOffer,
  listAllOffers,
  setOfferActive,
  updateOffer,
} from "@/lib/queries/offers";
import type { Offer, OfferInput } from "@/types/models";
import { OfferForm } from "@/components/admin/OfferForm";
import { formatDate, formatPrice } from "@/lib/format";

export default function OffersPage() {
  const { user } = useAuth();
  const { salon } = useSalon();
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Bumped after every mutation to re-run the effect below and refetch,
  // without the effect ever calling a function that itself sets state.
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdToken()
      .then((token) => listAllOffers(token, salon.id))
      .then((result) => {
        if (cancelled) return;
        setOffers(result);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load offers", err);
        setLoadError(err instanceof Error ? err.message : "Failed to load offers.");
      });
    return () => {
      cancelled = true;
    };
  }, [user, salon.id, reloadToken]);

  const loading = offers === null && !loadError;
  const list = offers ?? [];
  const nextSortOrder = list.length ? Math.max(...list.map((o) => o.sortOrder)) + 1 : 0;

  async function handleAdd(input: OfferInput) {
    if (!user) return;
    const token = await user.getIdToken();
    await addOffer(token, salon.id, input);
    setAdding(false);
    reload();
  }

  async function handleEdit(offerId: string, input: OfferInput) {
    if (!user) return;
    const token = await user.getIdToken();
    await updateOffer(token, salon.id, offerId, input);
    setEditingId(null);
    reload();
  }

  async function handleToggleActive(offer: Offer, active: boolean) {
    if (!user) return;
    const token = await user.getIdToken();
    await setOfferActive(token, salon.id, offer.id, active);
    reload();
  }

  async function handleDelete(offer: Offer) {
    if (!user) return;
    if (!confirm(`Delete "${offer.title}"? This can't be undone.`)) return;
    const token = await user.getIdToken();
    await deleteOffer(token, salon.id, offer.id);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Offers</h1>
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            + Add offer
          </button>
        ) : null}
      </div>

      {adding ? (
        <OfferForm
          salonId={salon.id}
          nextSortOrder={nextSortOrder}
          onSubmit={handleAdd}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      {loadError ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <span>{loadError}</span>
          <button onClick={reload} className="font-medium underline underline-offset-2">
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : list.length === 0 && !adding ? (
        <p className="text-sm text-zinc-500">No offers yet. Add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((offer) =>
            editingId === offer.id ? (
              <OfferForm
                key={offer.id}
                salonId={salon.id}
                initial={offer}
                nextSortOrder={nextSortOrder}
                onSubmit={(input) => handleEdit(offer.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={offer.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-sm text-zinc-500">
                    {offer.oldPrice ? (
                      <span className="line-through">{formatPrice(offer.oldPrice)} </span>
                    ) : null}
                    {formatPrice(offer.price)}
                    {offer.validUntil ? ` · until ${formatDate(offer.validUntil)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      checked={offer.active}
                      onChange={(e) => handleToggleActive(offer, e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    onClick={() => setEditingId(offer.id)}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
