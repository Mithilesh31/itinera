"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

/** Best-effort geocoding via OpenStreetMap Nominatim (no API key required). */
async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Itinera/1.0 (portfolio demo)" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (Array.isArray(data) && data.length) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  } catch {
    // ignore — geocoding is optional
  }
  return null;
}

async function assertMember(tripId: string, userId: string) {
  const membership = await db.membership.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!membership) throw new Error("Only trip members can edit the itinerary.");
}

/** Add an itinerary item. Bind tripId with .bind(null, tripId). */
export async function addItineraryItem(tripId: string, formData: FormData) {
  const user = await requireUser();
  await assertMember(tripId, user.id);

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const dayIndex = Math.max(1, parseInt(String(formData.get("dayIndex") ?? "1"), 10) || 1);
  const place = str(formData.get("place"));
  const time = str(formData.get("time"));
  const notes = str(formData.get("notes"));

  const order = await db.itineraryItem.count({ where: { tripId, dayIndex } });

  // Save the item first so it persists immediately, then fill in map coords.
  const created = await db.itineraryItem.create({
    data: { tripId, dayIndex, title, place, time, notes, order },
  });

  if (place) {
    const trip = await db.trip.findUnique({ where: { id: tripId } });
    const geo =
      (await geocode(trip?.destination ? `${place}, ${trip.destination}` : place)) ??
      (await geocode(place));
    if (geo) {
      await db.itineraryItem.update({
        where: { id: created.id },
        data: { lat: geo.lat, lng: geo.lng },
      });
    }
  }

  revalidatePath(`/trips/${tripId}`);
}

/** Delete an itinerary item. Bind itemId with .bind(null, itemId). */
export async function deleteItineraryItem(itemId: string) {
  const user = await requireUser();
  const item = await db.itineraryItem.findUnique({ where: { id: itemId } });
  if (!item) return;
  await assertMember(item.tripId, user.id);

  await db.itineraryItem.delete({ where: { id: itemId } });
  revalidatePath(`/trips/${item.tripId}`);
}
