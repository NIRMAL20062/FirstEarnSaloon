import Image from "next/image";
import type { Salon, Service } from "@/types/models";
import { ClockIcon, MapPinIcon, ScissorsIcon } from "@/components/public/icons";

function topCategory(services: Service[]): string | null {
  if (services.length === 0) return null;
  const counts = new Map<string, number>();
  for (const service of services) {
    counts.set(service.category, (counts.get(service.category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function SalonHeader({ salon, services }: { salon: Salon; services: Service[] }) {
  const category = topCategory(services);

  return (
    <header className="flex flex-col items-center gap-4 px-4 pb-6 pt-10 text-center">
      <div className="relative">
        <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-br from-amber-400/40 to-orange-600/40 blur-md" />
        {salon.logoUrl ? (
          <Image
            src={salon.logoUrl}
            alt={`${salon.name} logo`}
            width={88}
            height={88}
            className="relative h-22 w-22 rounded-full object-cover ring-2 ring-white/10"
            priority
          />
        ) : (
          <div className="relative flex h-22 w-22 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-3xl font-semibold text-zinc-900 ring-2 ring-white/10">
            {salon.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white">{salon.name}</h1>

      {(category || salon.openingHours || salon.address) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {category ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur">
              <ScissorsIcon className="h-3.5 w-3.5 text-amber-400" />
              {category}
            </span>
          ) : null}
          {salon.openingHours ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur">
              <ClockIcon className="h-3.5 w-3.5 text-amber-400" />
              {salon.openingHours}
            </span>
          ) : null}
          {salon.address ? (
            <span className="inline-flex max-w-48 items-center gap-1.5 truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="truncate">{salon.address}</span>
            </span>
          ) : null}
        </div>
      )}
    </header>
  );
}
