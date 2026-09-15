import type { Salon } from "@/types/models";

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

export function ContactSection({ salon }: { salon: Salon }) {
  if (!salon.phone && !salon.whatsapp && !salon.address) return null;

  return (
    <section className="border-t border-zinc-100 px-4 py-6 dark:border-zinc-800">
      <div className="flex gap-3">
        {salon.phone ? (
          <a
            href={telHref(salon.phone)}
            className="flex-1 rounded-lg bg-zinc-900 py-3 text-center font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Call
          </a>
        ) : null}
        {salon.whatsapp ? (
          <a
            href={whatsappHref(salon.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-green-600 py-3 text-center font-medium text-white"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
      {salon.address ? (
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {salon.address}
        </p>
      ) : null}
    </section>
  );
}
