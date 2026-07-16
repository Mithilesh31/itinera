import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { createTrip } from "@/lib/actions/trips";

export default function NewTripPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="font-display text-3xl font-semibold">Plan a new trip</h1>
        <p className="mt-2 text-slate-600">
          Give your trip a name and a few details. You can build the itinerary next.
        </p>

        <form action={createTrip} className="mt-8 space-y-5">
          <Field label="Trip title" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Two weeks in Japan"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>

          <Field label="Destination" htmlFor="destination">
            <input
              id="destination"
              name="destination"
              placeholder="e.g. Tokyo, Japan"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="What's the plan? Who's it for?"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date" htmlFor="startDate">
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </Field>
            <Field label="End date" htmlFor="endDate">
              <input
                id="endDate"
                name="endDate"
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </Field>
          </div>

          <Field label="Cover image URL (optional)" htmlFor="coverImage">
            <input
              id="coverImage"
              name="coverImage"
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </Field>

          <Field label="Visibility" htmlFor="visibility">
            <select
              id="visibility"
              name="visibility"
              defaultValue="PUBLIC"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="PUBLIC">Public — appears in Explore</option>
              <option value="PRIVATE">Private — invite only</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Create trip
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
