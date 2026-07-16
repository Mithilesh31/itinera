import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

type Day = {
  day: number;
  title: string;
  place?: string;
  time?: string;
  notes?: string;
  lat?: number;
  lng?: number;
};

type TripDef = {
  ownerKey: string;
  createdDaysAgo: number;
  title: string;
  destination: string;
  description: string;
  coverImage: string;
  votesFrom: string[]; // user keys who upvoted
  comments: { by: string; text: string }[];
  days: Day[];
};

async function main() {
  // --- Users ---
  const userDefs: { key: string; email: string; name: string; image?: string }[] = [
    { key: "demo", email: "demo@itinera.app", name: "Demo Traveler", image: "https://avatars.githubusercontent.com/u/0" },
    { key: "maya", email: "maya@itinera.app", name: "Maya Chen" },
    { key: "leo", email: "leo@itinera.app", name: "Leo Martins" },
    { key: "ana", email: "ana@itinera.app", name: "Ana Ferreira" },
    { key: "sam", email: "sam@itinera.app", name: "Sam Whitfield" },
    { key: "priya", email: "priya@itinera.app", name: "Priya Nair" },
    { key: "tom", email: "tom@itinera.app", name: "Tom Becker" },
    { key: "yuki", email: "yuki@itinera.app", name: "Yuki Tanaka" },
  ];

  const users: Record<string, { id: string }> = {};
  for (const u of userDefs) {
    users[u.key] = await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, image: u.image },
    });
  }

  const trips: TripDef[] = [
    {
      ownerKey: "demo",
      createdDaysAgo: 12,
      title: "Two Weeks in Japan",
      destination: "Tokyo → Kyoto → Osaka",
      description:
        "A first-timer's loop through Japan: neon Tokyo nights, temples and gardens in Kyoto, and street food in Osaka. Built for a group of four who love food and walking.",
      coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
      votesFrom: ["maya", "leo", "ana", "sam", "priya", "tom", "yuki"],
      comments: [
        { by: "maya", text: "Adding Teamlab Planets — it books out fast, reserve early!" },
        { by: "leo", text: "Osaka street food day is the best call. Get takoyaki at Dotonbori." },
      ],
      days: [
        { day: 1, title: "Arrive in Tokyo", place: "Shinjuku", notes: "Ramen at Ichiran, explore Shinjuku at night.", lat: 35.6938, lng: 139.7034 },
        { day: 1, title: "Shibuya Crossing", place: "Shibuya", time: "8:00 PM", lat: 35.6595, lng: 139.7005 },
        { day: 2, title: "Senso-ji Temple", place: "Asakusa", notes: "Early morning to beat crowds.", lat: 35.7148, lng: 139.7967 },
        { day: 3, title: "Bullet train to Kyoto", place: "Kyoto", notes: "Reserve seats in advance.", lat: 35.0116, lng: 135.7681 },
        { day: 4, title: "Fushimi Inari", place: "Kyoto", time: "6:30 AM", notes: "Thousands of torii gates.", lat: 34.9671, lng: 135.7727 },
      ],
    },
    {
      ownerKey: "maya",
      createdDaysAgo: 10,
      title: "Iceland Ring Road",
      destination: "Reykjavík & the South Coast",
      description:
        "Seven days chasing waterfalls, black-sand beaches, and the northern lights. A campervan road trip for two.",
      coverImage: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&q=80",
      votesFrom: ["demo", "leo", "sam", "priya", "yuki"],
      comments: [{ by: "tom", text: "Reynisfjara sneaker waves are no joke — keep your distance." }],
      days: [
        { day: 1, title: "Golden Circle", place: "Þingvellir", notes: "Geysir, Gullfoss, rift valley.", lat: 64.2559, lng: -21.1295 },
        { day: 2, title: "Seljalandsfoss", place: "South Coast", notes: "Walk behind the waterfall.", lat: 63.6156, lng: -19.9886 },
        { day: 3, title: "Reynisfjara Beach", place: "Vík", notes: "Black sand + basalt columns.", lat: 63.4064, lng: -19.0447 },
      ],
    },
    {
      ownerKey: "leo",
      createdDaysAgo: 8,
      title: "Lisbon & the Algarve",
      destination: "Portugal",
      description:
        "A week of pastéis de nata, tiled streets, and golden cliffs. Half city, half beach.",
      coverImage: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80",
      votesFrom: ["demo", "ana", "priya"],
      comments: [{ by: "ana", text: "Take the tram 28 early, it's packed by 10am." }],
      days: [
        { day: 1, title: "Alfama walking tour", place: "Lisbon", notes: "Get lost in the old quarter.", lat: 38.7139, lng: -9.13 },
        { day: 2, title: "Belém & pastéis", place: "Belém", time: "10:00 AM", lat: 38.6972, lng: -9.2065 },
        { day: 4, title: "Drive to Lagos", place: "Algarve", notes: "Benagil sea cave by kayak.", lat: 37.1028, lng: -8.6741 },
      ],
    },
    {
      ownerKey: "ana",
      createdDaysAgo: 7,
      title: "Bali Slow Travel",
      destination: "Ubud & the East Coast",
      description:
        "Ten unhurried days: rice terraces, temple mornings, and quiet beaches away from the crowds.",
      coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
      votesFrom: ["demo", "maya", "sam", "yuki"],
      comments: [{ by: "priya", text: "Tegallalang at sunrise is magic and empty." }],
      days: [
        { day: 1, title: "Tegallalang Rice Terraces", place: "Ubud", time: "6:00 AM", lat: -8.4312, lng: 115.2777 },
        { day: 2, title: "Tirta Empul Temple", place: "Tampaksiring", lat: -8.4156, lng: 115.3153 },
        { day: 4, title: "Sidemen Valley", place: "Sidemen", notes: "Slow mornings, rice-field walks.", lat: -8.4667, lng: 115.45 },
      ],
    },
    {
      ownerKey: "sam",
      createdDaysAgo: 5,
      title: "Peru: Cusco to Machu Picchu",
      destination: "Sacred Valley & Machu Picchu",
      description:
        "Acclimatize in Cusco, wander the Sacred Valley, then the sunrise you came for at Machu Picchu.",
      coverImage: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80",
      votesFrom: ["demo", "leo", "tom", "priya", "yuki", "maya"],
      comments: [{ by: "leo", text: "Give yourself 2 days in Cusco for the altitude — trust me." }],
      days: [
        { day: 1, title: "Cusco acclimatize", place: "Cusco", notes: "Coca tea + easy walking.", lat: -13.5319, lng: -71.9675 },
        { day: 2, title: "Sacred Valley", place: "Pisac", lat: -13.4194, lng: -71.8492 },
        { day: 3, title: "Machu Picchu sunrise", place: "Machu Picchu", time: "5:30 AM", lat: -13.1631, lng: -72.545 },
      ],
    },
    {
      ownerKey: "priya",
      createdDaysAgo: 3,
      title: "A Long Weekend in Rome",
      destination: "Rome, Italy",
      description: "Three days of ruins, pasta, and piazzas. Comfortable shoes required.",
      coverImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
      votesFrom: ["demo", "ana", "tom"],
      comments: [],
      days: [
        { day: 1, title: "Colosseum & Forum", place: "Colosseo", time: "9:00 AM", lat: 41.8902, lng: 12.4922 },
        { day: 2, title: "Vatican Museums", place: "Vatican City", lat: 41.9065, lng: 12.4536 },
        { day: 3, title: "Trastevere dinner", place: "Trastevere", lat: 41.8896, lng: 12.4696 },
      ],
    },
    {
      ownerKey: "tom",
      createdDaysAgo: 2,
      title: "Banff in Autumn",
      destination: "Canadian Rockies",
      description: "Larch season in the Rockies — turquoise lakes and golden trees.",
      coverImage: "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=1200&q=80",
      votesFrom: ["demo", "sam"],
      comments: [],
      days: [
        { day: 1, title: "Lake Louise", place: "Lake Louise", time: "7:00 AM", lat: 51.4254, lng: -116.1773 },
        { day: 2, title: "Moraine Lake", place: "Moraine Lake", lat: 51.3217, lng: -116.1860 },
      ],
    },
    {
      ownerKey: "demo",
      createdDaysAgo: 1,
      title: "Weekend in New York",
      destination: "NYC",
      description:
        "48 hours of museums, bagels, and skyline views. A tight, walkable itinerary for a long weekend.",
      coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80",
      votesFrom: ["maya", "leo", "ana"],
      comments: [{ by: "sam", text: "Grab bagels at Russ & Daughters before the Tenement Museum." }],
      days: [
        { day: 1, title: "The Met", place: "Upper East Side", time: "9:30 AM", lat: 40.7794, lng: -73.9632 },
        { day: 1, title: "Central Park walk", place: "Central Park", lat: 40.7829, lng: -73.9654 },
        { day: 2, title: "Brooklyn Bridge", place: "Brooklyn", notes: "Walk across at sunrise.", lat: 40.7061, lng: -73.9969 },
      ],
    },
  ];

  for (const t of trips) {
    const existing = await db.trip.findFirst({
      where: { title: t.title, ownerId: users[t.ownerKey].id },
    });
    if (existing) continue;

    const trip = await db.trip.create({
      data: {
        title: t.title,
        destination: t.destination,
        description: t.description,
        coverImage: t.coverImage,
        visibility: "PUBLIC",
        votes: t.votesFrom.length,
        createdAt: daysAgo(t.createdDaysAgo),
        ownerId: users[t.ownerKey].id,
        memberships: { create: { userId: users[t.ownerKey].id, role: "OWNER" } },
        itineraryItems: {
          create: t.days.map((d, i) => ({
            dayIndex: d.day,
            title: d.title,
            place: d.place ?? null,
            time: d.time ?? null,
            notes: d.notes ?? null,
            lat: d.lat ?? null,
            lng: d.lng ?? null,
            order: i,
          })),
        },
      },
    });

    // Real vote records (so engagement metrics are genuine).
    for (const voterKey of t.votesFrom) {
      await db.vote.create({
        data: { tripId: trip.id, userId: users[voterKey].id, value: 1 },
      });
    }

    // Comments.
    for (const c of t.comments) {
      await db.comment.create({
        data: { tripId: trip.id, authorId: users[c.by].id, content: c.text },
      });
    }
  }

  console.log("✅ Seed complete — 8 users, 8 trips with votes & comments across 12 days.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
