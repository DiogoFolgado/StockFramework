import { NextRequest, NextResponse } from "next/server";
import { auth }                      from "@/lib/auth";
import { prisma }                    from "@/lib/db/prisma";
import { getForexRates }             from "@/lib/finnhub/client";

const WORKER_URL = process.env.YAHOO_WORKER_URL ?? "https://noisy-bread-1e4c.diogo-lafp.workers.dev";

async function fetchLivePrice(ticker: string): Promise<{ price: number; currency: string } | null> {
  try {
    const res  = await fetch(
      `${WORKER_URL}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`,
      { headers: { "User-Agent": "StockFramework/2.0" }, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { chart?: { result?: Array<{ meta?: Record<string, number | string> }> } };
    const meta = data?.chart?.result?.[0]?.meta as Record<string, number | string> | undefined;
    if (!meta) return null;
    return {
      price:    (meta.regularMarketPrice as number) ?? 0,
      currency: (meta.currency as string)            ?? "USD",
    };
  } catch {
    return null;
  }
}

export interface ScenarioPosition {
  ticker:     string;
  sector:     string;
  valueEur:   number;
  impactEur:  number;
  newValueEur: number;
  affected:   boolean;
}

export interface ScenarioResponse {
  sector:           string;
  shockPct:         number;
  totalPortfolioEur: number;
  affectedValueEur: number;
  totalImpactEur:   number;
  totalImpactPct:   number;
  newPortfolioEur:  number;
  positions:        ScenarioPosition[];
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json() as { sector?: string; shockPct?: number };
  const { sector, shockPct } = body;
  if (!sector || shockPct === undefined || shockPct === null) {
    return NextResponse.json({ error: "sector and shockPct are required" }, { status: 400 });
  }
  if (shockPct < -100 || shockPct > 100) {
    return NextResponse.json({ error: "shockPct must be between -100 and 100" }, { status: 400 });
  }

  const sections = await prisma.section.findMany({
    where:   { userId },
    include: { positions: true },
  });

  const allPositions = sections.flatMap(s => s.positions);
  if (allPositions.length === 0) {
    return NextResponse.json({ error: "No positions found" }, { status: 404 });
  }

  const uniqueTickers = [...new Set(allPositions.map(p => p.ticker))];
  const [priceResults, fxResult, historyResults] = await Promise.all([
    Promise.all(uniqueTickers.map(t => fetchLivePrice(t).then(r => [t, r] as const))),
    getForexRates("USD").catch(() => ({ base: "USD", quote: { EUR: 0.92 } })),
    Promise.all(
      uniqueTickers.map(t =>
        prisma.analysisHistory.findFirst({
          where:   { userId, ticker: t },
          orderBy: { analyzedAt: "desc" },
          select:  { ticker: true, sector: true },
        })
      )
    ),
  ]);

  const priceMap = new Map(priceResults.filter(([, r]) => r !== null) as [string, { price: number; currency: string }][]);
  const usdToEur = fxResult.quote["EUR"] ?? 0.92;
  const sectorMap = new Map(historyResults.filter(Boolean).map(h => [h!.ticker, h!.sector]));

  let totalPortfolioEur = 0;
  const positionData: { ticker: string; sector: string; valueEur: number }[] = [];

  for (const pos of allPositions) {
    const liveData = priceMap.get(pos.ticker);
    if (!liveData || !pos.quantity) continue;

    const toEur     = liveData.currency === "USD" ? usdToEur : 1;
    const valueEur  = liveData.price * pos.quantity * toEur;
    const posSector = sectorMap.get(pos.ticker) ?? "Unknown";

    totalPortfolioEur += valueEur;
    positionData.push({ ticker: pos.ticker, sector: posSector, valueEur });
  }

  let affectedValueEur = 0;
  let totalImpactEur   = 0;

  const positions: ScenarioPosition[] = positionData.map(pv => {
    const affected  = pv.sector.toLowerCase() === sector.toLowerCase();
    const impactEur = affected ? pv.valueEur * (shockPct / 100) : 0;

    if (affected) {
      affectedValueEur += pv.valueEur;
      totalImpactEur   += impactEur;
    }

    return {
      ticker:      pv.ticker,
      sector:      pv.sector,
      valueEur:    Math.round(pv.valueEur * 100) / 100,
      impactEur:   Math.round(impactEur * 100) / 100,
      newValueEur: Math.round((pv.valueEur + impactEur) * 100) / 100,
      affected,
    };
  });

  positions.sort((a, b) => {
    if (a.affected && !b.affected) return -1;
    if (!a.affected && b.affected) return 1;
    return b.valueEur - a.valueEur;
  });

  const totalImpactPct = totalPortfolioEur > 0
    ? Math.round((totalImpactEur / totalPortfolioEur) * 1000) / 10
    : 0;

  return NextResponse.json({
    sector,
    shockPct,
    totalPortfolioEur: Math.round(totalPortfolioEur * 100) / 100,
    affectedValueEur:  Math.round(affectedValueEur * 100) / 100,
    totalImpactEur:    Math.round(totalImpactEur * 100) / 100,
    totalImpactPct,
    newPortfolioEur:   Math.round((totalPortfolioEur + totalImpactEur) * 100) / 100,
    positions,
  } satisfies ScenarioResponse);
}
