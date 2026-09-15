"use client";

import type { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { fetchMySalon } from "@/lib/queries/salons";
import type { Salon } from "@/types/models";

/**
 * Loads the salon owned by the given Firebase user (V1: one salon per
 * owner). Returns `salon: null` both while loading and when the owner
 * hasn't created a salon yet — check `loading` to tell those apart. If the
 * request fails (e.g. a server misconfiguration), `error` is set and
 * `loading` still becomes false — callers must handle `error` explicitly
 * rather than assume "not loading" means "we have an answer".
 *
 * `loading` only ever resolves once `user` is non-null: callers that pass
 * a null user (no signed-in user yet) are expected to already be gating
 * on that separately (see the admin dashboard layout).
 */
export function useOwnerSalon(user: User | null) {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped by refresh() to force the effect below to re-run and re-fetch,
  // without the effect ever calling a function that sets state directly.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdToken()
      .then(fetchMySalon)
      .then((result) => {
        if (cancelled) return;
        setSalon(result);
        setError(null);
        setHasLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load salon", err);
        setError(err instanceof Error ? err.message : "Failed to load your salon.");
        setHasLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, reloadToken]);

  const refresh = useCallback(() => {
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  return { salon, loading: !hasLoaded, error, refresh };
}
