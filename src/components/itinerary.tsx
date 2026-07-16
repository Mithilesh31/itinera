"use client";

import { useOptimistic, useRef, useTransition } from "react";
import { MapPin, Trash2, Plus, GripVertical } from "lucide-react";
import {
  addItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
} from "@/lib/actions/itinerary";

type Item = {
  id: string;
  dayIndex: number;
  title: string;
  place: string | null;
  time: string | null;
  notes: string | null;
};

type Action =
  | { type: "add"; item: Item }
  | { type: "delete"; id: string }
  | { type: "reorder"; dayIndex: number; orderedIds: string[] };

export function Itinerary({
  tripId,
  initialItems,
  isMember,
}: {
  tripId: string;
  initialItems: Item[];
  isMember: boolean;
}) {
  const [optimistic, dispatch] = useOptimistic(initialItems, (state, action: Action) => {
    if (action.type === "add") return [...state, action.item];
    if (action.type === "delete") return state.filter((i) => i.id !== action.id);
    // reorder within a single day
    const inDay = new Map(state.filter((i) => i.dayIndex === action.dayIndex).map((i) => [i.id, i]));
    const others = state.filter((i) => i.dayIndex !== action.dayIndex);
    const reordered = action.orderedIds.map((id) => inDay.get(id)).filter(Boolean) as Item[];
    return [...others, ...reordered];
  });
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const dragRef = useRef<{ id: string; day: number } | null>(null);

  function onDrop(target: Item, day: number, dayItems: Item[]) {
    const src = dragRef.current;
    dragRef.current = null;
    if (!src || src.day !== day || src.id === target.id) return;
    const ids = dayItems.map((i) => i.id);
    const from = ids.indexOf(src.id);
    const to = ids.indexOf(target.id);
    if (from === -1 || to === -1) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    startTransition(async () => {
      dispatch({ type: "reorder", dayIndex: day, orderedIds: ids });
      await reorderItineraryItems(tripId, ids);
    });
  }

  // Group by day.
  const days = new Map<number, Item[]>();
  for (const item of optimistic) {
    const arr = days.get(item.dayIndex) ?? [];
    arr.push(item);
    days.set(item.dayIndex, arr);
  }
  const sortedDays = [...days.entries()].sort((a, b) => a[0] - b[0]);
  const nextDay = days.size ? Math.max(...days.keys()) : 1;

  async function add(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    const dayIndex = Math.max(1, parseInt(String(formData.get("dayIndex") ?? "1"), 10) || 1);
    const item: Item = {
      id: `temp-${Math.random()}`,
      dayIndex,
      title,
      place: str(formData.get("place")),
      time: str(formData.get("time")),
      notes: str(formData.get("notes")),
    };
    dispatch({ type: "add", item });
    formRef.current?.reset();
    await addItineraryItem(tripId, formData);
  }

  function remove(id: string) {
    startTransition(async () => {
      dispatch({ type: "delete", id });
      await deleteItineraryItem(id);
    });
  }

  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-semibold">Itinerary</h2>

      {sortedDays.length ? (
        <div className="space-y-6">
          {sortedDays.map(([day, items]) => (
            <div key={day}>
              <div className="mb-2 text-sm font-semibold text-brand-600">Day {day}</div>
              <div className="space-y-2">
                {items.map((item) => {
                  const draggable = isMember && !item.id.startsWith("temp-");
                  return (
                    <div
                      key={item.id}
                      draggable={draggable}
                      onDragStart={() => (dragRef.current = { id: item.id, day })}
                      onDragOver={(e) => draggable && e.preventDefault()}
                      onDrop={() => onDrop(item, day, items)}
                      className="group flex gap-2 rounded-xl border border-slate-100 bg-white p-4"
                    >
                      {draggable && (
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300 transition group-hover:text-slate-400 active:cursor-grabbing" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <div className="flex items-center gap-2">
                            {item.time && <span className="text-xs text-slate-400">{item.time}</span>}
                            {isMember && !item.id.startsWith("temp-") && (
                              <button
                                onClick={() => remove(item.id)}
                                title="Delete item"
                                className="text-slate-300 transition hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {item.place && (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" /> {item.place}
                          </div>
                        )}
                        {item.notes && <p className="mt-1.5 text-sm text-slate-600">{item.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No itinerary items yet.
        </p>
      )}

      {isMember && (
        <form
          ref={formRef}
          action={add}
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Plus className="h-4 w-4" /> Add an itinerary item
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input
              name="dayIndex"
              type="number"
              min={1}
              defaultValue={nextDay}
              title="Day"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              name="time"
              placeholder="Time (e.g. 9 AM)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              name="title"
              required
              placeholder="What's happening?"
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              name="place"
              placeholder="Place (for the map)"
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              name="notes"
              placeholder="Notes (optional)"
              className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Add item
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function str(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}
