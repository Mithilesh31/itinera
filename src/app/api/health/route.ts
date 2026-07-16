import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Keep-warm + health check.
// Pinging this endpoint every few minutes runs a trivial query that keeps the
// Neon database from scaling to zero (cold-starting), so the first real user
// action stays fast. Point a free uptime pinger at /api/health.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, db: "up", ms: Date.now() - start },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, db: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
