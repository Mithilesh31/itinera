"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { callAI, extractJson } from "@/lib/ai";
import { validCoord } from "@/lib/geo";

async function assertMember(tripId: string, userId: string) {
  const m = await db.membership.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });
  if (!m) throw new Error("Only trip members can use AI on this trip.");
}

function tripContext(trip: {
  title: string;
  destination: string | null;
  startDate: Date | null;
  endDate: Date | null;
  itineraryItems: { dayIndex: number; title: string; place: string | null }[];
}) {
  const lines = trip.itineraryItems
    .slice()
    .sort((a, b) => a.dayIndex - b.dayIndex)
    .map((i) => `  Day ${i.dayIndex}: ${i.title}${i.place ? ` (${i.place})` : ""}`);
  return [
    `Trip: ${trip.title}`,
    `Destination: ${trip.destination ?? "unspecified"}`,
    trip.startDate ? `Dates: ${trip.startDate.toDateString()} – ${trip.endDate?.toDateString() ?? ""}` : "",
    lines.length ? `Itinerary:\n${lines.join("\n")}` : "No itinerary yet.",
  ]
    .filter(Boolean)
    .join("\n");
}

type GeneratedItem = {
  dayIndex?: number;
  title?: string;
  place?: string;
  time?: string;
  notes?: string;
  lat?: number;
  lng?: number;
};

/** Generate a full itinerary with AI and append it (auto-plotted on the map). */
export async function generateItinerary(tripId: string, formData: FormData) {
  const user = await requireUser();
  await assertMember(tripId, user.id);

  const trip = await db.trip.findUnique({ where: { id: tripId } });
  if (!trip) return;

  const days = Math.min(14, Math.max(1, parseInt(String(formData.get("days") ?? "3"), 10) || 3));
  const interests = String(formData.get("interests") ?? "").trim();
  const destination = trip.destination || trip.title;

  const system =
    "You are an expert travel planner. Respond with ONLY valid JSON — no prose, no code fences.";
  const prompt = `Plan a ${days}-day trip to ${destination}.${
    interests ? ` Traveler interests: ${interests}.` : ""
  }
Return a JSON array. Each element: {"dayIndex": number (1..${days}), "title": string (concise activity), "place": string (specific, mappable place name), "time": string (e.g. "9:00 AM" or ""), "notes": string (one short sentence), "lat": number (approx latitude of the place), "lng": number (approx longitude)}.
Give 3-4 items per day, sensibly ordered. Use real, well-known places with accurate coordinates.`;

  const text = await callAI({ system, prompt, maxTokens: 2000 });
  const items = extractJson<GeneratedItem[]>(text);
  if (!Array.isArray(items)) return;

  // Preserve order; append after existing items per day.
  const startOrders = new Map<number, number>();
  for (const raw of items.slice(0, 60)) {
    const dayIndex = Math.min(days, Math.max(1, Math.round(Number(raw.dayIndex) || 1)));
    const title = String(raw.title ?? "").trim().slice(0, 200);
    if (!title) continue;

    if (!startOrders.has(dayIndex)) {
      startOrders.set(dayIndex, await db.itineraryItem.count({ where: { tripId, dayIndex } }));
    }
    const order = startOrders.get(dayIndex)!;
    startOrders.set(dayIndex, order + 1);

    const coord = validCoord(raw.lat, raw.lng);
    await db.itineraryItem.create({
      data: {
        tripId,
        dayIndex,
        title,
        place: raw.place ? String(raw.place).slice(0, 200) : null,
        time: raw.time ? String(raw.time).slice(0, 40) : null,
        notes: raw.notes ? String(raw.notes).slice(0, 500) : null,
        lat: coord?.lat ?? null,
        lng: coord?.lng ?? null,
        order,
      },
    });
  }

  revalidatePath(`/trips/${tripId}`);
}

/** Answer a question about the trip. Returns the answer text. */
export async function askAssistant(tripId: string, question: string): Promise<string> {
  await requireUser();
  const q = question.trim();
  if (!q) return "";
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: { itineraryItems: { orderBy: [{ dayIndex: "asc" }, { order: "asc" }] } },
  });
  if (!trip) return "Trip not found.";

  return callAI({
    system:
      "You are a concise, practical travel assistant. Answer using the trip context; be specific and useful.",
    prompt: `Trip context:\n${tripContext(trip)}\n\nQuestion: ${q}\n\nAnswer in 2-4 short sentences.`,
    maxTokens: 500,
  });
}

/** Generate a packing list for the trip. Returns the list text. */
export async function generatePackingList(tripId: string): Promise<string> {
  await requireUser();
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: { itineraryItems: { orderBy: [{ dayIndex: "asc" }, { order: "asc" }] } },
  });
  if (!trip) return "Trip not found.";

  return callAI({
    system: "You are a travel packing expert.",
    prompt: `Based on this trip, produce a practical packing list grouped by category (e.g. Clothing, Essentials, Electronics, Documents). Use short bullet lines starting with "- ". Keep it tight.\n\n${tripContext(trip)}`,
    maxTokens: 700,
  });
}

/** Owner-only: rewrite the trip description with AI. */
export async function generateSummary(tripId: string) {
  const user = await requireUser();
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: { itineraryItems: { orderBy: [{ dayIndex: "asc" }, { order: "asc" }] } },
  });
  if (!trip) return;
  if (trip.ownerId !== user.id) throw new Error("Only the owner can rewrite the summary.");

  const text = await callAI({
    system: "You write vivid, concise travel descriptions.",
    prompt: `Write an engaging 2-3 sentence description for this trip that would make someone want to join. Return only the description text.\n\n${tripContext(trip)}`,
    maxTokens: 300,
  });

  const clean = text.trim().replace(/^["']|["']$/g, "").slice(0, 2000);
  if (clean) {
    await db.trip.update({ where: { id: tripId }, data: { description: clean } });
    revalidatePath(`/trips/${tripId}`);
  }
}
