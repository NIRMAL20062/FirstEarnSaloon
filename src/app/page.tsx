import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Salon QR Menu</h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Customers scan a QR code in your salon and instantly see your services and offers — no
        app, no login, no booking required.
      </p>
      <Link
        href="/admin/login"
        className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Salon owner login
      </Link>
    </div>
  );
}
