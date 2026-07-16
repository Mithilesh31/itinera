<div align="center">

# ✈️ Itinera

### Plan trips together.

Itinera is a collaborative travel-planning platform where a trip is a shared workspace — build day-by-day itineraries on an interactive map, invite the people you trust, gather feedback through comments and upvotes, and discover trips worth taking in a public feed.

**[🌐 Live demo](https://itinera-wheat.vercel.app)  ·  [💻 Source](https://github.com/Mithilesh31/itinera)**

`Next.js 14` · `TypeScript` · `PostgreSQL` · `Prisma` · `Auth.js` · `Tailwind CSS` · `Leaflet` · `Vercel`

</div>

---

> **Try it in one click.** The live demo has a **"Continue with demo account"** button — no signup needed. You land in a populated product with real trips, itineraries, and a map.

---

## The problem

Travelers plan trips across scattered tools — group chats, spreadsheets, screenshots — and lose the collaborative feedback loop. There's no single place to build an itinerary, get input from people you trust, and keep everything together. Itinera gives every trip one shared home.

**Three users it's built for:**

- **The Planner** — organizes the trip and wants structured feedback.
- **The Advisor** — a friend who suggests ideas and upvotes good plans.
- **The Explorer** — browses public trips for inspiration before committing.

## Features

**Plan**
- Create trips with destination, dates, cover image, and public/private visibility.
- Build **day-by-day itineraries** — add stops with a place, time, and notes.
- Every stop is **auto-geocoded** and plotted on an interactive **map**.

**Collaborate**
- Invite members; **request-to-join** flow with owner approval.
- **Upvotes** and threaded **comments** on every trip.
- Role-aware permissions (owners vs. members vs. visitors).

**Discover**
- Public **Explore feed** with full-text search across title, destination, and description.
- Trips ranked by community upvotes.

**Measure**
- A **product analytics dashboard** tracking activation, engagement, average team size, content growth, and a top-trips leaderboard — computed live from the database.

**Feel**
- **Optimistic UI** everywhere — votes, comments, and itinerary edits appear instantly, with the server reconciling in the background. No spinners, no waiting.

## Screenshots

> **To add screenshots:** capture these four pages (on Mac, `Cmd`+`Shift`+`4`), save them into the `docs/` folder with the exact names below, then uncomment the table.
>
> - `docs/landing.png` — the landing page
> - `docs/explore.png` — the Explore feed
> - `docs/trip.png` — a trip page with the map
> - `docs/analytics.png` — the analytics dashboard

<!--
| Landing | Explore |
|---|---|
| ![Landing](docs/landing.png) | ![Explore](docs/explore.png) |

| Trip + Map | Analytics |
|---|---|
| ![Trip](docs/trip.png) | ![Analytics](docs/analytics.png) |
-->


## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) + TypeScript | One codebase for UI and API; server components + server actions |
| Styling | **Tailwind CSS** | Consistent, fast design system |
| Database | **PostgreSQL** (Neon) | Production-grade, serverless |
| ORM | **Prisma** | Type-safe schema and queries |
| Auth | **Auth.js (NextAuth v5)** | Google + one-click demo account, JWT sessions |
| Maps | **Leaflet + OpenStreetMap** | Interactive maps, no API key |
| Geocoding | **Nominatim** | Place → coordinates, no API key |
| Hosting | **Vercel** | Git-push deploys, edge middleware |

## Architecture

Itinera is a single Next.js App Router codebase. UI is server-rendered by default; interactivity is added with focused **client components** and **server actions** — no separate API layer or client-side data-fetching library.

```
src/
  app/
    page.tsx              # marketing landing
    (auth)/               # login, signup
    dashboard/            # your trips
    explore/              # public discovery feed + search
    trips/[id]/           # trip detail (map, itinerary, votes, comments, join)
    trips/new/            # create trip
    analytics/            # product metrics dashboard
    api/
      auth/[...nextauth]/ # Auth.js handler
      health/             # DB keep-warm / health check
  components/             # VoteButton, Comments, Itinerary, TripMap, TripCard…
  lib/
    actions/              # server actions (trips, itinerary) — the write layer
    db.ts                 # Prisma singleton
    session.ts            # auth helpers
  auth.ts / auth.config.ts
  middleware.ts           # edge route protection
prisma/
  schema.prisma           # data model
  seed.ts                 # realistic demo data
```

**Data model:** `User` · `Trip` · `Membership` (owner/member) · `ItineraryItem` (day, place, lat/lng) · `Vote` · `Comment` · `JoinRequest` · `Profile`, plus the Auth.js tables.

## Engineering decisions worth calling out

- **Optimistic UI with `useOptimistic`.** Mutations update the screen instantly and reconcile with the server, so the app feels immediate rather than request-bound.
- **Thin routes, logic in services.** All writes live in `lib/actions/*` as server actions with auth + validation at the edge — no fat controllers.
- **Edge-safe auth split.** `auth.config.ts` (no DB) runs in middleware for route protection; the full Prisma-backed config runs in Node — avoids bundling the database into the edge runtime.
- **Denormalized vote counts** updated transactionally for fast sorting, with a unique `(trip, user)` constraint preventing double-votes.
- **Keep-warm health endpoint.** `/api/health` runs `SELECT 1`; an external pinger keeps the serverless database from cold-starting so first-actions stay fast.
- **No secrets in the repo.** All config is environment-based; `.env.example` documents what's needed.

## Run it locally

Requires **Node 18+** and a PostgreSQL database (a free [Neon](https://neon.tech) database works great).

```bash
git clone https://github.com/Mithilesh31/itinera.git
cd itinera
npm install

cp .env.example .env          # fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate            # create tables
npm run db:seed               # load demo trips

npm run dev                   # http://localhost:3000
```

Generate an auth secret with `openssl rand -base64 32`.

## Roadmap

- [x] Auth, trips, membership, join requests, votes, comments
- [x] Public Explore feed with search
- [x] Interactive map + in-app itinerary editing
- [x] Instant optimistic UI
- [x] Product analytics dashboard
- [x] Live deployment
- [ ] Real-time comments & notifications
- [ ] Drag-to-reorder itinerary items
- [ ] Trip cover uploads (S3/R2)

## About

Itinera is a ground-up rebuild of an earlier student project, rethought as a real, deployed product: clean architecture, tests-ready structure, a live demo, and product instrumentation. Built by **Mithilesh**.
