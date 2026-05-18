import { NextRequest, NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/db/prisma";
import { getForexRates } from "@/lib/finnhub/client";
import Anthropic        from "@anthropic-ai/sdk";

const client     = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

export interface Suggestion {
  action:   "SELL" | "BUY" | "ADD" | "TRIM" | "DEPLOY_CASH" | "HOLD";
  ticker:   string | null;
  isNew:    boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title:    string;
  reason:   string;
  details:  string;
  risk:     string;
}

export interface SuggestionsResponse {
  summary:      string;
  suggestions:  Suggestion[];
  cashStrategy: string;
  generatedAt:  string;
}

const ACTION_ORDER: Record<string, number> = {
  SELL: 0, TRIM: 1, ADD: 2, BUY: 3, DEPLOY_CASH: 4, HOLD: 5,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({})) as { cash?: { eur?: number; usd?: number } };
  const cashEur = body.cash?.eur ?? 0;
  const cashUsd = body.cash?.usd ?? 0;

  // Fetch all sections + positions
  const sections = await prisma.section.findMany({
    where:   { userId },
    include: { positions: true },
  });

  const allPositions = sections.flatMap(s => s.positions);
  if (allPositions.length === 0) {
    return NextResponse.json({
      summary:      "Your portfolio is empty. Add positions to receive suggestions.",
      suggestions:  [],
      cashStrategy: cashEur > 0 || cashUsd > 0
        ? "You have idle cash. Start by building a diversified core portfolio across Technology, Healthcare, Financials, and Consumer Discretionary."
        : "Add positions to your portfolio and start tracking cash balances to receive tailored suggestions.",
      generatedAt: new Date().toISOString(),
    } satisfies SuggestionsResponse);
  }

  const uniqueTickers = [...new Set(allPositions.map(p => p.ticker))];

  // Fetch live prices, FX rates, and analysis history in parallel
  const [priceResults, fxResult, historyResults] = await Promise.all([
    Promise.all(uniqueTickers.map(t => fetchLivePrice(t).then(r => [t, r] as const))),
    getForexRates("USD").catch(() => ({ base: "USD", quote: { EUR: 0.92 } })),
    Promise.all(
      uniqueTickers.map(t =>
        prisma.analysisHistory.findFirst({
          where:   { userId, ticker: t },
          orderBy: { analyzedAt: "desc" },
        })
      )
    ),
  ]);

  const priceMap   = new Map(priceResults.filter(([, r]) => r !== null) as [string, { price: number; currency: string }][]);
  const usdToEur   = fxResult.quote["EUR"] ?? 0.92;
  const historyMap = new Map(historyResults.filter(Boolean).map(h => [h!.ticker, h!]));

  // Build per-position metrics
  interface PositionMetric {
    ticker:       string;
    companyName:  string;
    section:      string;
    qty:          number;
    purchasePrice:number;
    livePrice:    number;
    currency:     string;
    valueEur:     number;
    purchaseEur:  number;
    gainPct:      number;
    sector:       string;
    signal:       string;
    composite:    number;
    fundamental:  number;
    technical:    number;
    entropy:      number;
    semantic:     number;
  }

  let totalValueEur = 0;
  const metrics: PositionMetric[] = [];

  for (const sec of sections) {
    for (const pos of sec.positions) {
      const live = priceMap.get(pos.ticker);
      if (!live || !pos.quantity || !pos.purchasePrice) continue;

      const toEur       = live.currency === "USD" ? usdToEur : 1;
      const valueEur    = live.price * pos.quantity * toEur;
      const purchaseEur = pos.purchasePrice * pos.quantity * toEur;
      const gainPct     = purchaseEur > 0 ? ((valueEur - purchaseEur) / purchaseEur) * 100 : 0;

      const h = historyMap.get(pos.ticker);
      const pillars = h?.pillars as Record<string, { score: number }> | null;

      totalValueEur += valueEur;
      metrics.push({
        ticker:        pos.ticker,
        companyName:   pos.companyName ?? pos.ticker,
        section:       sec.name,
        qty:           pos.quantity,
        purchasePrice: pos.purchasePrice,
        livePrice:     live.price,
        currency:      live.currency,
        valueEur,
        purchaseEur,
        gainPct,
        sector:        h?.sector ?? "Unknown",
        signal:        h?.signal ?? "N/A",
        composite:     h?.score  ?? 0,
        fundamental:   pillars?.fundamental?.score ?? 0,
        technical:     pillars?.technical?.score   ?? 0,
        entropy:       pillars?.entropy?.score     ?? 0,
        semantic:      pillars?.semantic?.score    ?? 0,
      });
    }
  }

  // Sector breakdown
  const sectorMap: Record<string, { valueEur: number; tickers: string[] }> = {};
  for (const m of metrics) {
    if (!sectorMap[m.sector]) sectorMap[m.sector] = { valueEur: 0, tickers: [] };
    sectorMap[m.sector].valueEur += m.valueEur;
    if (!sectorMap[m.sector].tickers.includes(m.ticker)) sectorMap[m.sector].tickers.push(m.ticker);
  }
  const sectorLines = Object.entries(sectorMap)
    .map(([s, d]) => `  ${s}: ${((d.valueEur / totalValueEur) * 100).toFixed(1)}% (${d.tickers.join(", ")})`)
    .join("\n");

  // Regime from average entropy
  const avgEntropy = metrics.length > 0
    ? metrics.reduce((s, m) => s + m.entropy, 0) / metrics.length
    : 10;
  const regime = avgEntropy < 4.5 ? "HIGH" : avgEntropy < 6.0 ? "ELEVATED" : "NORMAL";

  // Position lines for the prompt
  const positionLines = metrics
    .sort((a, b) => b.valueEur - a.valueEur)
    .map(m => {
      const weight = totalValueEur > 0 ? ((m.valueEur / totalValueEur) * 100).toFixed(1) : "?";
      const pnl    = m.gainPct >= 0 ? `+${m.gainPct.toFixed(1)}%` : `${m.gainPct.toFixed(1)}%`;
      return [
        `  ${m.ticker} (${m.companyName}) | Section: ${m.section} | Sector: ${m.sector}`,
        `    Live: ${m.currency} ${m.livePrice.toFixed(2)} | Bought: ${m.currency} ${m.purchasePrice.toFixed(2)} | Qty: ${m.qty} | P&L: ${pnl} | Weight: ${weight}% of portfolio`,
        `    Scores → Composite: ${m.composite.toFixed(1)} | Signal: ${m.signal} | Fund: ${m.fundamental.toFixed(1)} | Tech: ${m.technical.toFixed(1)} | Entropy: ${m.entropy.toFixed(1)} | Semantic: ${m.semantic.toFixed(1)}`,
      ].join("\n");
    }).join("\n\n");

  const cashLine = (cashEur > 0 || cashUsd > 0)
    ? `Cash on hand: EUR ${cashEur.toLocaleString("en-IE")} | USD ${cashUsd.toLocaleString("en-IE")}`
    : "Cash on hand: none recorded";

  const today = new Date().toLocaleDateString("en-IE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const systemPrompt = `You are an elite portfolio manager — seasoned, opinionated, and data-driven. This is YOUR portfolio. Treat it that way.

You have four scoring pillars (scale 0–10):
- Fundamental (30%): earnings quality, valuation, balance sheet
- Technical (35%): price action, momentum, moving averages, volume
- Entropy (10%): volatility risk — LOWER score = MORE volatile/risky
- Semantic (25%): analyst consensus, price targets, sector tailwinds

Signal thresholds: ≥8.5 = STRONG BUY, ≥7.2 = BUY, ≥5.5 = NEUTRAL, ≥4.0 = SELL, <4.0 = STRONG SELL

Portfolio Volatility Regime: ${regime} (avg entropy ${avgEntropy.toFixed(1)}/10)
Total Portfolio Value: EUR ${totalValueEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}
${cashLine}
Today: ${today}

POSITIONS:
${positionLines || "  (none with full data)"}

SECTOR BREAKDOWN:
${sectorLines || "  (no sector data)"}

You are not limited to the user's existing holdings. You have full knowledge of global equities and ETFs. Use it.

Respond with ONLY a raw JSON object — no markdown fences, no prose, nothing outside the braces:
{"summary":"<2-3 sentences: overall health, biggest risk, biggest opportunity>","suggestions":[{"action":"<SELL|TRIM|ADD|BUY|DEPLOY_CASH|HOLD>","ticker":"<TICKER or null>","isNew":true,"priority":"<HIGH|MEDIUM|LOW>","title":"<≤8 words>","reason":"<1-2 sentences citing scores, portfolio gaps, or market rationale>","details":"<price levels, weight%, sector context, why this fits the portfolio — keep under 50 words>","risk":"<one sentence>"}],"cashStrategy":"<one actionable sentence>"}

The "isNew" field: set true if the ticker is NOT currently in the portfolio (a new position to open), false if it is an existing holding.

Rules (strictly follow):
- 5 to 8 suggestions total.
- At least 2 suggestions MUST be new stocks/ETFs not currently in the portfolio — chosen to fill sector gaps, reduce concentration, or improve risk-adjusted returns. Pick specific tickers, not vague sector names.
- When recommending new positions, consider: what sectors are missing or underweight, what complements existing holdings, what has strong fundamentals + technicals right now.
- SELL/TRIM anything with composite < 4.5 or entropy < 3.
- Be decisive. Cite exact numbers. Name real tickers.
- HIGH priority = urgent action needed.
- Keep each field SHORT — this must fit in one response.`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  try {
    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 4096,
      messages:   [{ role: "user", content: "Analyze this portfolio and produce your suggestions JSON now." }],
      system:     systemPrompt,
    });

    const raw        = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    const stopReason = response.stop_reason;
    console.log("[suggestions] stop_reason:", stopReason, "| raw length:", raw.length);
    console.log("[suggestions] raw preview:", raw.slice(0, 300));

    if (stopReason === "max_tokens") {
      console.error("[suggestions] response was truncated — increase max_tokens or shorten prompt");
    }

    let parsed: SuggestionsResponse;
    try {
      // Extract the outermost JSON object regardless of surrounding prose or fences
      const start = raw.indexOf("{");
      const end   = raw.lastIndexOf("}");
      if (start === -1 || end === -1 || end <= start) throw new Error("No JSON object found");
      const jsonText = raw.slice(start, end + 1);
      const obj = JSON.parse(jsonText) as { summary?: string; suggestions?: Suggestion[]; cashStrategy?: string };
      parsed = {
        summary:      obj.summary      ?? "Analysis complete.",
        cashStrategy: obj.cashStrategy ?? "",
        suggestions:  (obj.suggestions ?? []).sort(
          (a, b) => (ACTION_ORDER[a.action] ?? 99) - (ACTION_ORDER[b.action] ?? 99)
        ),
        generatedAt: new Date().toISOString(),
      };
    } catch (parseErr) {
      console.error("[suggestions] JSON parse failed:", parseErr, "\nraw:", raw);
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
