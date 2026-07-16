import Link from "next/link";
import {
  Plane,
  Map,
  Users,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Compass,
} from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Build real itineraries",
    body: "Day-by-day plans with places, times, and notes — not another vague group chat.",
  },
  {
    icon: Users,
    title: "Collaborate with your circle",
    body: "Invite the people you trust, gather feedback, and turn a rough idea into a plan.",
  },
  {
    icon: Compass,
    title: "Discover trips worth taking",
    body: "Browse a public feed of real trips, filter by destination, and get inspired.",
  },
  {
    icon: MessageSquare,
    title: "Keep the conversation in one place",
    body: "Comments, files, and decisions live with the trip — no more scattered threads.",
  },
];

const steps = [
  { n: "01", title: "Create a trip", body: "Give it a destination, dates, and a cover." },
  { n: "02", title: "Invite & plan", body: "Add collaborators and build the itinerary together." },
  { n: "03", title: "Refine & go", body: "Gather upvotes and feedback, then hit the road." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Plane className="h-4 w-4" />
            </span>
            Itinera
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#explore" className="hover:text-ink">Explore</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-slate-700 hover:text-ink sm:block">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-brand-50/80 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-1.5 text-xs font-medium text-brand-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Plan together. Travel better.
          </div>
          <h1 className="animate-fade-up font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Turn a group chat
            <br />
            into a <span className="text-brand-600">real trip.</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-slate-600">
            Itinera is where you build itineraries, share them with the people you trust,
            gather feedback, and discover trips worth taking — all in one place.
          </p>
          <div className="animate-fade-up mt-9 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Start planning free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Explore trips
            </Link>
          </div>

          {/* Metrics strip */}
          <div className="animate-fade-up mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 rounded-2xl border border-slate-100 bg-white/60 p-6 shadow-sm">
            {[
              { k: "Day-by-day", v: "Itineraries" },
              { k: "Trusted", v: "Collaboration" },
              { k: "Public", v: "Discovery feed" },
            ].map((m) => (
              <div key={m.v}>
                <div className="font-display text-xl font-semibold text-ink">{m.k}</div>
                <div className="text-sm text-slate-500">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Everything a trip needs, together
          </h2>
          <p className="mt-4 text-slate-600">
            Itinera replaces the mess of chats, docs, and screenshots with one shared home for every trip.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Three steps to takeoff</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="font-display text-4xl font-semibold text-brand-200">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="explore" className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center text-white">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium">
              <ThumbsUp className="h-3.5 w-3.5" /> Your next trip starts here
            </div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Ready to plan something great?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-300">
              Create your first trip in under a minute. No credit card, no clutter.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2 font-display font-semibold text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-600 text-white">
              <Plane className="h-3 w-3" />
            </span>
            Itinera
          </div>
          <p>© {new Date().getFullYear()} Itinera. Built as a portfolio project.</p>
        </div>
      </footer>
    </main>
  );
}
