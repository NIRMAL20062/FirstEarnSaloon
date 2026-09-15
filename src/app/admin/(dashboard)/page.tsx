"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSalon } from "@/lib/salon/SalonContext";
import { listAllServices } from "@/lib/queries/services";
import { listAllOffers } from "@/lib/queries/offers";
import { DashboardCard } from "@/components/admin/DashboardCard";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { salon } = useSalon();
  const [serviceCount, setServiceCount] = useState<number | null>(null);
  const [offerCount, setOfferCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user.getIdToken().then(async (token) => {
      const [services, offers] = await Promise.all([
        listAllServices(token, salon.id),
        listAllOffers(token, salon.id),
      ]);
      if (cancelled) return;
      setServiceCount(services.length);
      setOfferCount(offers.length);
    });
    return () => {
      cancelled = true;
    };
  }, [user, salon.id]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          title="Services"
          count={serviceCount ?? 0}
          unit="service"
          href="/admin/services"
          ctaLabel="Manage services"
        />
        <DashboardCard
          title="Offers"
          count={offerCount ?? 0}
          unit="offer"
          href="/admin/offers"
          ctaLabel="Manage offers"
        />
      </div>
    </div>
  );
}
