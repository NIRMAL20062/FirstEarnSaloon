"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { signOutUser } from "@/lib/auth/actions";
import type { Salon } from "@/types/models";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminHeader({ salon }: { salon: Salon }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{salon.name}</p>
          <Link
            href={`/salon/${salon.slug}`}
            target="_blank"
            className="text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            View public page ↗
          </Link>
        </div>
        <button
          onClick={async () => {
            await signOutUser();
            router.replace("/admin/login");
          }}
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </div>
      <nav className="mx-auto flex max-w-2xl gap-1 px-4 pb-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              pathname === item.href
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
