import { NextRequest, NextResponse } from "next/server";
import { auth }                      from "@/lib/auth";
import { prisma }                    from "@/lib/db/prisma";

export interface EntropyDataPoint {
  date:       string;
  avgEntropy: number;
  regime:     "HIGH" | "ELEVATED" | "NORMAL";
  hotspots:   string[];
}

export interface EntropyHistoryResponse {
  history: EntropyDataPoint[];
}

// GET — last 30 days of entropy snapshots
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rows = await prisma.entropySnapshot.findMany({
    where:   { userId },
    orderBy: { date: "asc" },
    take:    30,
  });

  const history: EntropyDataPoint[] = rows.map((r): EntropyDataPoint => ({
    date:       r.date,
    avgEntropy: r.avgEntropy,
    regime:     r.regime as "HIGH" | "ELEVATED" | "NORMAL",
    hotspots:   r.hotspots,
  }));

  return NextResponse.json({ history } satisfies EntropyHistoryResponse);
}

// POST — upsert today's entropy snapshot (called by RiskDashboard after scores load)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json() as { avgEntropy?: number; regime?: string; hotspots?: string[] };
  const { avgEntropy, regime, hotspots } = body;
  if (avgEntropy === undefined || !regime) {
    return NextResponse.json({ error: "avgEntropy and regime are required" }, { status: 400 });
  }

  const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  await prisma.entropySnapshot.upsert({
    where:  { userId_date: { userId, date } },
    update: { avgEntropy, regime, hotspots: hotspots ?? [] },
    create: { userId, date, avgEntropy, regime, hotspots: hotspots ?? [] },
  });

  return NextResponse.json({ ok: true, date });
}
