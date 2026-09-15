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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <SalonHeader salon={salon} />
      <OffersSection offers={offers} />
      <ServicesSection services={services} />
      <ContactSection salon={salon} />
    </div>
  );
}
