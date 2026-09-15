"use client";

import { useState } from "react";
import type { Service, ServiceInput } from "@/types/models";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function ServiceForm({
  salonId,
  initial,
  nextSortOrder,
  onSubmit,
  onCancel,
}: {
  salonId: string;
  initial?: Service;
  nextSortOrder: number;
  onSubmit: (input: ServiceInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [active, setActive] = useState(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNumber = Number(price);
    if (!name.trim() || !category.trim()) {
      setError("Name and category are required.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Enter a valid price.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || null,
        price: priceNumber,
        imageUrl,
        active,
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
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Service name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Haircut"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Hair"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Description (optional)
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Price (₹)
        <input
          type="number"
          min={0}
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          required
        />
      </label>

      <ImageUploadField
        salonId={salonId}
        folder="services"
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
          {submitting ? "Saving…" : initial ? "Save changes" : "Add service"}
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
