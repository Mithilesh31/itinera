"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

function dateOrNull(v: FormDataEntryValue | null): Date | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Create a trip and redirect to its page. */
export async function createTrip(formData: FormData) {
  const user = await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !description) {
    throw new Error("Title and description are required.");
  }

  const trip = await db.trip.create({
    data: {
      title,
      description,
      destination: str(formData.get("destination")),
      coverImage: str(formData.get("coverImage")),
      startDate: dateOrNull(formData.get("startDate")),
      endDate: dateOrNull(formData.get("endDate")),
      visibility: formData.get("visibility") === "PRIVATE" ? "PRIVATE" : "PUBLIC",
      ownerId: user.id,
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  redirect(`/trips/${trip.id}`);
}

/** Toggle the current user's upvote on a trip and recompute the score. */
export async function voteTrip(tripId: string) {
  const user = await requireUser();

  const existing = await db.vote.findUnique({
    where: { tripId_userId: { tripId, userId: user.id } },
  });

  if (existing) {
    // Remove the vote and decrement the denormalized score.
    await db.$transaction([
      db.vote.delete({ where: { id: existing.id } }),
      db.trip.update({
        where: { id: tripId },
        data: { votes: { decrement: 1 } },
      }),
    ]);
  } else {
    // Add the vote and increment the denormalized score.
    await db.$transaction([
      db.vote.create({ data: { tripId, userId: user.id, value: 1 } }),
      db.trip.update({
        where: { id: tripId },
        data: { votes: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/explore");
}

/** Add a comment to a trip. Bind tripId with .bind(null, tripId). */
export async function addComment(tripId: string, formData: FormData) {
  const user = await requireUser();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await db.comment.create({
    data: { tripId, authorId: user.id, content },
  });
  revalidatePath(`/trips/${tripId}`);
}

/** Request to join a trip. */
export async function requestToJoin(tripId: string) {
  const user = await requireUser();

  const member = await db.membership.findUnique({
    where: { tripId_userId: { tripId, userId: user.id } },
  });
  if (member) return; // already a member

  await db.joinRequest.upsert({
    where: { tripId_userId: { tripId, userId: user.id } },
    update: { status: "PENDING" },
    create: { tripId, userId: user.id },
  });
  revalidatePath(`/trips/${tripId}`);
}

/** Owner approves or rejects a join request. Bind requestId + approve. */
export async function respondToJoinRequest(requestId: string, approve: boolean) {
  const user = await requireUser();

  const jr = await db.joinRequest.findUnique({
    where: { id: requestId },
    include: { trip: true },
  });
  if (!jr || jr.trip.ownerId !== user.id) {
    throw new Error("Not authorized.");
  }

  if (approve) {
    await db.membership.upsert({
      where: { tripId_userId: { tripId: jr.tripId, userId: jr.userId } },
      update: {},
      create: { tripId: jr.tripId, userId: jr.userId, role: "MEMBER" },
    });
    await db.joinRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
  } else {
    await db.joinRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
  }
  revalidatePath(`/trips/${jr.tripId}`);
}

/** Leave a trip (owners cannot leave their own trip). */
export async function leaveTrip(tripId: string) {
  const user = await requireUser();
  const trip = await db.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.ownerId === user.id) return;

  await db.membership.deleteMany({
    where: { tripId, userId: user.id },
  });
  revalidatePath(`/trips/${tripId}`);
  redirect("/dashboard");
}
