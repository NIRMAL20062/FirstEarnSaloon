"use client";

import type { User } from "firebase/auth";
import { useState } from "react";
import { createSalon, slugify } from "@/lib/queries/salons";

export function CreateSalonForm({
  user,
  onCreated,
}: {
  user: User;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugEdited ? slug : slugify(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const finalSlug = slugify(effectiveSlug);
    if (!name.trim()) {
      setError("Salon name is required.");
      return;
    }
    if (!finalSlug) {
      setError("Enter a valid URL slug (letters, numbers, hyphens).");
      return;
    }

    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      await createSalon(token, { name: name.trim(), slug: finalSlug });
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-bold">Set up your salon</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        This creates your public QR page and admin dashboard.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Salon name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Royal Gents Salon"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Public page URL
          <div className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="text-zinc-400">/salon/</span>
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              placeholder="royal-gents-salon"
              className="min-w-0 flex-1 bg-transparent outline-none"
              required
            />
          </div>
        </label>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-zinc-900 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitting ? "Creating…" : "Create salon"}
        </button>
      </form>
    </div>
  );
}
