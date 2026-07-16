import { Search, Compass } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TripCard } from "@/components/trip-card";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const user = await getCurrentUser();
  const q = (searchParams.q ?? "").trim();

  const trips = await db.trip.findMany({
    where: {
      visibility: "PUBLIC",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { destination: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      owner: { select: { name: true, image: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: [{ votes: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {user ? <AppHeader /> : null}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-brand-600">
          <Compass className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Explore</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">Discover trips worth taking</h1>
        <p className="mt-2 text-slate-600">
          Browse public trips shared by the community. Search by destination, title, or idea.
        </p>

        <form className="mt-6 flex max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search trips…"
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </form>

        {q && (
          <p className="mt-4 text-sm text-slate-500">
            {trips.length} result{trips.length === 1 ? "" : "s"} for “{q}”
          </p>
        )}

        <div className="mt-8">
          {trips.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
              No public trips yet. Be the first to share one!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
