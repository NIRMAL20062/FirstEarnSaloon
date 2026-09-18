import type { Salon } from "@/types/models";
import { PhoneIcon, ChatIcon, MapPinIcon } from "@/components/public/icons";

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

export function ContactSection({ salon }: { salon: Salon }) {
  if (!salon.phone && !salon.whatsapp && !salon.address) return null;

  return (
    <section className="mt-2 border-t border-white/5 px-4 pt-6 pb-8">
      <div className="flex gap-3">
        {salon.phone ? (
          <a
            href={telHref(salon.phone)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-400 py-3 text-center font-semibold text-zinc-950"
          >
            <PhoneIcon className="h-4 w-4" />
            Call
          </a>
        ) : null}
        {salon.whatsapp ? (
          <a
            href={whatsappHref(salon.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 py-3 text-center font-semibold text-white"
          >
            <ChatIcon className="h-4 w-4 text-emerald-400" />
            WhatsApp
          </a>
        ) : null}
      </div>
      {salon.address ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-zinc-400">
          <MapPinIcon className="h-4 w-4 shrink-0 text-zinc-500" />
          {salon.address}
        </p>
      ) : null}
    </section>
  );
}
