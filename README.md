# ✈️ Itinera

**Plan trips together.** Itinera is a collaborative travel-planning platform: build day-by-day itineraries, share them with the people you trust, gather feedback through comments and upvotes, and discover trips worth taking in a public feed.

> A ground-up rebuild of an earlier student project (SkyTracker), rethought as a real product — clean architecture, modern stack, and a live demo.

---

## The product in one paragraph

Travelers plan trips across scattered tools — group chats, spreadsheets, screenshots — and lose the feedback loop. Itinera gives every trip a single shared home: an itinerary, files, discussion, and a public discovery feed. It's built around three users: the **Planner** who organizes, the **Advisor** who gives feedback, and the **Explorer** who browses for inspiration.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Auth.js (NextAuth) — *Phase 1* |
| Deploy | Vercel + Neon Postgres |

## Project status

This repo is at **Phase 0 — Foundation**: a runnable app with a polished landing page, the full data model defined in Prisma, and clean project structure. Auth, trip CRUD, and the discovery feed arrive in Phase 1. See `../SkyTracker-2.0-Roadmap.md` for the full plan.

---

## Getting started (local)

You need **Node 18+**. Postgres is optional for Phase 0 (the landing page runs without a database).

```bash
# 1. install dependencies
npm install

# 2. copy env template and fill it in
cp .env.example .env.local

# 3. run the dev server
npm run dev
```

Open http://localhost:3000 — you should see the Itinera landing page.

### Adding the database (when you're ready for Phase 1)

Point `DATABASE_URL` in `.env.local` at a Postgres instance (local, or a free [Neon](https://neon.tech) / [Supabase](https://supabase.com) database), then:

```bash
npm run db:generate   # generate the Prisma client
npm run db:migrate    # create the tables
npm run db:studio     # (optional) browse your data
```

> **Zero-setup alternative:** to try it with no Postgres, open `prisma/schema.prisma` and switch the datasource `provider` to `"sqlite"` and set `DATABASE_URL="file:./dev.db"` in `.env.local`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check, no emit |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:studio` | Visual database browser |

## Project structure

```
src/
  app/
    page.tsx            # landing page
    (auth)/             # login, signup (placeholders → Phase 1)
    explore/            # discovery feed (placeholder → Phase 1)
    layout.tsx          # root layout + fonts
    globals.css
  lib/
    db.ts               # Prisma client singleton
    utils.ts            # cn() class helper
prisma/
  schema.prisma         # full data model
```

## Security notes

- No secrets are committed. All configuration lives in `.env.local` (gitignored); `.env.example` documents what's needed.
- Generate `AUTH_SECRET` with `openssl rand -base64 32`.

---

*Built by Mithilesh.*
