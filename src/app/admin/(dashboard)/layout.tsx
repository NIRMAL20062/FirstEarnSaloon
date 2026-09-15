"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOwnerSalon } from "@/lib/hooks/useOwnerSalon";
import { SalonProvider } from "@/lib/salon/SalonContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateSalonForm } from "@/components/admin/CreateSalonForm";
import { FullPageSpinner } from "@/components/admin/FullPageSpinner";

// Gate for everything under /admin except /admin/login (which lives outside
// this route group precisely so it isn't wrapped by this layout).
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { salon, loading: salonLoading, error: salonError, refresh } = useOwnerSalon(user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  if (authLoading || !user || salonLoading) return <FullPageSpinner />;

  // Check this before `!salon` — otherwise a failed request looks
  // identical to "you haven't created a salon yet" and risks the owner
  // creating a second one on top of an existing salon that just failed to
  // load (e.g. because the server is missing an env var).
  if (salonError) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-medium">Couldn&apos;t load your salon</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{salonError}</p>
        <button
          onClick={refresh}
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!salon) {
    return <CreateSalonForm user={user} onCreated={refresh} />;
  }

  return (
    <SalonProvider salon={salon} refresh={refresh}>
      <div className="min-h-screen">
        <AdminHeader salon={salon} />
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </div>
    </SalonProvider>
  );
}
