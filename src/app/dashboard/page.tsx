import Link from "next/link";
import { Plus, Compass, MapPin } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TripCard } from "@/components/trip-card";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();

  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: {
      trip: {
        include: {
          owner: { select: { name: true, image: true } },
          _count: { select: { memberships: true } },
        },
      },
    },
    orderBy: { trip: { updatedAt: "desc" } },
  });

  const owned = memberships.filter((m) => m.role === "OWNER").map((m) => m.trip);
  const joined = memberships.filter((m) => m.role !== "OWNER").map((m) => m.trip);

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Welcome{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-slate-600">Your trips, all in one place.</p>
          </div>
          <Link
            href="/trips/new"
            className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:flex"
          >
            <Plus className="h-4 w-4" /> New trip
          </Link>
        </div>

        {/* Owned trips */}
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trips you own
          </h2>
          {owned.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {owned.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        {/* Joined trips */}
        {joined.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Trips you've joined
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {joined.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-500">
        <MapPin className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">No trips yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
        Create your first trip, or head to Explore to see what others are planning.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Create a trip
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300"
        >
          <Compass className="h-4 w-4" /> Explore
        </Link>
      </div>
    </div>
  );
}
