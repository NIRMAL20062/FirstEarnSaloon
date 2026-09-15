"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSalon } from "@/lib/salon/SalonContext";
import { updateSalonSettings } from "@/lib/queries/salons";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { QRCodeCard } from "@/components/admin/QRCodeCard";

export default function SettingsPage() {
  const { user } = useAuth();
  const { salon, refresh } = useSalon();
  const [name, setName] = useState(salon.name);
  const [logoUrl, setLogoUrl] = useState(salon.logoUrl);
  const [phone, setPhone] = useState(salon.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(salon.whatsapp ?? "");
  const [address, setAddress] = useState(salon.address ?? "");
  const [openingHours, setOpeningHours] = useState(salon.openingHours ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const token = await user.getIdToken();
      await updateSalonSettings(token, salon.id, {
        name: name.trim(),
        logoUrl,
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        address: address.trim() || null,
        openingHours: openingHours.trim() || null,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">Salon settings</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Salon name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </label>

        <ImageUploadField
          salonId={salon.id}
          folder="logo"
          imageUrl={logoUrl}
          onChange={setLogoUrl}
        />

        <label className="flex flex-col gap-1 text-sm font-medium">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 90000 00000"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          WhatsApp number
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91 90000 00000"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Opening hours
          <input
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            placeholder="10:00 AM – 8:00 PM"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          QR code
        </h2>
        <QRCodeCard slug={salon.slug} />
      </div>
    </div>
  );
}
