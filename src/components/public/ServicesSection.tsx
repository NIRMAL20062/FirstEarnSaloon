import type { Service } from "@/types/models";
import { formatPrice } from "@/lib/format";

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
    <section className="px-4 py-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Services
      </h2>
      <div className="flex flex-col gap-5">
        {Array.from(groups.entries()).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {category}
            </h3>
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((service) => (
                <li key={service.id} className="flex items-baseline justify-between gap-4 py-2">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.description ? (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-semibold">{formatPrice(service.price)}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
