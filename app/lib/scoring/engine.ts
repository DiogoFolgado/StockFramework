export interface Quote {
  c?: number;  // current price
  o?: number;  // open
  h?: number;  // high
  l?: number;  // low
  pc?: number; // previous close
}

export interface Profile {
  name?: string;
  finnhubIndustry?: string;
  industry?: string;
  sector?: string;
  ipo?: string;
  marketCapitalization?: number;
}

export interface Metrics {
  peBasicExclExtraTTM?: number;
  peTTM?: number;
  revenueGrowthTTMYoy?: number;
  grossMarginTTM?: number;
  roeTTM?: number;
  debtEquityQuarterlyLastQ?: number;
  currentRatioQuarterly?: number;
  freeCashFlowPerShareTTM?: number;
  priceToBookQuarterly?: number;
  epsGrowthTTMYoy?: number;
  "52WeekHigh"?: number;
  "52WeekLow"?: number;
  beta?: number;
  "3MonthADTV"?: number;
  targetPriceLow?: number;
  targetPriceHigh?: number;
  targetPriceMean?: number;
  targetPrice?: number;
  marketCapRaw?: number;
}

export interface RecommendationTrend {
  buy?: number;
  hold?: number;
  sell?: number;
  strongBuy?: number;
  strongSell?: number;
}

export interface Candles {
  closes: number[];
  timestamps: number[];
  volumes?: number[];
}

export interface AnalysisInput {
  q: Quote;
  p: Profile;
  m: Metrics;
  rc: RecommendationTrend[];
  candles: Candles | null;
}

export interface PillarResult {
  score: number;
  insights: string[];
  verdict: string;
}

export interface StockScores {
  fundamental: PillarResult;
  technical: PillarResult;
  entropy: PillarResult;
  semantic: PillarResult;
}

export interface CryptoScores {
  cryptoTechnical: PillarResult;
  cryptoMomentum: PillarResult;
  cryptoMarket: PillarResult;
  cryptoSentiment: PillarResult;
}

export const PILLARS = [
  { id: "fundamental", label: "FUNDAMENTAL", icon: "◈", color: "#d4a843", weight: 0.30, wLabel: "30%" },
  { id: "technical",   label: "TECHNICAL",   icon: "◎", color: "#4d9de0", weight: 0.35, wLabel: "35%" },
  { id: "entropy",     label: "ENTROPY",     icon: "◉", color: "#9b72cf", weight: 0.10, wLabel: "10%" },
  { id: "semantic",    label: "SEMANTIC",    icon: "◐", color: "#4cbb8a", weight: 0.25, wLabel: "25%" },
] as const;

export const CRYPTO_PILLARS = [
  { id: "cryptoTechnical", label: "TECHNICAL", icon: "◎", color: "#4d9de0", weight: 0.40, wLabel: "40%" },
  { id: "cryptoMomentum",  label: "MOMENTUM",  icon: "◈", color: "#f7b731", weight: 0.30, wLabel: "30%" },
  { id: "cryptoMarket",    label: "MARKET",    icon: "◉", color: "#9b72cf", weight: 0.20, wLabel: "20%" },
  { id: "cryptoSentiment", label: "SENTIMENT", icon: "◐", color: "#4cbb8a", weight: 0.10, wLabel: "10%" },
] as const;

export function isCrypto(ticker: string): boolean {
  return ticker.endsWith("-USD") || ticker.endsWith("-BTC") || ticker.endsWith("-ETH");
}

export function calcSMA(closes: number[], period: number): number | null {
  if (!closes || closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, v) => a + v, 0) / period;
}

export function calcRSI(closes: number[], period = 14): number | null {
  if (!closes || closes.length < period + 1) return null;
  const slice = closes.slice(-(period + 1));
  let gains = 0, losses = 0;
  for (let i = 1; i < slice.length; i++) {
    const diff = slice[i] - slice[i - 1];
    if (diff > 0) gains += diff; else losses += Math.abs(diff);
  }
  gains /= period; losses /= period;
  if (losses === 0) return 100;
  return 100 - (100 / (1 + gains / losses));
}

export function scoreFundamental({ q, p, m }: Pick<AnalysisInput, "q" | "p" | "m">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];

  const pe = m.peBasicExclExtraTTM ?? m.peTTM;
  if (pe != null) {
    if (pe < 0)       { score -= 0.5; ins.push(`Negative P/E — not currently profitable`); }
    else if (pe < 15) { score += 1.0; ins.push(`P/E ${pe.toFixed(1)}x — deep value territory`); }
    else if (pe < 25) { score += 0.5; ins.push(`P/E ${pe.toFixed(1)}x — fair value range`); }
    else if (pe < 50) { ins.push(`P/E ${pe.toFixed(1)}x — growth premium, execution required`); }
    else              { score -= 0.5; ins.push(`P/E ${pe.toFixed(1)}x — elevated, priced for perfection`); }
  }

  const revG = m.revenueGrowthTTMYoy;
  if (revG != null) {
    if (revG > 50)      { score += 1.5; ins.push(`Revenue +${revG.toFixed(1)}% YoY — hypergrowth`); }
    else if (revG > 20) { score += 1.0; ins.push(`Revenue +${revG.toFixed(1)}% YoY — strong expansion`); }
    else if (revG > 5)  { score += 0.4; ins.push(`Revenue +${revG.toFixed(1)}% YoY — steady growth`); }
    else if (revG > 0)  { ins.push(`Revenue +${revG.toFixed(1)}% YoY — marginal`); }
    else                { score -= 0.8; ins.push(`Revenue ${revG.toFixed(1)}% YoY — shrinking`); }
  }

  const gm = m.grossMarginTTM;
  if (gm != null) {
    if (gm > 65)      { score += 1.2; ins.push(`Gross margin ${gm.toFixed(1)}% — exceptional pricing power`); }
    else if (gm > 40) { score += 0.7; ins.push(`Gross margin ${gm.toFixed(1)}% — healthy`); }
    else if (gm > 20) { score += 0.2; ins.push(`Gross margin ${gm.toFixed(1)}% — adequate`); }
    else              { score -= 0.4; ins.push(`Gross margin ${gm.toFixed(1)}% — thin, under pressure`); }
  }

  const roe = m.roeTTM;
  if (roe != null) {
    if (roe > 30)      { score += 0.6; ins.push(`ROE ${roe.toFixed(1)}% — highly efficient`); }
    else if (roe > 15) { score += 0.3; ins.push(`ROE ${roe.toFixed(1)}% — above average`); }
    else if (roe < 0)  { score -= 0.5; ins.push(`Negative ROE — equity erosion`); }
  }

  const de = m.debtEquityQuarterlyLastQ;
  if (de != null) {
    if (de < 0.3)      { score += 0.4; ins.push(`D/E ${de.toFixed(2)} — very low debt`); }
    else if (de < 1.0) { ins.push(`D/E ${de.toFixed(2)} — moderate leverage`); }
    else if (de < 2.0) { score -= 0.3; ins.push(`D/E ${de.toFixed(2)} — elevated leverage`); }
    else               { score -= 0.6; ins.push(`D/E ${de.toFixed(2)} — high leverage, watch covenants`); }
  }

  const cr = m.currentRatioQuarterly;
  if (cr != null) {
    if (cr > 2.0)      { score += 0.4; ins.push(`Current ratio ${cr.toFixed(1)} — strong liquidity`); }
    else if (cr < 1.0) { score -= 0.5; ins.push(`Current ratio ${cr.toFixed(1)} — near-term liquidity stress`); }
  }

  const fcf = m.freeCashFlowPerShareTTM;
  if (fcf != null) {
    if (fcf > 0) { score += 0.5; ins.push(`FCF/share $${fcf.toFixed(2)} — cash generative`); }
    else         { score -= 0.3; ins.push(`Negative FCF — cash burn, monitor runway`); }
  }

  const pb = m.priceToBookQuarterly;
  if (pb != null) {
    if (pb < 1.5)     { score += 0.3; ins.push(`P/B ${pb.toFixed(1)}x — trading near book value`); }
    else if (pb > 20) { score -= 0.2; ins.push(`P/B ${pb.toFixed(1)}x — significant intangible premium`); }
  }

  const epsG = m.epsGrowthTTMYoy;
  if (epsG != null) {
    if (epsG > 20)     { score += 0.5; ins.push(`EPS growth +${epsG.toFixed(1)}% YoY — accelerating`); }
    else if (epsG > 0) { score += 0.2; ins.push(`EPS growth +${epsG.toFixed(1)}% YoY — positive`); }
    else               { score -= 0.4; ins.push(`EPS growth ${epsG.toFixed(1)}% YoY — declining`); }
  }

  const mc = p.marketCapitalization;
  if (mc) {
    if (mc > 500)     ins.push(`Market cap $${(mc / 1000).toFixed(1)}T — mega-cap`);
    else if (mc > 10) ins.push(`Market cap $${mc.toFixed(0)}B — large-cap`);
    else              ins.push(`Market cap $${mc.toFixed(1)}B — mid/small-cap`);
  }

  const filled = [pe, revG, gm, roe, de, cr, fcf].filter((x) => x != null).length;
  if (filled < 3) ins.push("Limited financial data — treat fundamental score with caution");

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    verdict: s >= 8 ? "Exceptional fundamentals, strong moat" : s >= 6.5 ? "Solid financials" : s >= 5 ? "Mixed — monitor closely" : "Weak fundamentals, elevated risk",
  };
}

export function scoreTechnical({ q, m, candles }: Pick<AnalysisInput, "q" | "m" | "candles">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const cur = q.c;
  const h52 = m["52WeekHigh"];
  const l52 = m["52WeekLow"];

  if (cur && h52 && l52 && h52 > l52) {
    const pct = (cur - l52) / (h52 - l52);
    if (pct > 0.85)      { score += 1.0; ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range ($${l52.toFixed(2)}–$${h52.toFixed(2)}) — near highs`); }
    else if (pct > 0.6)  { score += 0.5; ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — above midpoint`); }
    else if (pct > 0.35) { ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — midpoint`); }
    else                 { score -= 0.8; ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — near lows`); }
  }

  if (q.c && q.o) {
    const d = (q.c - q.o) / q.o;
    if (d > 0.02)       { score += 0.4; ins.push(`Intraday +${(d * 100).toFixed(2)}% vs open`); }
    else if (d < -0.02) { score -= 0.3; ins.push(`Intraday ${(d * 100).toFixed(2)}% vs open`); }
    else                { ins.push(`Near open (${d >= 0 ? "+" : ""}${(d * 100).toFixed(2)}%)`); }
  }

  if (q.c && q.pc) {
    const chg = (q.c - q.pc) / q.pc;
    if (chg > 0.03)       { score += 0.5; ins.push(`+${(chg * 100).toFixed(2)}% vs prev close — strong day`); }
    else if (chg > 0)     { score += 0.1; ins.push(`+${(chg * 100).toFixed(2)}% vs prev close`); }
    else if (chg < -0.03) { score -= 0.4; ins.push(`${(chg * 100).toFixed(2)}% vs prev close`); }
    else                  { ins.push(`${(chg * 100).toFixed(2)}% vs prev close — flat`); }
  }

  if (cur && h52) {
    const d = (h52 - cur) / h52;
    if (d < 0.03)     { score += 0.6; ins.push(`Within 3% of 52W high — breakout watch`); }
    else if (d < 0.1) { score += 0.3; ins.push(`~${(d * 100).toFixed(0)}% below 52W high`); }
    else if (d > 0.4) { score -= 0.5; ins.push(`${(d * 100).toFixed(0)}% below 52W high — significant drawdown`); }
  }

  if (candles && candles.closes && candles.closes.length >= 50) {
    const closes = candles.closes;
    const sma50  = calcSMA(closes, 50);
    const sma200 = calcSMA(closes, 200);
    const rsi    = calcRSI(closes, 14);

    if (sma50 && sma200) {
      if (sma50 > sma200) { score += 0.8; ins.push(`Golden Cross: SMA50 $${sma50.toFixed(2)} > SMA200 $${sma200.toFixed(2)}`); }
      else                { score -= 0.8; ins.push(`Death Cross: SMA50 $${sma50.toFixed(2)} < SMA200 $${sma200.toFixed(2)}`); }
    }

    if (cur && sma50) {
      if (cur > sma50) { score += 0.4; ins.push(`Price above SMA50 ($${sma50.toFixed(2)}) — momentum intact`); }
      else             { score -= 0.3; ins.push(`Price below SMA50 ($${sma50.toFixed(2)}) — short-term weakness`); }
    }

    if (rsi != null) {
      if (rsi < 30)                   { score += 0.5; ins.push(`RSI ${rsi.toFixed(0)} — oversold, potential reversal`); }
      else if (rsi > 70)              { score -= 0.3; ins.push(`RSI ${rsi.toFixed(0)} — overbought, watch for pullback`); }
      else if (rsi >= 45 && rsi <= 60){ score += 0.2; ins.push(`RSI ${rsi.toFixed(0)} — healthy momentum zone`); }
      else                            { ins.push(`RSI ${rsi.toFixed(0)}`); }
    }

    const adtv = m["3MonthADTV"];
    if (adtv && candles.volumes && candles.volumes.length > 0) {
      const recentVol = candles.volumes[candles.volumes.length - 1];
      const ratio = recentVol / (adtv * 1e6);
      if (ratio > 1.5)      { score += 0.3; ins.push(`Volume ${ratio.toFixed(1)}× avg — unusual buying interest`); }
      else if (ratio < 0.3) { ins.push(`Volume ${ratio.toFixed(1)}× avg — low activity`); }
    }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    verdict: s >= 8 ? "Strong buy setup — aligned momentum" : s >= 6.5 ? "Bullish structure, manageable risk" : s >= 5 ? "Mixed signals — wait for confirmation" : "Bearish — caution advised",
  };
}

export function scoreEntropy({ q, m, p, candles }: Pick<AnalysisInput, "q" | "m" | "p" | "candles">): PillarResult {
  let score = 6.5;
  const ins: string[] = [];
  const beta = m.beta;
  const h52  = m["52WeekHigh"];
  const l52  = m["52WeekLow"];

  if (beta != null) {
    if (beta > 2.5)      { score -= 2.2; ins.push(`Beta ${beta.toFixed(2)} — extreme, amplifies ${beta.toFixed(1)}× market moves`); }
    else if (beta > 1.8) { score -= 1.5; ins.push(`Beta ${beta.toFixed(2)} — high volatility`); }
    else if (beta > 1.2) { score -= 0.6; ins.push(`Beta ${beta.toFixed(2)} — moderately above market`); }
    else if (beta > 0.5) { score += 0.4; ins.push(`Beta ${beta.toFixed(2)} — below-market vol, defensive`); }
    else if (beta < 0)   { ins.push(`Negative beta — counter-cyclical`); }
  }

  if (h52 && l52 && l52 > 0) {
    const rng = (h52 - l52) / l52;
    if (rng > 1.5)      { score -= 1.5; ins.push(`52W range spans ${(rng * 100).toFixed(0)}% — extreme entropy`); }
    else if (rng > 0.8) { score -= 0.8; ins.push(`52W range ${(rng * 100).toFixed(0)}% — high dispersion`); }
    else if (rng > 0.4) { score -= 0.2; ins.push(`52W range ${(rng * 100).toFixed(0)}% — moderate`); }
    else                { score += 0.4; ins.push(`52W range ${(rng * 100).toFixed(0)}% — stable, low entropy`); }
  }

  const sector = p.finnhubIndustry ?? p.industry ?? "";
  if (["Biotechnology", "Cryptocurrency", "Cannabis"].some((x) => sector.includes(x))) {
    score -= 0.8; ins.push(`${sector} — binary catalyst sector, high entropy`);
  } else if (["Banks", "Financial Services"].some((x) => sector.includes(x))) {
    score += 0.3; ins.push(`${sector} — regulated, lower structural entropy`);
  } else if (["Utilities", "Consumer Staples", "Insurance"].some((x) => sector.includes(x))) {
    score += 0.4; ins.push(`${sector} — low-complexity defensive`);
  } else if (sector) {
    ins.push(`${sector} — moderate complexity`);
  }

  if (q.h && q.l && q.l > 0) {
    const dr = (q.h - q.l) / q.l;
    if (dr > 0.05) { score -= 0.4; ins.push(`Today's range ${(dr * 100).toFixed(1)}% — elevated intraday vol`); }
    else           { ins.push(`Today's range ${(dr * 100).toFixed(1)}% — orderly`); }
  }

  const adtv = m["3MonthADTV"];
  if (adtv != null) {
    if (adtv < 5)        { score -= 0.6; ins.push(`Avg vol $${adtv.toFixed(1)}M/day — illiquid, wide spreads likely`); }
    else if (adtv < 50)  { score -= 0.2; ins.push(`Avg vol $${adtv.toFixed(0)}M/day — moderate liquidity`); }
    else if (adtv < 500) { score += 0.2; ins.push(`Avg vol $${adtv.toFixed(0)}M/day — liquid`); }
    else                 { score += 0.4; ins.push(`Avg vol $${(adtv / 1000).toFixed(1)}B/day — highly liquid`); }
  }

  if (candles && candles.closes && candles.closes.length >= 30) {
    const closes = candles.closes;
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i - 1] > 0) returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    if (returns.length >= 20) {
      const mean = returns.reduce((a, v) => a + v, 0) / returns.length;
      const variance = returns.reduce((a, v) => a + (v - mean) ** 2, 0) / returns.length;
      const annVol = Math.sqrt(variance * 252);
      if (annVol < 0.15)      { score += 0.8; ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — very stable`); }
      else if (annVol < 0.25) { score += 0.3; ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — normal range`); }
      else if (annVol < 0.40) { score -= 0.5; ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — elevated`); }
      else if (annVol < 0.65) { score -= 1.2; ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — high dispersion`); }
      else                    { score -= 2.0; ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — extreme, options territory`); }
    }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    verdict: s >= 7 ? "Low entropy — stable regime" : s >= 5.5 ? "Moderate complexity — manageable" : s >= 4 ? "High uncertainty — size carefully" : "Extreme entropy — maximum caution",
  };
}

export function scoreSemantic({ q, p, m, rc }: Pick<AnalysisInput, "q" | "p" | "m" | "rc">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];

  if (rc && rc.length > 0) {
    const l = rc[0];
    const total = (l.buy ?? 0) + (l.hold ?? 0) + (l.sell ?? 0) + (l.strongBuy ?? 0) + (l.strongSell ?? 0);
    if (total > 0) {
      const bull = ((l.buy ?? 0) + (l.strongBuy ?? 0)) / total;
      const bear = ((l.sell ?? 0) + (l.strongSell ?? 0)) / total;
      if (bull > 0.7)      { score += 2.0; ins.push(`${Math.round(bull * 100)}% of ${total} analysts: BUY/STRONG BUY`); }
      else if (bull > 0.5) { score += 1.2; ins.push(`${Math.round(bull * 100)}% of ${total} analysts bullish`); }
      else if (bear > 0.4) { score -= 1.0; ins.push(`${Math.round(bear * 100)}% of ${total} analysts bearish`); }
      else                 { ins.push(`Mixed: ${l.buy ?? 0} buy / ${l.hold ?? 0} hold / ${l.sell ?? 0} sell`); }
    }
  }

  const tl  = m.targetPriceLow;
  const th  = m.targetPriceHigh;
  const tm  = m.targetPriceMean ?? m.targetPrice;
  const cur = q.c;
  if (tm) {
    score += 0.5;
    if (cur) {
      const upside = ((tm - cur) / cur) * 100;
      if (upside > 30)      { score += 0.6; }
      else if (upside > 15) { score += 0.3; }
      else if (upside < 0)  { score -= 0.5; }
      const uStr = (upside >= 0 ? "+" : "") + upside.toFixed(1) + "% upside";
      if (tl && th) {
        const spread = (th - tl) / tm;
        if (spread < 0.15)      { score += 0.4; ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr}, analysts tightly aligned)`); }
        else if (spread < 0.40) { score += 0.1; ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr})`); }
        else                    { score -= 0.2; ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr}, wide spread — analysts disagree)`); }
      } else {
        ins.push(`Analyst target $${tm.toFixed(2)} (${uStr})`);
      }
    } else if (tl && th) {
      ins.push(`Targets: $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)}`);
    }
  }

  const sector = p.finnhubIndustry ?? p.industry ?? "";
  if (["Semiconductors", "Software", "Internet", "Artificial", "Cloud", "Technology", "Aerospace"].some((x) => sector.includes(x))) {
    score += 0.8; ins.push(`${sector} — structural tailwinds`);
  } else if (["Real Estate", "Energy Oil", "Coal"].some((x) => sector.includes(x))) {
    score -= 0.3; ins.push(`${sector} — sector headwinds`);
  } else if (sector) {
    ins.push(`Sector: ${sector}`);
  }

  const ipo = p.ipo;
  if (ipo) {
    const yrs = (Date.now() - new Date(ipo).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (yrs < 1)      { score -= 0.5; ins.push(`IPO ${ipo} — very recent, limited history`); }
    else if (yrs < 3) { ins.push(`IPO ${ipo} — narrative still forming`); }
    else              { ins.push(`Public since ${ipo} — established track record`); }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 5),
    verdict: s >= 8 ? "Overwhelming bullish consensus" : s >= 6.5 ? "Positive backdrop, supportive consensus" : s >= 5 ? "Mixed narrative, diverging views" : "Bearish consensus, caution",
  };
}

export function composite(scores: StockScores): number {
  return PILLARS.reduce((a, p) => a + (scores as unknown as Record<string, PillarResult>)[p.id].score * p.weight, 0);
}

export function compositeCrypto(scores: CryptoScores): number {
  return CRYPTO_PILLARS.reduce((a, p) => a + (scores as unknown as Record<string, PillarResult>)[p.id].score * p.weight, 0);
}

export function signal(c: number): string {
  if (c >= 8.5) return "STRONG BUY";
  if (c >= 7.2) return "BUY";
  if (c >= 5.5) return "NEUTRAL";
  if (c >= 4.0) return "SELL";
  return "STRONG SELL";
}

export function riskLevel(beta: number | undefined, entropyScore: number): "LOW" | "MEDIUM" | "HIGH" {
  if (!beta) return entropyScore < 5 ? "HIGH" : "MEDIUM";
  if (beta > 1.8 || entropyScore < 4.5) return "HIGH";
  if (beta > 1.2 || entropyScore < 6)   return "MEDIUM";
  return "LOW";
}

export function runScoring(data: AnalysisInput): {
  scores: StockScores | CryptoScores;
  comp: number;
  sig: string;
} {
  if (isCrypto("")) {
    throw new Error("Use runCryptoScoring for crypto tickers");
  }
  const scores: StockScores = {
    fundamental: scoreFundamental(data),
    technical:   scoreTechnical(data),
    entropy:     scoreEntropy(data),
    semantic:    scoreSemantic(data),
  };
  const comp = composite(scores);
  return { scores, comp, sig: signal(comp) };
}

export function runStockScoring(data: AnalysisInput): { scores: StockScores; comp: number; sig: string } {
  const scores: StockScores = {
    fundamental: scoreFundamental(data),
    technical:   scoreTechnical(data),
    entropy:     scoreEntropy(data),
    semantic:    scoreSemantic(data),
  };
  const comp = composite(scores);
  return { scores, comp, sig: signal(comp) };
}
