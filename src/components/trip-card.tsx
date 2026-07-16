import Link from "next/link";
import { MapPin, ThumbsUp, Users, Calendar } from "lucide-react";

type TripCardData = {
  id: string;
  title: string;
  description: string;
  destination: string | null;
  coverImage: string | null;
  startDate: Date | null;
  endDate: Date | null;
  votes: number;
  owner: { name: string | null; image: string | null };
  _count?: { memberships?: number };
};

function formatRange(start: Date | null, end: Date | null) {
  if (!start && !end) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt((start ?? end) as Date);
}

export function TripCard({ trip }: { trip: TripCardData }) {
  const range = formatRange(trip.startDate, trip.endDate);
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
        {trip.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-brand-300">
            <MapPin className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {trip.destination && (
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-600">
            <MapPin className="h-3 w-3" /> {trip.destination}
          </div>
        )}
        <h3 className="font-semibold leading-snug">{trip.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{trip.description}</p>
        <div className="mt-4 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" /> {trip.votes}
          </span>
          {typeof trip._count?.memberships === "number" && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {trip._count.memberships}
            </span>
          )}
          {range && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {range}
            </span>
          )}
          <span className="ml-auto truncate">by {trip.owner.name ?? "Traveler"}</span>
        </div>
      </div>
    </Link>
  );
}
