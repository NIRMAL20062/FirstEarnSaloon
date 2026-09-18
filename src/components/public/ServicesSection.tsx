import Image from "next/image";
import type { Service } from "@/types/models";
import { formatPrice } from "@/lib/format";
import { ScissorsIcon } from "@/components/public/icons";

function groupByCategory(services: Service[]): Map<string, Service[]> {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const list = groups.get(service.category) ?? [];
    list.push(service);
    groups.set(service.category, list);
  }
  return groups;
}

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;
  const groups = groupByCategory(services);

  return (
    <section className="px-4 py-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Services
      </h2>
      <div className="flex flex-col gap-5">
        {Array.from(groups.entries()).map(([category, items]) => (
          <div key={category}>
            {groups.size > 1 ? (
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">{category}</h3>
            ) : null}
            <ul className="flex flex-col gap-2">
              {items.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2.5"
                >
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-500">
                      <ScissorsIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{service.name}</p>
                    {service.description ? (
                      <p className="truncate text-sm text-zinc-400">{service.description}</p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-semibold text-amber-400">
                    {formatPrice(service.price)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
