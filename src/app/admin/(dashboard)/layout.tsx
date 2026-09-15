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
  const { salon, loading: salonLoading, refresh } = useOwnerSalon(user);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/admin/login");
  }, [authLoading, user, router]);

  if (authLoading || !user || salonLoading) return <FullPageSpinner />;

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
