import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Demo user (same account the "demo login" uses)
  const demo = await db.user.upsert({
    where: { email: "demo@itinera.app" },
    update: {},
    create: {
      email: "demo@itinera.app",
      name: "Demo Traveler",
      image: "https://avatars.githubusercontent.com/u/0",
    },
  });

  const maya = await db.user.upsert({
    where: { email: "maya@itinera.app" },
    update: {},
    create: { email: "maya@itinera.app", name: "Maya Chen" },
  });

  const leo = await db.user.upsert({
    where: { email: "leo@itinera.app" },
    update: {},
    create: { email: "leo@itinera.app", name: "Leo Martins" },
  });

  const trips = [
    {
      owner: demo.id,
      title: "Two Weeks in Japan",
      destination: "Tokyo → Kyoto → Osaka",
      description:
        "A first-timer's loop through Japan: neon Tokyo nights, temples and gardens in Kyoto, and street food in Osaka. Built for a group of four who love food and walking.",
      coverImage:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
      votes: 42,
      days: [
        { day: 1, title: "Arrive in Tokyo", place: "Shinjuku", notes: "Check in, ramen at Ichiran, explore Shinjuku at night.", lat: 35.6938, lng: 139.7034 },
        { day: 1, title: "Shibuya Crossing", place: "Shibuya", time: "8:00 PM", lat: 35.6595, lng: 139.7005 },
        { day: 2, title: "Senso-ji Temple", place: "Asakusa", notes: "Early morning to beat crowds.", lat: 35.7148, lng: 139.7967 },
        { day: 3, title: "Bullet train to Kyoto", place: "Kyoto", notes: "Reserve seats in advance.", lat: 35.0116, lng: 135.7681 },
        { day: 4, title: "Fushimi Inari", place: "Kyoto", time: "6:30 AM", notes: "Thousands of torii gates — go at sunrise.", lat: 34.9671, lng: 135.7727 },
      ],
    },
    {
      owner: maya.id,
      title: "Iceland Ring Road",
      destination: "Reykjavík & the South Coast",
      description:
        "Seven days chasing waterfalls, black-sand beaches, and the northern lights. A campervan road trip for two.",
      coverImage:
        "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&q=80",
      votes: 38,
      days: [
        { day: 1, title: "Golden Circle", place: "Þingvellir", notes: "Geysir, Gullfoss, and the rift valley.", lat: 64.2559, lng: -21.1295 },
        { day: 2, title: "Seljalandsfoss", place: "South Coast", notes: "Walk behind the waterfall.", lat: 63.6156, lng: -19.9886 },
        { day: 3, title: "Reynisfjara Beach", place: "Vík", notes: "Black sand + basalt columns.", lat: 63.4064, lng: -19.0447 },
      ],
    },
    {
      owner: leo.id,
      title: "Lisbon & the Algarve",
      destination: "Portugal",
      description:
        "A week of pastéis de nata, tiled streets, and golden cliffs. Half city, half beach.",
      coverImage:
        "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80",
      votes: 27,
      days: [
        { day: 1, title: "Alfama walking tour", place: "Lisbon", notes: "Get lost in the old quarter.", lat: 38.7139, lng: -9.13 },
        { day: 2, title: "Belém & pastéis", place: "Belém", time: "10:00 AM", lat: 38.6972, lng: -9.2065 },
        { day: 4, title: "Drive to Lagos", place: "Algarve", notes: "Benagil sea cave by kayak.", lat: 37.1028, lng: -8.6741 },
      ],
    },
    {
      owner: demo.id,
      title: "Weekend in New York",
      destination: "NYC",
      description:
        "48 hours of museums, bagels, and skyline views. A tight, walkable itinerary for a long weekend.",
      coverImage:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
      votes: 19,
      days: [
        { day: 1, title: "The Met", place: "Upper East Side", time: "9:30 AM", lat: 40.7794, lng: -73.9632 },
        { day: 1, title: "Central Park walk", place: "Central Park", lat: 40.7829, lng: -73.9654 },
        { day: 2, title: "Brooklyn Bridge", place: "Brooklyn", notes: "Walk across at sunrise.", lat: 40.7061, lng: -73.9969 },
      ],
    },
  ];

  for (const t of trips) {
    // Avoid duplicates on re-seed by title+owner
    const existing = await db.trip.findFirst({
      where: { title: t.title, ownerId: t.owner },
    });
    if (existing) continue;

    await db.trip.create({
      data: {
        title: t.title,
        destination: t.destination,
        description: t.description,
        coverImage: t.coverImage,
        votes: t.votes,
        visibility: "PUBLIC",
        ownerId: t.owner,
        memberships: { create: { userId: t.owner, role: "OWNER" } },
        itineraryItems: {
          create: t.days.map((d, i) => ({
            dayIndex: d.day,
            title: d.title,
            place: d.place ?? null,
            time: (d as { time?: string }).time ?? null,
            notes: (d as { notes?: string }).notes ?? null,
            lat: (d as { lat?: number }).lat ?? null,
            lng: (d as { lng?: number }).lng ?? null,
            order: i,
          })),
        },
      },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
