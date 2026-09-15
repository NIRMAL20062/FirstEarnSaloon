"use client";

import { useState } from "react";
import type { Offer, OfferInput } from "@/types/models";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

function toDateInputValue(epochMs: number | null): string {
  if (epochMs === null) return "";
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function OfferForm({
  salonId,
  initial,
  nextSortOrder,
  onSubmit,
  onCancel,
}: {
  salonId: string;
  initial?: Offer;
  nextSortOrder: number;
  onSubmit: (input: OfferInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice ? String(initial.oldPrice) : "");
  const [validUntil, setValidUntil] = useState(toDateInputValue(initial?.validUntil ?? null));
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [active, setActive] = useState(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNumber = Number(price);
    const oldPriceNumber = oldPrice.trim() ? Number(oldPrice) : null;

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Enter a valid offer price.");
      return;
    }
    if (oldPriceNumber !== null && (!Number.isFinite(oldPriceNumber) || oldPriceNumber < priceNumber)) {
      setError("Original price should be greater than the offer price.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        price: priceNumber,
        oldPrice: oldPriceNumber,
        imageUrl,
        active,
        validUntil: validUntil ? new Date(validUntil).getTime() : null,
        sortOrder: initial?.sortOrder ?? nextSortOrder,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Offer title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Haircut + Beard Combo"
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Description (optional)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Original price (₹, optional)
          <input
            type="number"
            min={0}
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Offer price (₹)
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Valid until (optional)
        <input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <ImageUploadField
        salonId={salonId}
        folder="offers"
        imageUrl={imageUrl}
        onChange={setImageUrl}
      />

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Visible on public page
      </label>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Saving…" : initial ? "Save changes" : "Add offer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
