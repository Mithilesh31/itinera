"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { generateItinerary } from "@/lib/actions/ai";

export function AiGenerateItinerary({
  tripId,
  aiEnabled,
}: {
  tripId: string;
  aiEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await generateItinerary(tripId, fd);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
      >
        <Sparkles className="h-4 w-4" /> Generate itinerary with AI
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
      <div className="mb-3 flex items-center gap-2 font-semibold text-brand-800">
        <Sparkles className="h-4 w-4" /> AI itinerary generator
      </div>

      {!aiEnabled ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            AI isn&apos;t configured yet. Add an <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code>{" "}
            to enable one-click itinerary generation.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium text-slate-600">Days</span>
              <input
                name="days"
                type="number"
                min={1}
                max={14}
                defaultValue={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="flex-[3] text-sm">
              <span className="mb-1 block font-medium text-slate-600">Interests / vibe</span>
              <input
                name="interests"
                placeholder="e.g. food, history, off the beaten path"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Planning your trip…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </button>
            {!pending && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
