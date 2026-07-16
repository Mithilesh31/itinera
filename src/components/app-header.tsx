import Link from "next/link";
import { Plane, LogOut, Plus } from "lucide-react";
import { auth, signOut } from "@/auth";

export async function AppHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Plane className="h-4 w-4" />
            </span>
            Itinera
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-slate-600 sm:flex">
            <Link href="/dashboard" className="hover:text-ink">My trips</Link>
            <Link href="/explore" className="hover:text-ink">Explore</Link>
            <Link href="/analytics" className="hover:text-ink">Analytics</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/trips/new"
            className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:flex"
          >
            <Plus className="h-3.5 w-3.5" /> New trip
          </Link>
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "You"}
              className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {(user?.name ?? "U").charAt(0)}
            </div>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              title="Sign out"
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
