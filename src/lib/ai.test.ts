import { describe, it, expect } from "vitest";
import { extractJson, aiConfigured } from "@/lib/ai";

describe("extractJson", () => {
  it("parses a bare JSON array", () => {
    expect(extractJson<number[]>("[1, 2, 3]")).toEqual([1, 2, 3]);
  });

  it("parses JSON wrapped in a code fence", () => {
    const text = "```json\n[{\"a\":1}]\n```";
    expect(extractJson<{ a: number }[]>(text)).toEqual([{ a: 1 }]);
  });

  it("parses JSON surrounded by prose", () => {
    const text = 'Here is your plan: [{"day":1}] — enjoy!';
    expect(extractJson<{ day: number }[]>(text)).toEqual([{ day: 1 }]);
  });

  it("parses a JSON object", () => {
    expect(extractJson<{ ok: boolean }>('{"ok": true}')).toEqual({ ok: true });
  });

  it("throws when there is no JSON", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});

describe("aiConfigured", () => {
  it("reflects the presence of ANTHROPIC_API_KEY", () => {
    const prev = process.env.ANTHROPIC_API_KEY;

    delete process.env.ANTHROPIC_API_KEY;
    expect(aiConfigured()).toBe(false);

    process.env.ANTHROPIC_API_KEY = "test-key";
    expect(aiConfigured()).toBe(true);

    if (prev === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = prev;
  });
});
