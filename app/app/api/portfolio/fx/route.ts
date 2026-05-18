import { NextResponse }  from "next/server";
import { auth }          from "@/lib/auth";
import { prisma }        from "@/lib/db/prisma";
import { getForexRates } from "@/lib/finnhub/client";

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
      currency: (meta.currency as string) ?? "USD",
    };
  } catch {
    return null;
  }
}

async function fetchYearlyFxDrift(): Promise<number | null> {
  try {
    const res  = await fetch(
      `${WORKER_URL}/v8/finance/chart/EURUSD=X?interval=1mo&range=13mo`,
      { headers: { "User-Agent": "StockFramework/2.0" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: { result?: Array<{ indicators?: { quote?: Array<{ close?: number[] }> } }> }
    };
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(Boolean) as number[] | undefined;
    if (!closes || closes.length < 2) return null;
    const oldest = closes[0];
    const latest = closes[closes.length - 1];
    // positive drift = EUR strengthened vs USD = USD positions lost value for EUR investor
    return ((latest - oldest) / oldest) * 100;
  } catch {
    return null;
  }
}

export interface FxUsdPosition {
  ticker:   string;
  valueEur: number;
  pct:      number;
}

export interface FxResponse {
  usdExposureEur:   number;
  eurExposure:      number;
  usdWeight:        number;
  fxDragPct:        number | null;
  hedgeSuggestion:  string | null;
  topUsdPositions:  FxUsdPosition[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const sections = await prisma.section.findMany({
    where:   { userId },
    include: { positions: true },
  });

  const allPositions = sections.flatMap(s => s.positions);
  if (allPositions.length === 0) {
    return NextResponse.json({
      usdExposureEur: 0, eurExposure: 0, usdWeight: 0,
      fxDragPct: null, hedgeSuggestion: null, topUsdPositions: [],
    });
  }

  const uniqueTickers = [...new Set(allPositions.map(p => p.ticker))];
  const [priceResults, fxResult, fxDrift] = await Promise.all([
    Promise.all(uniqueTickers.map(t => fetchLivePrice(t).then(r => [t, r] as const))),
    getForexRates("USD").catch(() => ({ base: "USD", quote: { EUR: 0.92 } })),
    fetchYearlyFxDrift(),
  ]);

  const priceMap = new Map(priceResults.filter(([, r]) => r !== null) as [string, { price: number; currency: string }][]);
  const usdToEur = fxResult.quote["EUR"] ?? 0.92;

  let usdExposureEur = 0;
  let eurExposure    = 0;
  const usdPositions: { ticker: string; valueEur: number }[] = [];

  for (const pos of allPositions) {
    const liveData = priceMap.get(pos.ticker);
    if (!liveData || !pos.quantity) continue;

    const isUsd   = liveData.currency === "USD";
    const valueEur = liveData.price * pos.quantity * (isUsd ? usdToEur : 1);

    if (isUsd) {
      usdExposureEur += valueEur;
      usdPositions.push({ ticker: pos.ticker, valueEur });
    } else {
      eurExposure += valueEur;
    }
  }

  const totalValueEur = usdExposureEur + eurExposure;
  const usdWeight     = totalValueEur > 0 ? usdExposureEur / totalValueEur : 0;

  // Monthly drag estimate: annualFxDrift / 12 (positive = EUR investor losing on USD positions)
  const fxDragPct = fxDrift !== null ? Math.round((fxDrift / 12) * 10) / 10 : null;

  // Group by ticker (sum across sections)
  const aggregated = new Map<string, number>();
  for (const p of usdPositions) {
    aggregated.set(p.ticker, (aggregated.get(p.ticker) ?? 0) + p.valueEur);
  }
  const topUsdPositions: FxUsdPosition[] = [...aggregated.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ticker, valueEur]) => ({
      ticker,
      valueEur: Math.round(valueEur * 100) / 100,
      pct:      Math.round((valueEur / usdExposureEur) * 1000) / 10,
    }));

  let hedgeSuggestion: string | null = null;
  if (usdWeight > 0.30) {
    const topNames = topUsdPositions.slice(0, 3).map(p => p.ticker).join(", ");
    hedgeSuggestion = `${Math.round(usdWeight * 100)}% of portfolio is USD-denominated (${topNames}${topUsdPositions.length > 3 ? "…" : ""}). Consider a EUR/USD hedge or EUR-listed equivalents to reduce FX drag${fxDragPct !== null ? ` (est. ${fxDragPct > 0 ? "-" : "+"}${Math.abs(fxDragPct).toFixed(1)}%/mo)` : ""}.`;
  }

  return NextResponse.json({
    usdExposureEur:   Math.round(usdExposureEur * 100) / 100,
    eurExposure:      Math.round(eurExposure * 100) / 100,
    usdWeight:        Math.round(usdWeight * 1000) / 10,
    fxDragPct,
    hedgeSuggestion,
    topUsdPositions,
  } satisfies FxResponse);
}
