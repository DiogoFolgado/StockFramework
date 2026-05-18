import { NextResponse }    from "next/server";
import { auth }            from "@/lib/auth";
import { prisma }          from "@/lib/db/prisma";
import { getForexRates }   from "@/lib/finnhub/client";

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

export interface SectorInfo {
  valueEur:  number;
  weight:    number;
  positions: string[];
}

export interface ConcentrationAlert {
  type:       "CONCENTRATION" | "UNDERWEIGHT" | "SINGLE_STOCK_CONCENTRATION";
  sector:     string;
  weight:     number;
  ticker?:    string;
  suggestion: string;
}

export interface TaxLossEntry {
  ticker:  string;
  lossEur: number;
  lossPct: number;
}

export interface TrimTarget {
  ticker:     string;
  gainPct:    number;
  gainEur:    number;
  taxEur:     number;
  netGainEur: number;
  sector:     string;
  suggestion: string;
}

export interface RebalanceResponse {
  totalValueEur:    number;
  sectors:          Record<string, SectorInfo>;
  alerts:           ConcentrationAlert[];
  taxLoss:          TaxLossEntry[];
  trimTargets:      TrimTarget[];
  executionPath:    string[];
  totalTaxEur:      number;
  taxLossOffsetEur: number;
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
      totalValueEur: 0,
      sectors:       {},
      alerts:        [],
      taxLoss:       [],
      trimTargets:   [],
    });
  }

  // Fetch live prices and FX rate in parallel
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

  let totalValueEur = 0;
  const positionValues: { ticker: string; valueEur: number; sector: string; purchaseEur: number; gainPct: number }[] = [];

  for (const pos of allPositions) {
    const liveData = priceMap.get(pos.ticker);
    if (!liveData || !pos.quantity) continue;

    const toEur = liveData.currency === "USD" ? usdToEur : 1;
    const valueEur = liveData.price * pos.quantity * toEur;
    const purchaseEur = pos.purchasePrice ? pos.purchasePrice * pos.quantity * toEur : valueEur;
    const gainPct = purchaseEur > 0 ? ((valueEur - purchaseEur) / purchaseEur) * 100 : 0;
    const sector = sectorMap.get(pos.ticker) ?? "Unknown";

    totalValueEur += valueEur;
    positionValues.push({ ticker: pos.ticker, valueEur, sector, purchaseEur, gainPct });
  }

  // Build sector map
  const sectors: Record<string, SectorInfo> = {};
  for (const pv of positionValues) {
    if (!sectors[pv.sector]) sectors[pv.sector] = { valueEur: 0, weight: 0, positions: [] };
    sectors[pv.sector].valueEur += pv.valueEur;
    if (!sectors[pv.sector].positions.includes(pv.ticker)) {
      sectors[pv.sector].positions.push(pv.ticker);
    }
  }

  if (totalValueEur > 0) {
    for (const s of Object.values(sectors)) {
      s.weight = Math.round((s.valueEur / totalValueEur) * 1000) / 10; // percent, 1dp
    }
  }

  // Concentration alerts (> 60%) and underweight
  const alerts: ConcentrationAlert[] = [];
  for (const [sector, info] of Object.entries(sectors)) {
    if (info.weight > 60) {
      alerts.push({
        type:       "CONCENTRATION",
        sector,
        weight:     info.weight,
        suggestion: `${sector} is ${info.weight.toFixed(1)}% of portfolio — consider trimming ${info.positions[0] ?? "top position"} to reduce concentration below 60%.`,
      });
    }
  }

  // Single-stock concentration alerts (> 20% of total portfolio)
  if (totalValueEur > 0) {
    for (const pv of positionValues) {
      const stockWeight = (pv.valueEur / totalValueEur) * 100;
      if (stockWeight > 20) {
        alerts.push({
          type:       "SINGLE_STOCK_CONCENTRATION",
          sector:     pv.sector,
          ticker:     pv.ticker,
          weight:     Math.round(stockWeight * 10) / 10,
          suggestion: `${pv.ticker} is ${stockWeight.toFixed(1)}% of your total portfolio — a single stock exceeding 20% creates significant idiosyncratic risk.`,
        });
      }
    }
  }

  const representedSectors = new Set(Object.keys(sectors));
  const broadSectors = ["Technology", "Healthcare", "Financials", "Consumer Discretionary", "Energy", "Industrials"];
  for (const sector of broadSectors) {
    if (!representedSectors.has(sector)) {
      alerts.push({
        type:       "UNDERWEIGHT",
        sector,
        weight:     0,
        suggestion: `No exposure to ${sector}. Consider adding a diversifying position.`,
      });
    }
  }

  // Tax-loss harvesting: positions with unrealized losses
  const taxLoss: TaxLossEntry[] = positionValues
    .filter(pv => pv.gainPct < 0)
    .map(pv => ({
      ticker:  pv.ticker,
      lossEur: Math.round((pv.purchaseEur - pv.valueEur) * 100) / 100,
      lossPct: Math.round(Math.abs(pv.gainPct) * 10) / 10,
    }))
    .sort((a, b) => b.lossEur - a.lossEur);

  // Trim targets: top gainers in overweight sectors, with Portugal flat-rate tax (28%)
  const TAX_RATE = 0.28;
  const overweightSectors = new Set(alerts.filter(a => a.type === "CONCENTRATION").map(a => a.sector));
  const trimTargets: TrimTarget[] = positionValues
    .filter(pv => overweightSectors.has(pv.sector) && pv.gainPct > 0)
    .sort((a, b) => b.gainPct - a.gainPct)
    .slice(0, 3)
    .map(pv => {
      const gainEur    = Math.round((pv.valueEur - pv.purchaseEur) * 100) / 100;
      const taxEur     = Math.round(gainEur * TAX_RATE * 100) / 100;
      const netGainEur = Math.round((gainEur - taxEur) * 100) / 100;
      return {
        ticker:     pv.ticker,
        gainPct:    Math.round(pv.gainPct * 10) / 10,
        gainEur,
        taxEur,
        netGainEur,
        sector:     pv.sector,
        suggestion: `Trim ${pv.ticker} (+${pv.gainPct.toFixed(1)}%) to reduce ${pv.sector} concentration.`,
      };
    });

  const totalTaxEur      = Math.round(trimTargets.reduce((s, t) => s + t.taxEur, 0) * 100) / 100;
  const taxLossOffsetEur = Math.round(taxLoss.reduce((s, t) => s + t.lossEur, 0) * 100) / 100;
  const netTaxEur        = Math.max(0, totalTaxEur - taxLossOffsetEur);

  // Build ordered execution path
  const executionPath: string[] = [];
  if (taxLoss.length > 0) {
    executionPath.push(
      `Step 1: Harvest losses — sell ${taxLoss.map(t => t.ticker).join(", ")} to book −€${taxLossOffsetEur.toLocaleString("en-IE")} in losses (offsets capital gains tax).`
    );
  }
  if (trimTargets.length > 0) {
    const step = taxLoss.length > 0 ? 2 : 1;
    const sorted = [...trimTargets].sort((a, b) => a.gainPct - b.gainPct); // lowest gain first to defer tax
    executionPath.push(
      `Step ${step}: Trim overweight — sell ${sorted.map(t => t.ticker).join(", ")} (smallest gain first to minimise immediate tax).`
    );
    const reinvestEur = Math.round(trimTargets.reduce((s, t) => s + t.netGainEur, 0));
    const underweightList = alerts.filter(a => a.type === "UNDERWEIGHT").map(a => a.sector).slice(0, 3);
    const reinvestTarget  = underweightList.length > 0 ? underweightList.join(", ") : "underweight sectors";
    executionPath.push(
      `Step ${step + 1}: Reinvest ~€${reinvestEur.toLocaleString("en-IE")} net proceeds into ${reinvestTarget}.`
    );
    if (netTaxEur > 0) {
      executionPath.push(
        `Step ${step + 2}: Reserve €${netTaxEur.toLocaleString("en-IE")} for estimated capital gains tax (28% PT flat rate, net of loss offset).`
      );
    }
  }

  return NextResponse.json({
    totalValueEur: Math.round(totalValueEur * 100) / 100,
    sectors,
    alerts,
    taxLoss,
    trimTargets,
    executionPath,
    totalTaxEur,
    taxLossOffsetEur,
  } satisfies RebalanceResponse);
}
