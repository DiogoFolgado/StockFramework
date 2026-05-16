import type { Quote, Profile, Metrics, RecommendationTrend, Candles, AnalysisInput } from "../scoring/engine";

const PROXY = process.env.YAHOO_WORKER_URL ?? "https://noisy-bread-1e4c.diogo-lafp.workers.dev";

async function yf<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "StockFramework/2.0" },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Yahoo proxy error (HTTP ${res.status})`);
  return res.json() as Promise<T>;
}

export async function fetchQuote(ticker: string): Promise<Quote> {
  const d = await yf<{ chart?: { result?: Array<{ meta?: Record<string, unknown>; indicators?: { quote?: Array<Record<string, unknown[]>> } }> } }>(
    `${PROXY}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
  );
  const r = d?.chart?.result?.[0];
  if (!r) throw new Error("No quote data");
  const meta = r.meta as Record<string, number> ?? {};
  return {
    c:  meta.regularMarketPrice,
    o:  meta.regularMarketOpen,
    h:  meta.regularMarketDayHigh,
    l:  meta.regularMarketDayLow,
    pc: meta.chartPreviousClose ?? meta.previousClose,
  };
}

export async function fetchProfile(ticker: string): Promise<Profile> {
  const d = await yf<{ quoteSummary?: { result?: Array<{ assetProfile?: Record<string, unknown>; price?: Record<string, unknown> }> } }>(
    `${PROXY}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=assetProfile%2Cprice`
  );
  const r = d?.quoteSummary?.result?.[0];
  if (!r) return {};
  const ap = r.assetProfile as Record<string, unknown> ?? {};
  const pr = r.price as Record<string, unknown> ?? {};
  return {
    name:                (pr.longName ?? pr.shortName ?? ap.longName) as string | undefined,
    finnhubIndustry:     (ap.industry) as string | undefined,
    industry:            (ap.industry) as string | undefined,
    sector:              (ap.sector) as string | undefined,
    ipo:                 (ap.ipoExpectedDate) as string | undefined,
    marketCapitalization:(typeof pr.marketCap === "object" && pr.marketCap !== null
      ? ((pr.marketCap as Record<string, number>).raw ?? 0) / 1e9
      : 0),
  };
}

export async function fetchMetrics(ticker: string): Promise<Metrics> {
  const d = await yf<{ quoteSummary?: { result?: Array<Record<string, Record<string, unknown>>> } }>(
    `${PROXY}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=defaultKeyStatistics%2CfinancialData%2CsummaryDetail`
  );
  const r = d?.quoteSummary?.result?.[0];
  if (!r) return {};

  function raw(obj: Record<string, unknown> | undefined, key: string): number | undefined {
    if (!obj) return undefined;
    const v = obj[key];
    if (v == null) return undefined;
    if (typeof v === "number") return v;
    if (typeof v === "object" && v !== null && "raw" in v) return (v as { raw: number }).raw;
    return undefined;
  }

  const ks = r.defaultKeyStatistics as Record<string, unknown> ?? {};
  const fd = r.financialData as Record<string, unknown> ?? {};
  const sd = r.summaryDetail as Record<string, unknown> ?? {};

  return {
    peBasicExclExtraTTM:       raw(sd as Record<string, unknown>, "trailingPE"),
    peTTM:                     raw(sd as Record<string, unknown>, "trailingPE"),
    revenueGrowthTTMYoy:       raw(fd as Record<string, unknown>, "revenueGrowth") != null ? (raw(fd as Record<string, unknown>, "revenueGrowth")! * 100) : undefined,
    grossMarginTTM:            raw(fd as Record<string, unknown>, "grossMargins") != null ? (raw(fd as Record<string, unknown>, "grossMargins")! * 100) : undefined,
    roeTTM:                    raw(fd as Record<string, unknown>, "returnOnEquity") != null ? (raw(fd as Record<string, unknown>, "returnOnEquity")! * 100) : undefined,
    debtEquityQuarterlyLastQ:  raw(ks as Record<string, unknown>, "debtToEquity") != null ? (raw(ks as Record<string, unknown>, "debtToEquity")! / 100) : undefined,
    currentRatioQuarterly:     raw(fd as Record<string, unknown>, "currentRatio"),
    freeCashFlowPerShareTTM:   raw(fd as Record<string, unknown>, "freeCashflow") != null && raw(ks as Record<string, unknown>, "sharesOutstanding") != null
      ? raw(fd as Record<string, unknown>, "freeCashflow")! / raw(ks as Record<string, unknown>, "sharesOutstanding")! : undefined,
    priceToBookQuarterly:      raw(ks as Record<string, unknown>, "priceToBook"),
    epsGrowthTTMYoy:           raw(ks as Record<string, unknown>, "earningsQuarterlyGrowth") != null ? (raw(ks as Record<string, unknown>, "earningsQuarterlyGrowth")! * 100) : undefined,
    "52WeekHigh":              raw(sd as Record<string, unknown>, "fiftyTwoWeekHigh"),
    "52WeekLow":               raw(sd as Record<string, unknown>, "fiftyTwoWeekLow"),
    beta:                      raw(sd as Record<string, unknown>, "beta") ?? raw(ks as Record<string, unknown>, "beta3Year"),
    "3MonthADTV":              raw(sd as Record<string, unknown>, "averageVolume3Month") != null
      ? (raw(sd as Record<string, unknown>, "averageVolume3Month")! / 1e6) : undefined,
    targetPriceMean:           raw(fd as Record<string, unknown>, "targetMeanPrice"),
    targetPriceLow:            raw(fd as Record<string, unknown>, "targetLowPrice"),
    targetPriceHigh:           raw(fd as Record<string, unknown>, "targetHighPrice"),
    epsTTM:                    raw(ks as Record<string, unknown>, "trailingEps"),
    peForwardAnnual:           raw(sd as Record<string, unknown>, "forwardPE"),
    dividendYieldIndicatedAnnual: raw(sd as Record<string, unknown>, "dividendYield") != null
      ? (raw(sd as Record<string, unknown>, "dividendYield")! * 100) : undefined,
  };
}

export async function fetchRecommendations(ticker: string): Promise<RecommendationTrend[]> {
  const d = await yf<{ quoteSummary?: { result?: Array<{ recommendationTrend?: { trend?: RecommendationTrend[] } }> } }>(
    `${PROXY}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=recommendationTrend`
  );
  return d?.quoteSummary?.result?.[0]?.recommendationTrend?.trend ?? [];
}

export async function fetchCandles(ticker: string, interval = "1d", range = "1y"): Promise<Candles | null> {
  const d = await yf<{ chart?: { result?: Array<{ indicators?: { quote?: Array<{ close?: number[]; volume?: number[] }>}; timestamp?: number[] }> } }>(
    `${PROXY}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`
  );
  const r = d?.chart?.result?.[0];
  if (!r) return null;
  const q = r.indicators?.quote?.[0];
  if (!q?.close || q.close.length < 10) return null;
  return {
    closes:     q.close.filter((v) => v != null) as number[],
    timestamps: r.timestamp ?? [],
    volumes:    q.volume?.filter((v) => v != null) as number[] | undefined,
  };
}

export async function fetchAll(ticker: string): Promise<AnalysisInput> {
  const [quote, profile, metrics, reco, candle] = await Promise.allSettled([
    fetchQuote(ticker),
    fetchProfile(ticker),
    fetchMetrics(ticker),
    fetchRecommendations(ticker),
    fetchCandles(ticker, "1d", "1y"),
  ]);

  const q  = quote.status   === "fulfilled" ? quote.value   : ({} as Quote);
  const p  = profile.status === "fulfilled" ? profile.value : ({} as Profile);
  const m  = metrics.status === "fulfilled" ? metrics.value : ({} as Metrics);
  const rc = reco.status    === "fulfilled" ? reco.value    : [];
  const candles = candle.status === "fulfilled" ? candle.value : null;

  if (!q.c) throw new Error("No data returned — check ticker symbol");
  return { q, p, m, rc, candles };
}

export async function fetchAllLite(ticker: string): Promise<AnalysisInput> {
  const [quote, profile, metrics, reco] = await Promise.allSettled([
    fetchQuote(ticker),
    fetchProfile(ticker),
    fetchMetrics(ticker),
    fetchRecommendations(ticker),
  ]);

  const q  = quote.status   === "fulfilled" ? quote.value   : ({} as Quote);
  const p  = profile.status === "fulfilled" ? profile.value : ({} as Profile);
  const m  = metrics.status === "fulfilled" ? metrics.value : ({} as Metrics);
  const rc = reco.status    === "fulfilled" ? reco.value    : [];

  if (!q.c) throw new Error("No data returned — check ticker symbol");
  return { q, p, m, rc, candles: null };
}

export async function searchTickers(query: string): Promise<Array<{ ticker: string; name: string; exchange: string; type: string }>> {
  const d = await yf<{ quotes?: Array<{ symbol?: string; longname?: string; shortname?: string; exchange?: string; quoteType?: string }> }>(
    `${PROXY}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0`
  );
  const quotes = d?.quotes ?? [];
  return quotes
    .filter((q) => q.symbol && (q.quoteType === "EQUITY" || q.quoteType === "CRYPTOCURRENCY"))
    .map((q) => ({
      ticker:   q.symbol!,
      name:     q.longname ?? q.shortname ?? q.symbol!,
      exchange: q.exchange ?? "",
      type:     q.quoteType ?? "EQUITY",
    }));
}
