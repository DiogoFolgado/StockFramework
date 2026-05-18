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
      currency: (meta.currency as string)            ?? "USD",
    };
  } catch {
    return null;
  }
}

export interface DCAPosition {
  ticker:          string;
  currentValueEur: number;
  currentWeightPct: number;
  targetWeightPct: number;
  targetValueEur:  number;
  gapEur:          number;
  monthlyDcaEur:   number;
  action:          "CONSOLIDATE" | "SCALE_UP";
  reason:          string;
}

export interface DCAResponse {
  totalPortfolioEur:  number;
  consolidate:        DCAPosition[];
  scaleUp:            DCAPosition[];
  monthlyCashNeeded:  number;
}

const CONSOLIDATE_THRESHOLD = 0.5;   // < 0.5% → exit position
const MICRO_THRESHOLD       = 2.0;   // < 2%   → scale up via DCA
const TARGET_WEIGHT         = 5.0;   // ideal target weight per position
const DCA_MONTHS            = 6;     // ramp over 6 months

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
      totalPortfolioEur:  0,
      consolidate:        [],
      scaleUp:            [],
      monthlyCashNeeded:  0,
    } satisfies DCAResponse);
  }

  const uniqueTickers = [...new Set(allPositions.map(p => p.ticker))];
  const [priceResults, fxResult] = await Promise.all([
    Promise.all(uniqueTickers.map(t => fetchLivePrice(t).then(r => [t, r] as const))),
    getForexRates("USD").catch(() => ({ base: "USD", quote: { EUR: 0.92 } })),
  ]);

  const priceMap = new Map(priceResults.filter(([, r]) => r !== null) as [string, { price: number; currency: string }][]);
  const usdToEur = fxResult.quote["EUR"] ?? 0.92;

  let totalPortfolioEur = 0;
  const positionData: { ticker: string; valueEur: number }[] = [];

  for (const pos of allPositions) {
    const liveData = priceMap.get(pos.ticker);
    if (!liveData || !pos.quantity) continue;

    const toEur    = liveData.currency === "USD" ? usdToEur : 1;
    const valueEur = liveData.price * pos.quantity * toEur;
    totalPortfolioEur += valueEur;
    positionData.push({ ticker: pos.ticker, valueEur });
  }

  // Deduplicate tickers (sum valueEur across sections)
  const tickerMap = new Map<string, number>();
  for (const pv of positionData) {
    tickerMap.set(pv.ticker, (tickerMap.get(pv.ticker) ?? 0) + pv.valueEur);
  }

  const consolidate: DCAPosition[] = [];
  const scaleUp: DCAPosition[]     = [];

  for (const [ticker, valueEur] of tickerMap) {
    if (totalPortfolioEur === 0) continue;

    const currentWeightPct = (valueEur / totalPortfolioEur) * 100;

    if (currentWeightPct < CONSOLIDATE_THRESHOLD) {
      consolidate.push({
        ticker,
        currentValueEur:   Math.round(valueEur * 100) / 100,
        currentWeightPct:  Math.round(currentWeightPct * 10) / 10,
        targetWeightPct:   0,
        targetValueEur:    0,
        gapEur:            Math.round(-valueEur * 100) / 100,
        monthlyDcaEur:     0,
        action:            "CONSOLIDATE",
        reason:            `${ticker} is only ${currentWeightPct.toFixed(2)}% of portfolio — too small to meaningfully impact returns. Exit and redeploy capital.`,
      });
    } else if (currentWeightPct < MICRO_THRESHOLD) {
      const targetValueEur  = (TARGET_WEIGHT / 100) * totalPortfolioEur;
      const gapEur          = targetValueEur - valueEur;
      const monthlyDcaEur   = Math.max(0, Math.round((gapEur / DCA_MONTHS) * 100) / 100);
      scaleUp.push({
        ticker,
        currentValueEur:   Math.round(valueEur * 100) / 100,
        currentWeightPct:  Math.round(currentWeightPct * 10) / 10,
        targetWeightPct:   TARGET_WEIGHT,
        targetValueEur:    Math.round(targetValueEur * 100) / 100,
        gapEur:            Math.round(gapEur * 100) / 100,
        monthlyDcaEur,
        action:            "SCALE_UP",
        reason:            `${ticker} is ${currentWeightPct.toFixed(1)}% — micro-position with limited impact. Buy €${monthlyDcaEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}/mo for ${DCA_MONTHS} months to reach ${TARGET_WEIGHT}% target.`,
      });
    }
  }

  scaleUp.sort((a, b) => a.currentWeightPct - b.currentWeightPct);
  consolidate.sort((a, b) => a.currentValueEur - b.currentValueEur);

  const monthlyCashNeeded = Math.round(scaleUp.reduce((s, p) => s + p.monthlyDcaEur, 0) * 100) / 100;

  return NextResponse.json({
    totalPortfolioEur: Math.round(totalPortfolioEur * 100) / 100,
    consolidate,
    scaleUp,
    monthlyCashNeeded,
  } satisfies DCAResponse);
}
