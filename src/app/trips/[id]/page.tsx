import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Check,
  X,
  LogOut,
  Lock,
  Copy,
  Map as MapIcon,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { TripMap } from "@/components/trip-map";
import { VoteButton } from "@/components/vote-button";
import { Comments } from "@/components/comments";
import { Itinerary } from "@/components/itinerary";
import { AiGenerateItinerary } from "@/components/ai-generate-itinerary";
import { AiAssistant } from "@/components/ai-assistant";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { aiConfigured } from "@/lib/ai";
import {
  requestToJoin,
  respondToJoinRequest,
  leaveTrip,
  remixTrip,
} from "@/lib/actions/trips";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null) {
  return d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
}

export default async function TripDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const trip = await db.trip.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      memberships: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      itineraryItems: { orderBy: [{ dayIndex: "asc" }, { order: "asc" }] },
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true, image: true } } },
      },
      joinRequests: {
        where: { status: "PENDING" },
        include: { user: { select: { name: true, image: true } } },
      },
      _count: { select: { memberships: true } },
    },
  });

  if (!trip) notFound();

  const isMember = !!user && trip.memberships.some((m) => m.userId === user.id);
  const isOwner = !!user && trip.ownerId === user.id;

  // Private trips are only visible to members.
  if (trip.visibility === "PRIVATE" && !isMember) {
    return (
      <main className="min-h-screen bg-slate-50">
        {user ? <AppHeader /> : null}
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">This trip is private</h1>
          <p className="mt-2 text-slate-600">Only members can view this trip.</p>
          <Link href="/explore" className="mt-6 inline-block text-brand-600 hover:text-brand-700">
            Back to Explore
          </Link>
        </div>
      </main>
    );
  }

  const hasVoted =
    !!user &&
    (await db.vote.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: user.id } },
    })) !== null;

  const pendingRequest =
    !!user &&
    !isMember &&
    (await db.joinRequest.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: user.id } },
    }))?.status === "PENDING";

  const range =
    fmtDate(trip.startDate) && fmtDate(trip.endDate)
      ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`
      : fmtDate(trip.startDate) ?? fmtDate(trip.endDate);

  // Map markers from geocoded itinerary items.
  const mapPoints = trip.itineraryItems
    .filter((i) => i.lat != null && i.lng != null)
    .map((i) => ({ lat: i.lat as number, lng: i.lng as number, title: i.title, day: i.dayIndex }));

  const aiEnabled = aiConfigured();

  return (
    <main className="min-h-screen bg-slate-50">
      {user ? <AppHeader /> : null}

      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 sm:h-72">
        {trip.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trip.coverImage} alt={trip.title} className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl px-6 pb-6 text-white">
            {trip.destination && (
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="h-4 w-4" /> {trip.destination}
              </div>
            )}
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">{trip.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8 px-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Meta + actions */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {range && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> {range}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {trip._count.memberships} member
              {trip._count.memberships === 1 ? "" : "s"}
            </span>

            <div className="ml-auto flex items-center gap-2">
              {user && <VoteButton tripId={trip.id} votes={trip.votes} hasVoted={hasVoted} />}
            </div>
          </div>

          {/* Description */}
          <section>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">
              {trip.description}
            </p>
          </section>

          {/* Map */}
          {mapPoints.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
                <MapIcon className="h-5 w-5" /> Map
              </h2>
              <TripMap points={mapPoints} />
            </section>
          )}

          {/* AI itinerary generator (members only) */}
          {isMember && (
            <div>
              <AiGenerateItinerary tripId={trip.id} aiEnabled={aiEnabled} />
            </div>
          )}

          {/* Itinerary (optimistic add/delete + drag reorder) */}
          <Itinerary
            tripId={trip.id}
            isMember={isMember}
            initialItems={trip.itineraryItems.map((i) => ({
              id: i.id,
              dayIndex: i.dayIndex,
              title: i.title,
              place: i.place,
              time: i.time,
              notes: i.notes,
            }))}
          />

          {/* AI assistant (members only) */}
          {isMember && <AiAssistant tripId={trip.id} aiEnabled={aiEnabled} isOwner={isOwner} />}

          {/* Comments (optimistic) */}
          <Comments
            tripId={trip.id}
            currentUser={user ? { name: user.name ?? null, image: user.image ?? null } : null}
            initialComments={trip.comments.map((c) => ({
              id: c.id,
              content: c.content,
              createdLabel: c.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              author: { name: c.author.name, image: c.author.image },
            }))}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Join / membership actions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Your access
            </h3>
            <div className="mt-3">
              {isOwner ? (
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                  You own this trip
                </span>
              ) : isMember ? (
                <form action={leaveTrip.bind(null, trip.id)}>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600">
                    <LogOut className="h-4 w-4" /> Leave trip
                  </button>
                </form>
              ) : user ? (
                pendingRequest ? (
                  <span className="text-sm text-slate-500">Request pending…</span>
                ) : (
                  <form action={requestToJoin.bind(null, trip.id)}>
                    <button className="w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                      Request to join
                    </button>
                  </form>
                )
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Sign in to join
                </Link>
              )}
            </div>

            {user && (
              <form action={remixTrip.bind(null, trip.id)} className="mt-3 border-t border-slate-50 pt-3">
                <button className="flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300">
                  <Copy className="h-3.5 w-3.5" /> Remix this trip
                </button>
                <p className="mt-1.5 text-center text-xs text-slate-400">
                  Clone the itinerary into your own trip
                </p>
              </form>
            )}
          </div>

          {/* Owner: pending join requests */}
          {isOwner && trip.joinRequests.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Join requests ({trip.joinRequests.length})
              </h3>
              <div className="mt-3 space-y-3">
                {trip.joinRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    <Avatar name={req.user.name} image={req.user.image} />
                    <span className="flex-1 truncate text-sm">{req.user.name ?? "Traveler"}</span>
                    <form action={respondToJoinRequest.bind(null, req.id, true)}>
                      <button
                        title="Approve"
                        className="grid h-7 w-7 place-items-center rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={respondToJoinRequest.bind(null, req.id, false)}>
                      <button
                        title="Reject"
                        className="grid h-7 w-7 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Members
            </h3>
            <div className="mt-3 space-y-3">
              {trip.memberships.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Avatar name={m.user.name} image={m.user.image} />
                  <span className="flex-1 truncate text-sm">{m.user.name ?? "Traveler"}</span>
                  {m.role === "OWNER" && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
      />
    );
  }
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {(name ?? "U").charAt(0)}
    </div>
  );
}
