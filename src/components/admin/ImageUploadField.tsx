"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { uploadSalonImage } from "@/lib/api/images";

export function ImageUploadField({
  salonId,
  folder,
  imageUrl,
  onChange,
}: {
  salonId: string;
  folder: "services" | "offers" | "logo";
  imageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const token = await user.getIdToken();
      onChange(await uploadSalonImage(token, salonId, folder, file));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      Image (optional)
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-lg object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer text-sm font-normal text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400">
            {uploading ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
          {imageUrl ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-left text-sm font-normal text-zinc-400 hover:text-red-600"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-sm font-normal text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
