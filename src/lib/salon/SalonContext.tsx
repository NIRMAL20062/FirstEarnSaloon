"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Salon } from "@/types/models";

interface SalonContextValue {
  salon: Salon;
  /** Re-fetch the salon doc (e.g. after saving settings). */
  refresh: () => void | Promise<void>;
}

const SalonContext = createContext<SalonContextValue | null>(null);

export function SalonProvider({
  salon,
  refresh,
  children,
}: SalonContextValue & { children: ReactNode }) {
  return <SalonContext.Provider value={{ salon, refresh }}>{children}</SalonContext.Provider>;
}

/** Only valid inside app/admin/(dashboard) — the layout guarantees a salon exists there. */
export function useSalon(): SalonContextValue {
  const ctx = useContext(SalonContext);
  if (!ctx) {
    throw new Error("useSalon() must be used within the admin dashboard layout");
  }
  return ctx;
}
