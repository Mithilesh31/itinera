"use client";

import { useOptimistic, useRef } from "react";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { addComment } from "@/lib/actions/trips";

type CommentView = {
  id: string;
  content: string;
  createdLabel: string;
  author: { name: string | null; image: string | null };
};

type CurrentUser = { name: string | null; image: string | null } | null;

export function Comments({
  tripId,
  initialComments,
  currentUser,
}: {
  tripId: string;
  initialComments: CommentView[];
  currentUser: CurrentUser;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    initialComments,
    (state, content: string) => [
      {
        id: `temp-${Math.random()}`,
        content,
        createdLabel: "Just now",
        author: currentUser ?? { name: "You", image: null },
      },
      ...state,
    ],
  );
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(formData: FormData) {
    const content = String(formData.get("content") ?? "").trim();
    if (!content) return;
    addOptimistic(content);
    formRef.current?.reset();
    await addComment(tripId, formData);
  }

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
        <MessageSquare className="h-5 w-5" /> Discussion ({optimistic.length})
      </h2>

      {currentUser ? (
        <form ref={formRef} action={submit} className="mb-6">
          <textarea
            name="content"
            required
            rows={3}
            placeholder="Share a suggestion or question…"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Post comment
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
          <Link href="/login" className="font-medium text-brand-600">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <div className="space-y-4">
        {optimistic.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar name={c.author.name} image={c.author.image} />
            <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{c.author.name ?? "Traveler"}</span>
                <span className="text-xs text-slate-400">{c.createdLabel}</span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{c.content}</p>
            </div>
          </div>
        ))}
        {optimistic.length === 0 && (
          <p className="text-sm text-slate-500">No comments yet — start the conversation.</p>
        )}
      </div>
    </section>
  );
}

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
      />
    );
  }
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {(name ?? "U").charAt(0)}
    </div>
  );
}
