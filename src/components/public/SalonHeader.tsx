import Image from "next/image";
import type { Salon } from "@/types/models";

export function SalonHeader({ salon }: { salon: Salon }) {
  return (
    <header className="flex flex-col items-center gap-3 px-4 pb-6 pt-8 text-center">
      {salon.logoUrl ? (
        <Image
          src={salon.logoUrl}
          alt={`${salon.name} logo`}
          width={72}
          height={72}
          className="h-18 w-18 rounded-full object-cover"
          priority
        />
      ) : (
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {salon.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{salon.name}</h1>
      {salon.openingHours ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{salon.openingHours}</p>
      ) : null}
    </header>
  );
}
