import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSalonBySlug } from "@/lib/queries/salons";
import { getActiveServices } from "@/lib/queries/services";
import { getActiveOffers } from "@/lib/queries/offers";
import { SalonHeader } from "@/components/public/SalonHeader";
import { OffersSection } from "@/components/public/OffersSection";
import { ServicesSection } from "@/components/public/ServicesSection";
import { ContactSection } from "@/components/public/ContactSection";

// This is the page every physical QR code points to. No login, no
// booking, no payment — just the salon's current services and offers,
// read straight from Firestore. See docs/architecture.md.
//
// Always rendered per-request: services/offers change whenever the owner
// edits them, and there's no build-time Firebase project to prerender
// against anyway.
export const dynamic = "force-dynamic";

interface PageParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) return { title: "Salon not found" };
  return {
    title: salon.name,
    description: `Services and offers at ${salon.name}`,
  };
}

export default async function SalonPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const [services, offers] = await Promise.all([
    getActiveServices(salon.id),
    getActiveOffers(salon.id),
  ]);

  return (
    <div className="relative min-h-screen flex-1 overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-orange-700/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-col pb-10">
        <SalonHeader salon={salon} services={services} />
        <OffersSection offers={offers} />
        <ServicesSection services={services} />
        <ContactSection salon={salon} />
      </div>
    </div>
  );
}
