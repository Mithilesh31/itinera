// Provider-ready AI caller. Defaults to Anthropic (Claude) via the Messages API.
// Set ANTHROPIC_API_KEY to enable; optionally AI_MODEL to override the model.
// No SDK needed — a single fetch keeps the dependency surface small.

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI is not configured. Add ANTHROPIC_API_KEY to enable AI features.");
    this.name = "AINotConfiguredError";
  }
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const DEFAULT_MODEL = "claude-3-5-sonnet-latest";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export async function callAI({
  system,
  prompt,
  maxTokens = 1200,
}: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AINotConfiguredError();

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? "";
}

/** Extract the first JSON array/object from a model response, tolerating prose or code fences. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in AI response.");
  // Find matching end by scanning for the last closing bracket.
  const lastArr = candidate.lastIndexOf("]");
  const lastObj = candidate.lastIndexOf("}");
  const end = Math.max(lastArr, lastObj);
  const slice = candidate.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
