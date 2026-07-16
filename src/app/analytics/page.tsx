import Link from "next/link";
import {
  Users,
  Map as MapIcon,
  ThumbsUp,
  MessageSquare,
  ListChecks,
  Globe,
  TrendingUp,
  Activity,
  Trophy,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireUser();

  const [
    totalUsers,
    totalTrips,
    publicTrips,
    totalVotes,
    totalComments,
    totalItems,
    totalMemberships,
    usersActivated,
    tripsEngaged,
    recentTrips,
    topTrips,
  ] = await Promise.all([
    db.user.count(),
    db.trip.count(),
    db.trip.count({ where: { visibility: "PUBLIC" } }),
    db.vote.count(),
    db.comment.count(),
    db.itineraryItem.count(),
    db.membership.count(),
    db.user.count({ where: { memberships: { some: {} } } }),
    db.trip.count({
      where: { OR: [{ voteRecords: { some: {} } }, { comments: { some: {} } }] },
    }),
    db.trip.findMany({ select: { createdAt: true } }),
    db.trip.findMany({
      orderBy: { votes: "desc" },
      take: 5,
      include: { owner: { select: { name: true } }, _count: { select: { memberships: true } } },
    }),
  ]);

  const activationRate = totalUsers ? Math.round((usersActivated / totalUsers) * 100) : 0;
  const engagementRate = totalTrips ? Math.round((tripsEngaged / totalTrips) * 100) : 0;
  const avgMembers = totalTrips ? (totalMemberships / totalTrips).toFixed(1) : "0";

  // Trips created per day, last 14 days.
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);
  const buckets = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    };
  });
  for (const t of recentTrips) {
    const d = new Date(t.createdAt);
    d.setHours(0, 0, 0, 0);
    const b = buckets.find((x) => x.key === d.toDateString());
    if (b) b.count++;
  }
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  const kpis = [
    { label: "Users", value: totalUsers, icon: Users },
    { label: "Trips", value: totalTrips, icon: MapIcon },
    { label: "Public trips", value: publicTrips, icon: Globe },
    { label: "Upvotes", value: totalVotes, icon: ThumbsUp },
    { label: "Comments", value: totalComments, icon: MessageSquare },
    { label: "Itinerary items", value: totalItems, icon: ListChecks },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-brand-600">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Analytics</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">Product analytics</h1>
        <p className="mt-2 text-slate-600">
          How Itinera is performing — activation, engagement, and content growth at a glance.
        </p>

        {/* KPI cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <k.icon className="h-5 w-5 text-brand-500" />
              <div className="mt-3 font-display text-2xl font-semibold">{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Rate cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <RateCard
            icon={Activity}
            title="Activation rate"
            value={`${activationRate}%`}
            sub={`${usersActivated} of ${totalUsers} users joined or created a trip`}
          />
          <RateCard
            icon={ThumbsUp}
            title="Engagement rate"
            value={`${engagementRate}%`}
            sub={`${tripsEngaged} of ${totalTrips} trips have a vote or comment`}
          />
          <RateCard
            icon={Users}
            title="Avg members / trip"
            value={avgMembers}
            sub={`${totalMemberships} memberships across ${totalTrips} trips`}
          />
        </div>

        {/* Trips per day chart */}
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">Trips created — last 14 days</h2>
          <div className="mt-6 flex h-40 items-end gap-2">
            {buckets.map((b) => (
              <div key={b.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-brand-500 transition-all"
                    style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count ? "4px" : "0" }}
                    title={`${b.count} trip${b.count === 1 ? "" : "s"}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400">{b.label.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top trips leaderboard */}
        <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Trophy className="h-5 w-5 text-amber-500" /> Top trips by upvotes
          </h2>
          <div className="mt-4 divide-y divide-slate-50">
            {topTrips.map((t, i) => (
              <Link
                key={t.id}
                href={`/trips/${t.id}`}
                className="flex items-center gap-4 py-3 transition hover:opacity-80"
              >
                <span className="w-5 text-center font-display text-lg font-semibold text-slate-300">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-slate-500">
                    by {t.owner.name ?? "Traveler"} · {t._count.memberships} member
                    {t._count.memberships === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-600">
                  <ThumbsUp className="h-4 w-4" /> {t.votes}
                </span>
              </Link>
            ))}
            {topTrips.length === 0 && (
              <p className="py-3 text-sm text-slate-500">No trips yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function RateCard({
  icon: Icon,
  title,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-ink">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
