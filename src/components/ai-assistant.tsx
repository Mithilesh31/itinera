"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Send, Backpack, RefreshCw, Lock } from "lucide-react";
import { askAssistant, generatePackingList, generateSummary } from "@/lib/actions/ai";

export function AiAssistant({
  tripId,
  aiEnabled,
  isOwner,
}: {
  tripId: string;
  aiEnabled: boolean;
  isOwner: boolean;
}) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [packing, setPacking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askPending, startAsk] = useTransition();
  const [packPending, startPack] = useTransition();
  const [sumPending, startSum] = useTransition();

  function ask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (!q) return;
    setError(null);
    setAnswer(null);
    startAsk(async () => {
      try {
        setAnswer(await askAssistant(tripId, q));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
      }
    });
  }

  function pack() {
    setError(null);
    setPacking(null);
    startPack(async () => {
      try {
        setPacking(await generatePackingList(tripId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
      }
    });
  }

  function summarize() {
    setError(null);
    startSum(async () => {
      try {
        await generateSummary(tripId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        <Sparkles className="h-5 w-5 text-brand-500" /> AI travel assistant
      </h2>

      {!aiEnabled ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Add an <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code> to enable the
            assistant, packing lists, and AI summaries.
          </span>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <form onSubmit={ask} className="flex gap-2">
            <input
              name="q"
              placeholder="Ask anything — best time to go, getting around…"
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={askPending}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-70"
            >
              {askPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>

          {answer && (
            <div className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              {answer}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={pack}
              disabled={packPending}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 disabled:opacity-70"
            >
              {packPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Backpack className="h-4 w-4" />}
              Packing list
            </button>
            {isOwner && (
              <button
                onClick={summarize}
                disabled={sumPending}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 disabled:opacity-70"
              >
                {sumPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Rewrite summary
              </button>
            )}
          </div>

          {packing && (
            <div className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              {packing}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}
