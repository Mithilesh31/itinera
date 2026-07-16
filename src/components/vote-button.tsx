"use client";

import { useOptimistic, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { voteTrip } from "@/lib/actions/trips";

export function VoteButton({
  tripId,
  votes,
  hasVoted,
}: {
  tripId: string;
  votes: number;
  hasVoted: boolean;
}) {
  // Optimistic state flips instantly on click; the server reconciles after.
  const [optimistic, toggle] = useOptimistic(
    { votes, hasVoted },
    (state) => ({
      votes: state.hasVoted ? state.votes - 1 : state.votes + 1,
      hasVoted: !state.hasVoted,
    }),
  );
  const [, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          toggle(null);
          await voteTrip(tripId);
        })
      }
      className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        optimistic.hasVoted
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-200 text-slate-700 hover:border-brand-300"
      }`}
    >
      <ThumbsUp className="h-3.5 w-3.5" /> {optimistic.votes}
    </button>
  );
}
