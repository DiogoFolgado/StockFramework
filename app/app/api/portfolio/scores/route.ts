import { NextResponse }  from "next/server";
import { auth }          from "@/lib/auth";
import { prisma }        from "@/lib/db/prisma";

export interface PillarScores {
  fundamental: number;
  technical:   number;
  entropy:     number;
  semantic:    number;
}

export interface TickerScore {
  ticker:      string;
  fundamental: number;
  technical:   number;
  entropy:     number;
  semantic:    number;
  composite:   number;
  signal:      string;
  analyzedAt:  string;
}

export interface RegimeResult {
  level:      "HIGH" | "ELEVATED" | "NORMAL";
  avgEntropy: number;
  hotspots:   string[];  // tickers where entropy < 4
}

export interface ScoresResponse {
  scores: Record<string, TickerScore>;
  regime: RegimeResult;
}

function classifyRegime(avgEntropy: number): "HIGH" | "ELEVATED" | "NORMAL" {
  if (avgEntropy < 4.5) return "HIGH";
  if (avgEntropy < 6.0) return "ELEVATED";
  return "NORMAL";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Collect all unique tickers across user's sections
  const sections = await prisma.section.findMany({
    where: { userId },
    include: { positions: { select: { ticker: true } } },
  });

  const tickers = [...new Set(
    sections.flatMap(s => s.positions.map(p => p.ticker))
  )];

  if (tickers.length === 0) {
    return NextResponse.json({
      scores: {},
      regime: { level: "NORMAL", avgEntropy: 10, hotspots: [] },
    });
  }

  // Fetch latest AnalysisHistory record per ticker for this user
  const histories = await Promise.all(
    tickers.map(ticker =>
      prisma.analysisHistory.findFirst({
        where:   { userId, ticker },
        orderBy: { analyzedAt: "desc" },
      })
    )
  );

  const scores: Record<string, TickerScore> = {};
  const entropyValues: number[] = [];
  const hotspots: string[] = [];

  for (const h of histories) {
    if (!h) continue;

    const pillars = h.pillars as Record<string, { score: number }>;
    const fundamental = pillars.fundamental?.score ?? 0;
    const technical   = pillars.technical?.score   ?? 0;
    const entropy     = pillars.entropy?.score      ?? 0;
    const semantic    = pillars.semantic?.score     ?? 0;

    scores[h.ticker] = {
      ticker:      h.ticker,
      fundamental,
      technical,
      entropy,
      semantic,
      composite:   h.score,
      signal:      h.signal,
      analyzedAt:  h.analyzedAt.toISOString(),
    };

    entropyValues.push(entropy);
    if (entropy < 4) hotspots.push(h.ticker);
  }

  const avgEntropy = entropyValues.length > 0
    ? entropyValues.reduce((a, b) => a + b, 0) / entropyValues.length
    : 10;

  const regime: RegimeResult = {
    level:      classifyRegime(avgEntropy),
    avgEntropy: Math.round(avgEntropy * 10) / 10,
    hotspots,
  };

  return NextResponse.json({ scores, regime } satisfies ScoresResponse);
}
