"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function QRCodeCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const publicUrl = `${siteUrl}/salon/${slug}`;

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={publicUrl} size={180} />
      </div>
      <p className="break-all text-center text-sm text-zinc-500 dark:text-zinc-400">{publicUrl}</p>
      <div className="flex gap-2">
        <button
          onClick={copyLink}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          Print
        </button>
      </div>
      <p className="max-w-xs text-center text-xs text-zinc-400">
        Print this QR code and place it in your salon. It always points here — update your
        services and offers any time without reprinting it.
      </p>
    </div>
  );
}
