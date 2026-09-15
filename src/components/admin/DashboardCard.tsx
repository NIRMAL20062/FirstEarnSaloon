import Link from "next/link";

export function DashboardCard({
  title,
  count,
  unit,
  href,
  ctaLabel,
}: {
  title: string;
  count: number;
  unit: string;
  href: string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {unit}
        {count === 1 ? "" : "s"}
      </p>
      <span className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {ctaLabel} →
      </span>
    </Link>
  );
}
