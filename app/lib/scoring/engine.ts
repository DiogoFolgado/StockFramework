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
  epsTTM?: number;
  peForwardAnnual?: number;
  dividendYieldIndicatedAnnual?: number;
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

export interface ScoreDelta {
  label: string;
  delta: number;
}

export interface PillarResult {
  score: number;
  insights: string[];
  verdict: string;
  deltas: ScoreDelta[];
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

export function calcEMA(closes: number[], period: number): number[] {
  if (!closes || closes.length < period) return [];
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, v) => a + v, 0) / period;
  const result = [ema];
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

export function calcMACD(
  closes: number[],
  fast = 12, slow = 26, sig = 9
): { macd: number; signal: number; histogram: number } | null {
  if (!closes || closes.length < slow + sig) return null;
  const emaF = calcEMA(closes, fast);
  const emaS = calcEMA(closes, slow);
  const off = emaF.length - emaS.length;
  const macdLine = emaS.map((s, i) => emaF[i + off] - s);
  const signalLine = calcEMA(macdLine, sig);
  if (macdLine.length === 0 || signalLine.length === 0) return null;
  const latestMacd = macdLine[macdLine.length - 1];
  const latestSig  = signalLine[signalLine.length - 1];
  return { macd: latestMacd, signal: latestSig, histogram: latestMacd - latestSig };
}

export function calcBollingerBands(
  closes: number[], period = 20
): { upper: number; middle: number; lower: number; bandwidth: number } | null {
  if (!closes || closes.length < period) return null;
  const slice  = closes.slice(-period);
  const middle = slice.reduce((a, v) => a + v, 0) / period;
  const std    = Math.sqrt(slice.reduce((a, v) => a + (v - middle) ** 2, 0) / period);
  const upper  = middle + 2 * std;
  const lower  = middle - 2 * std;
  return { upper, middle, lower, bandwidth: (upper - lower) / middle };
}

function calcBullRatio(r: RecommendationTrend): number {
  const total = (r.buy ?? 0) + (r.hold ?? 0) + (r.sell ?? 0)
              + (r.strongBuy ?? 0) + (r.strongSell ?? 0);
  if (total === 0) return 0.5;
  return ((r.buy ?? 0) + (r.strongBuy ?? 0)) / total;
}

function getSectorPEBands(sector: string): { value: number; fair: number; growth: number; extreme: number } {
  const s = sector.toLowerCase();
  if (["biotechnology", "pharmaceutical", "drug", "biomed"].some(x => s.includes(x)))
    return { value: 30, fair: 60, growth: 100, extreme: 150 };
  if (["utility", "utilities", "water", "electric", "gas distribution"].some(x => s.includes(x)))
    return { value: 12, fair: 18, growth: 25, extreme: 35 };
  if (["bank", "insurance", "financial services"].some(x => s.includes(x)))
    return { value: 8, fair: 14, growth: 20, extreme: 28 };
  if (["real estate", "reit"].some(x => s.includes(x)))
    return { value: 20, fair: 35, growth: 50, extreme: 80 };
  if (["software", "internet", "cloud", "saas", "technology"].some(x => s.includes(x)))
    return { value: 20, fair: 40, growth: 70, extreme: 120 };
  if (["semiconductor"].some(x => s.includes(x)))
    return { value: 15, fair: 30, growth: 50, extreme: 80 };
  if (["consumer staples", "food", "beverage", "household"].some(x => s.includes(x)))
    return { value: 12, fair: 20, growth: 28, extreme: 40 };
  return { value: 12, fair: 22, growth: 40, extreme: 60 };
}

export function scoreFundamental({ q, p, m }: Pick<AnalysisInput, "q" | "p" | "m">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };

  // Sector-adjusted P/E
  const pe = m.peBasicExclExtraTTM ?? m.peTTM;
  const sectorStr = (p.sector ?? p.finnhubIndustry ?? p.industry ?? "").toLowerCase();
  const peBands = getSectorPEBands(sectorStr);
  if (pe != null) {
    if (pe < 0)                  { d("P/E negative", -0.5); ins.push(`Negative P/E — not currently profitable`); }
    else if (pe < peBands.value) { d("P/E value", +1.0);    ins.push(`P/E ${pe.toFixed(1)}x — value territory for this sector`); }
    else if (pe < peBands.fair)  { d("P/E fair", +0.5);     ins.push(`P/E ${pe.toFixed(1)}x — fair value range`); }
    else if (pe < peBands.growth){ ins.push(`P/E ${pe.toFixed(1)}x — growth premium, execution required`); }
    else if (pe < peBands.extreme){ d("P/E elevated", -0.3); ins.push(`P/E ${pe.toFixed(1)}x — elevated for sector`); }
    else                         { d("P/E extreme", -0.6);  ins.push(`P/E ${pe.toFixed(1)}x — extreme valuation, priced for perfection`); }
  }

  // Forward P/E — signals earnings trajectory
  const peF = m.peForwardAnnual;
  const peT = m.peBasicExclExtraTTM ?? m.peTTM;
  if (peF != null && peF > 0 && peT != null && peT > 0) {
    const discount = (peT - peF) / peT;
    if (discount > 0.25)       { d("Fwd P/E growth", +0.5); ins.push(`Forward P/E ${peF.toFixed(1)}x vs trailing ${peT.toFixed(1)}x — strong earnings growth priced in`); }
    else if (discount > 0.10)  { d("Fwd P/E expand", +0.2); ins.push(`Forward P/E ${peF.toFixed(1)}x — modest earnings expansion expected`); }
    else if (discount < -0.10) { d("Fwd P/E shrink", -0.3); ins.push(`Forward P/E ${peF.toFixed(1)}x > trailing — earnings expected to shrink`); }
  }

  const revG = m.revenueGrowthTTMYoy;
  if (revG != null) {
    if (revG > 50)      { d("Revenue hyper", +1.0); ins.push(`Revenue +${revG.toFixed(1)}% YoY — hypergrowth`); }
    else if (revG > 20) { d("Revenue strong", +0.8); ins.push(`Revenue +${revG.toFixed(1)}% YoY — strong expansion`); }
    else if (revG > 5)  { d("Revenue steady", +0.4); ins.push(`Revenue +${revG.toFixed(1)}% YoY — steady growth`); }
    else if (revG > 0)  { ins.push(`Revenue +${revG.toFixed(1)}% YoY — marginal`); }
    else                { d("Revenue shrink", -0.8); ins.push(`Revenue ${revG.toFixed(1)}% YoY — shrinking`); }
  }

  const gm = m.grossMarginTTM;
  if (gm != null) {
    if (gm > 65)      { d("Margin except.", +0.8); ins.push(`Gross margin ${gm.toFixed(1)}% — exceptional pricing power`); }
    else if (gm > 40) { d("Margin healthy", +0.5); ins.push(`Gross margin ${gm.toFixed(1)}% — healthy`); }
    else if (gm > 20) { d("Margin adequate", +0.2); ins.push(`Gross margin ${gm.toFixed(1)}% — adequate`); }
    else              { d("Margin thin", -0.4); ins.push(`Gross margin ${gm.toFixed(1)}% — thin, under pressure`); }
  }

  const roe = m.roeTTM;
  if (roe != null) {
    if (roe > 30)      { d("ROE efficient", +0.6); ins.push(`ROE ${roe.toFixed(1)}% — highly efficient`); }
    else if (roe > 15) { d("ROE above avg", +0.3); ins.push(`ROE ${roe.toFixed(1)}% — above average`); }
    else if (roe < 0)  { d("ROE negative", -0.5); ins.push(`Negative ROE — equity erosion`); }
  }

  const de = m.debtEquityQuarterlyLastQ;
  if (de != null) {
    if (de < 0.3)      { d("Debt very low", +0.4); ins.push(`D/E ${de.toFixed(2)} — very low debt`); }
    else if (de < 1.0) { ins.push(`D/E ${de.toFixed(2)} — moderate leverage`); }
    else if (de < 2.0) { d("Debt elevated", -0.3); ins.push(`D/E ${de.toFixed(2)} — elevated leverage`); }
    else               { d("Debt high", -0.6); ins.push(`D/E ${de.toFixed(2)} — high leverage, watch covenants`); }
  }

  const cr = m.currentRatioQuarterly;
  if (cr != null) {
    if (cr > 2.0)      { d("Liquidity strong", +0.4); ins.push(`Current ratio ${cr.toFixed(1)} — strong liquidity`); }
    else if (cr < 1.0) { d("Liquidity stress", -0.5); ins.push(`Current ratio ${cr.toFixed(1)} — near-term liquidity stress`); }
  }

  const fcf = m.freeCashFlowPerShareTTM;
  if (fcf != null) {
    if (fcf > 0) { d("FCF positive", +0.5); ins.push(`FCF/share $${fcf.toFixed(2)} — cash generative`); }
    else         { d("FCF negative", -0.3); ins.push(`Negative FCF — cash burn, monitor runway`); }
  }

  const pb = m.priceToBookQuarterly;
  if (pb != null) {
    if (pb < 1.5)     { d("P/B near book", +0.3); ins.push(`P/B ${pb.toFixed(1)}x — trading near book value`); }
    else if (pb > 20) { d("P/B premium", -0.2); ins.push(`P/B ${pb.toFixed(1)}x — significant intangible premium`); }
  }

  // Dividend yield — context-aware (growth stocks vs income stocks)
  const divY = m.dividendYieldIndicatedAnnual;
  if (divY != null && divY > 0) {
    const isGrowthSector = ["technology", "software", "semiconductor", "biotechnology", "internet"]
      .some(x => sectorStr.includes(x));
    if (isGrowthSector) {
      if (divY > 4)       ins.push(`Yield ${divY.toFixed(2)}% — unusually high for growth sector, verify sustainability`);
      else if (divY > 0.5){ d("Div growth sector", +0.1); ins.push(`Yield ${divY.toFixed(2)}% — returning capital in growth sector`); }
    } else {
      if (divY > 6)      { d("Div high income", +0.6); ins.push(`Yield ${divY.toFixed(2)}% — high income`); }
      else if (divY > 3) { d("Div solid income", +0.4); ins.push(`Yield ${divY.toFixed(2)}% — solid income component`); }
      else if (divY > 1) { d("Div modest", +0.2); ins.push(`Yield ${divY.toFixed(2)}% — modest income`); }
    }
  }

  const epsG = m.epsGrowthTTMYoy;
  if (epsG != null) {
    if (epsG > 20)     { d("EPS accel.", +0.5); ins.push(`EPS growth +${epsG.toFixed(1)}% YoY — accelerating`); }
    else if (epsG > 0) { d("EPS positive", +0.2); ins.push(`EPS growth +${epsG.toFixed(1)}% YoY — positive`); }
    else               { d("EPS declining", -0.4); ins.push(`EPS growth ${epsG.toFixed(1)}% YoY — declining`); }
  }

  // Absolute EPS — catches "growth off a negative base" artefact
  const epsTTM = m.epsTTM;
  if (epsTTM != null && epsTTM < 0) {
    const sev = epsTTM < -5 ? 0.6 : epsTTM < -1 ? 0.4 : 0.2;
    d("EPS loss", -sev);
    ins.push(`EPS $${epsTTM.toFixed(2)} — loss-making on absolute basis`);
  }

  // PEG ratio — integrates valuation and growth
  const peForPeg = m.peForwardAnnual ?? m.peBasicExclExtraTTM ?? m.peTTM;
  if (peForPeg != null && peForPeg > 0 && epsG != null && epsG > 0) {
    const peg = peForPeg / epsG;
    if (peg < 0.75)      { d("PEG deep value", +0.8); ins.push(`PEG ${peg.toFixed(2)} — deeply undervalued relative to growth`); }
    else if (peg < 1.0)  { d("PEG attractive", +0.5); ins.push(`PEG ${peg.toFixed(2)} — attractive growth-adjusted valuation`); }
    else if (peg < 1.5)  { d("PEG fair", +0.1); ins.push(`PEG ${peg.toFixed(2)} — fair growth-adjusted price`); }
    else if (peg < 2.5)  { ins.push(`PEG ${peg.toFixed(2)} — paying a premium for growth`); }
    else                 { d("PEG expensive", -0.4); ins.push(`PEG ${peg.toFixed(2)} — expensive even accounting for growth`); }
  } else if (peForPeg != null && peForPeg > 0 && epsG != null && epsG < -20) {
    d("PEG undefined", -0.3);
    ins.push(`PEG undefined — P/E elevated while EPS declining sharply`);
  }

  const mc = p.marketCapitalization;
  if (mc) {
    if (mc > 500)     ins.push(`Market cap $${(mc / 1000).toFixed(1)}T — mega-cap`);
    else if (mc > 10) ins.push(`Market cap $${mc.toFixed(0)}B — large-cap`);
    else              ins.push(`Market cap $${mc.toFixed(1)}B — mid/small-cap`);
  }

  // Data completeness — sliding scale penalty
  const filled = [pe, revG, gm, roe, de, cr, fcf, pb, epsG].filter((x) => x != null).length;
  if (filled < 3)      { d("Data limited", -0.5); ins.push(`Very limited data (${filled}/9 metrics) — treat score with caution`); }
  else if (filled < 5) { d("Data partial", -0.2); ins.push(`Partial data (${filled}/9 metrics) — some signals unavailable`); }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 8),
    deltas,
    verdict: s >= 8.5 ? "Exceptional — durable moat, strong cash generation"
           : s >= 7.0 ? "Solid financials — above-average quality business"
           : s >= 5.5 ? "Mixed fundamentals — monitor key metrics closely"
           : s >= 4.0 ? "Weak fundamentals — elevated financial risk"
           :            "Poor fundamentals — capital preservation at risk",
  };
}

export function scoreTechnical({ q, m, candles }: Pick<AnalysisInput, "q" | "m" | "candles">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };
  const cur = q.c;
  const h52 = m["52WeekHigh"];
  const l52 = m["52WeekLow"];

  if (cur && h52 && l52 && h52 > l52) {
    const pct = (cur - l52) / (h52 - l52);
    if (pct > 0.85)      { d("52W near highs", +0.7); ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range ($${l52.toFixed(2)}–$${h52.toFixed(2)}) — near highs`); }
    else if (pct > 0.6)  { d("52W above mid", +0.5); ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — above midpoint`); }
    else if (pct > 0.35) { ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — midpoint`); }
    else                 { d("52W near lows", -0.8); ins.push(`At ${(pct * 100).toFixed(0)}% of 52W range — near lows`); }
  }

  if (q.c && q.o) {
    const dv = (q.c - q.o) / q.o;
    if (dv > 0.02)       { d("Intraday up", +0.4); ins.push(`Intraday +${(dv * 100).toFixed(2)}% vs open`); }
    else if (dv < -0.02) { d("Intraday down", -0.3); ins.push(`Intraday ${(dv * 100).toFixed(2)}% vs open`); }
    else                 { ins.push(`Near open (${dv >= 0 ? "+" : ""}${(dv * 100).toFixed(2)}%)`); }
  }

  if (q.c && q.pc) {
    const chg = (q.c - q.pc) / q.pc;
    if (chg > 0.03)       { d("Strong day", +0.5); ins.push(`+${(chg * 100).toFixed(2)}% vs prev close — strong day`); }
    else if (chg > 0)     { d("Positive day", +0.1); ins.push(`+${(chg * 100).toFixed(2)}% vs prev close`); }
    else if (chg < -0.03) { d("Weak day", -0.4); ins.push(`${(chg * 100).toFixed(2)}% vs prev close`); }
    else                  { ins.push(`${(chg * 100).toFixed(2)}% vs prev close — flat`); }
  }

  if (cur && h52) {
    const dv = (h52 - cur) / h52;
    if (dv < 0.03)     { d("Breakout watch", +0.6); ins.push(`Within 3% of 52W high — breakout watch`); }
    else if (dv < 0.1) { d("Near 52W high", +0.3); ins.push(`~${(dv * 100).toFixed(0)}% below 52W high`); }
    else if (dv > 0.4) { d("Big drawdown", -0.5); ins.push(`${(dv * 100).toFixed(0)}% below 52W high — significant drawdown`); }
  }

  if (candles && candles.closes && candles.closes.length >= 50) {
    const closes = candles.closes;
    const sma50  = calcSMA(closes, 50);
    const sma200 = calcSMA(closes, 200);
    const rsi    = calcRSI(closes, 14);

    // SMA cross with separation scoring (replaces binary golden/death cross)
    if (sma50 && sma200) {
      const sep = (sma50 - sma200) / sma200;
      if (sep > 0.05)       { d("Golden cross str.", +0.9); ins.push(`Golden Cross: SMA50 ${(sep * 100).toFixed(1)}% above SMA200 — strong trend`); }
      else if (sep > 0.01)  { d("Golden cross early", +0.5); ins.push(`Golden Cross: SMA50 just above SMA200 — early uptrend`); }
      else if (sep > -0.01) { ins.push(`SMA50/200 converging — cross imminent, direction uncertain`); }
      else if (sep > -0.05) { d("Death cross", -0.5); ins.push(`Death Cross: SMA50 below SMA200 — recent breakdown`); }
      else                  { d("Death cross deep", -0.8); ins.push(`Death Cross: SMA50 ${(Math.abs(sep) * 100).toFixed(1)}% below SMA200 — entrenched downtrend`); }
    }

    if (cur && sma50) {
      if (cur > sma50) { d("Above SMA50", +0.4); ins.push(`Price above SMA50 ($${sma50.toFixed(2)}) — momentum intact`); }
      else             { d("Below SMA50", -0.3); ins.push(`Price below SMA50 ($${sma50.toFixed(2)}) — short-term weakness`); }
    }

    // RSI — momentum-aligned (oversold penalises, not rewards)
    if (rsi != null) {
      if (rsi >= 50 && rsi <= 65)     { d("RSI bullish", +0.5); ins.push(`RSI ${rsi.toFixed(0)} — bullish momentum range`); }
      else if (rsi > 65 && rsi <= 75) { d("RSI strong", +0.2); ins.push(`RSI ${rsi.toFixed(0)} — strong, watch for exhaustion`); }
      else if (rsi > 75)              { d("RSI overbought", -0.4); ins.push(`RSI ${rsi.toFixed(0)} — overbought, pullback risk`); }
      else if (rsi >= 35 && rsi < 50) { d("RSI weak", -0.2); ins.push(`RSI ${rsi.toFixed(0)} — below neutral, weak momentum`); }
      else                            { d("RSI oversold", -0.5); ins.push(`RSI ${rsi.toFixed(0)} — oversold, selling pressure dominant`); }
    }

    // MACD(12,26,9) — trend confirmation
    const macd = calcMACD(closes);
    if (macd) {
      if (macd.macd > macd.signal && macd.histogram > 0)
        { d("MACD bullish", +0.5); ins.push(`MACD bullish — line above signal, positive histogram`); }
      else if (macd.macd < macd.signal && macd.histogram < 0)
        { d("MACD bearish", -0.5); ins.push(`MACD bearish — line below signal, negative histogram`); }
      else if (macd.macd > macd.signal && macd.histogram < 0)
        { ins.push(`MACD: bullish cross but histogram narrowing — momentum fading`); }
      else if (macd.macd < macd.signal && macd.histogram > 0)
        { ins.push(`MACD: bearish but histogram turning — possible base forming`); }
    }

    // Bollinger Bands(20,2) — overbought/oversold + squeeze detection
    const bb = calcBollingerBands(closes);
    if (bb && cur) {
      const pctB = (cur - bb.lower) / (bb.upper - bb.lower);
      if (pctB > 0.95)      { d("BB stretched", -0.4); ins.push(`Price at Bollinger upper band — statistically stretched`); }
      else if (pctB > 0.75) { d("BB upper zone", +0.2); ins.push(`Price in upper Bollinger zone — strong momentum confirmed`); }
      else if (pctB < 0.05) { d("BB lower band", -0.3); ins.push(`Price at Bollinger lower band — oversold vs recent range`); }
      if (bb.bandwidth < 0.05) ins.push(`Bollinger squeeze (${(bb.bandwidth * 100).toFixed(1)}% band) — volatility compression, breakout imminent`);
    }

    // 5-day sustained volume expansion vs single-day spot check
    const adtv = m["3MonthADTV"];
    const adtvRaw = (adtv ?? 0) * 1e6;
    if (adtvRaw > 0 && candles.volumes && candles.volumes.length >= 5) {
      const recentVols = candles.volumes.slice(-5);
      const latestVol  = candles.volumes[candles.volumes.length - 1];
      const avg5d      = recentVols.reduce((a, v) => a + v, 0) / recentVols.length;
      const ratio5     = avg5d / adtvRaw;
      const ratioToday = latestVol / adtvRaw;
      if (ratio5 > 1.5 && ratioToday > 1.2)  { d("Vol sustained", +0.5); ins.push(`Volume ${ratio5.toFixed(1)}× ADTV (5d avg) — sustained institutional buying`); }
      else if (ratio5 > 1.2)                  { d("Vol elevated", +0.2); ins.push(`Volume ${ratio5.toFixed(1)}× ADTV (5d avg) — elevated activity`); }
      else if (ratioToday > 1.5)              { d("Vol spike", +0.3); ins.push(`Today ${ratioToday.toFixed(1)}× ADTV — spike, watch for follow-through`); }
      else if (ratio5 < 0.5)                  { d("Vol thin", -0.1); ins.push(`Volume ${ratio5.toFixed(1)}× ADTV — thin participation`); }
    } else if ((m["3MonthADTV"] ?? 0) > 0 && candles.volumes && candles.volumes.length > 0) {
      const latestVol = candles.volumes[candles.volumes.length - 1];
      const ratio = latestVol / adtvRaw;
      if (ratio > 1.5) { d("Vol spike", +0.3); ins.push(`Volume ${ratio.toFixed(1)}× ADTV — unusual buying interest`); }
    }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 8),
    deltas,
    verdict: s >= 8.0 ? "Strong momentum setup — trend and indicators aligned"
           : s >= 6.5 ? "Constructive structure — bias bullish"
           : s >= 5.0 ? "Mixed signals — wait for trend confirmation"
           : s >= 3.5 ? "Bearish structure — trend and indicators weak"
           :            "Severe technical breakdown — maximum caution",
  };
}

export function scoreEntropy({ q, m, p, candles }: Pick<AnalysisInput, "q" | "m" | "p" | "candles">): PillarResult {
  let score = 6.5;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };
  const beta = m.beta;
  const h52  = m["52WeekHigh"];
  const l52  = m["52WeekLow"];

  if (beta != null) {
    if (beta > 2.5)      { d("Beta extreme", -2.2); ins.push(`Beta ${beta.toFixed(2)} — extreme, amplifies ${beta.toFixed(1)}× market moves`); }
    else if (beta > 1.8) { d("Beta high", -1.5); ins.push(`Beta ${beta.toFixed(2)} — high volatility`); }
    else if (beta > 1.2) { d("Beta moderate+", -0.6); ins.push(`Beta ${beta.toFixed(2)} — moderately above market`); }
    else if (beta > 0.5) { d("Beta defensive", +0.4); ins.push(`Beta ${beta.toFixed(2)} — below-market vol, defensive`); }
    else if (beta < 0)   { ins.push(`Negative beta — counter-cyclical`); }
  }

  if (h52 && l52 && l52 > 0) {
    const rng = (h52 - l52) / l52;
    if (rng > 1.5)      { d("52W extreme", -1.5); ins.push(`52W range spans ${(rng * 100).toFixed(0)}% — extreme entropy`); }
    else if (rng > 0.8) { d("52W high disp.", -0.8); ins.push(`52W range ${(rng * 100).toFixed(0)}% — high dispersion`); }
    else if (rng > 0.4) { d("52W moderate", -0.2); ins.push(`52W range ${(rng * 100).toFixed(0)}% — moderate`); }
    else                { d("52W stable", +0.4); ins.push(`52W range ${(rng * 100).toFixed(0)}% — stable, low entropy`); }
  }

  const sector = p.finnhubIndustry ?? p.industry ?? "";
  if (["Biotechnology", "Cryptocurrency", "Cannabis"].some((x) => sector.includes(x))) {
    d("Sector binary", -0.8); ins.push(`${sector} — binary catalyst sector, high entropy`);
  } else if (["Banks", "Financial Services"].some((x) => sector.includes(x))) {
    d("Sector regulated", +0.3); ins.push(`${sector} — regulated, lower structural entropy`);
  } else if (["Utilities", "Consumer Staples", "Insurance"].some((x) => sector.includes(x))) {
    d("Sector defensive", +0.4); ins.push(`${sector} — low-complexity defensive`);
  } else if (sector) {
    ins.push(`${sector} — moderate complexity`);
  }

  if (q.h && q.l && q.l > 0) {
    const dr = (q.h - q.l) / q.l;
    if (dr > 0.05) { d("Intraday elevated", -0.4); ins.push(`Today's range ${(dr * 100).toFixed(1)}% — elevated intraday vol`); }
    else           { ins.push(`Today's range ${(dr * 100).toFixed(1)}% — orderly`); }
  }

  const adtv = m["3MonthADTV"];
  if (adtv != null) {
    if (adtv < 5)        { d("Illiquid", -0.6); ins.push(`Avg vol $${adtv.toFixed(1)}M/day — illiquid, wide spreads likely`); }
    else if (adtv < 50)  { d("Moderate liq.", -0.2); ins.push(`Avg vol $${adtv.toFixed(0)}M/day — moderate liquidity`); }
    else if (adtv < 500) { d("Liquid", +0.2); ins.push(`Avg vol $${adtv.toFixed(0)}M/day — liquid`); }
    else                 { d("Highly liquid", +0.4); ins.push(`Avg vol $${(adtv / 1000).toFixed(1)}B/day — highly liquid`); }
  }

  let annVol: number | null = null;
  if (candles && candles.closes && candles.closes.length >= 30) {
    const closes = candles.closes;
    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i - 1] > 0) returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    // Require at least 50 returns for statistical reliability
    if (returns.length >= 50) {
      const mean = returns.reduce((a, v) => a + v, 0) / returns.length;
      const variance = returns.reduce((a, v) => a + (v - mean) ** 2, 0) / returns.length;
      annVol = Math.sqrt(variance) * Math.sqrt(252);
      if (annVol < 0.15)      { d("Vol very stable", +0.8); ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — very stable`); }
      else if (annVol < 0.25) { d("Vol normal", +0.3); ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — normal range`); }
      else if (annVol < 0.40) { d("Vol elevated", -0.5); ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — elevated`); }
      else if (annVol < 0.65) { d("Vol high", -1.2); ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — high dispersion`); }
      else                    { d("Vol extreme", -2.0); ins.push(`Realised vol ${(annVol * 100).toFixed(0)}%/yr — extreme, options territory`); }
    }
  }

  // Beta vs realised vol divergence — detects idiosyncratic risk spikes
  if (beta != null && annVol != null) {
    const impliedVol = beta * 0.20;
    if (annVol > impliedVol * 1.5) {
      d("Vol/Beta diverg.", -0.4);
      ins.push(`Vol/Beta divergence — idiosyncratic risk ${(annVol * 100).toFixed(0)}% vs beta-implied ${(impliedVol * 100).toFixed(0)}%`);
    }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    deltas,
    verdict: s >= 7.5 ? "Low entropy — stable regime, predictable behaviour"
           : s >= 6.0 ? "Moderate complexity — manageable with proper sizing"
           : s >= 4.5 ? "High uncertainty — reduce position size accordingly"
           : s >= 3.0 ? "Extreme volatility — small positions only"
           :            "Chaotic regime — avoid or hedge aggressively",
  };
}

export function scoreSemantic({ q, p, m, rc }: Pick<AnalysisInput, "q" | "p" | "m" | "rc">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };

  if (rc && rc.length > 0) {
    const l = rc[0];
    const total = (l.buy ?? 0) + (l.hold ?? 0) + (l.sell ?? 0) + (l.strongBuy ?? 0) + (l.strongSell ?? 0);
    if (total > 0) {
      const bull = calcBullRatio(l);
      const bear = ((l.sell ?? 0) + (l.strongSell ?? 0)) / total;
      if (bull > 0.7)      { d("Analyst strong bull", +1.5); ins.push(`${Math.round(bull * 100)}% of ${total} analysts: BUY/STRONG BUY`); }
      else if (bull > 0.5) { d("Analyst bullish", +1.2); ins.push(`${Math.round(bull * 100)}% of ${total} analysts bullish`); }
      else if (bear > 0.4) { d("Analyst bearish", -1.0); ins.push(`${Math.round(bear * 100)}% of ${total} analysts bearish`); }
      else                 { ins.push(`Mixed: ${l.buy ?? 0} buy / ${l.hold ?? 0} hold / ${l.sell ?? 0} sell`); }

      // Consensus drift — 1 month
      if (rc.length >= 2) {
        const drift = bull - calcBullRatio(rc[1]);
        if (drift > 0.08)       { d("Consensus improv.", +0.4); ins.push(`Consensus improving +${(drift * 100).toFixed(0)}% vs last month`); }
        else if (drift < -0.08) { d("Consensus deteri.", -0.4); ins.push(`Consensus deteriorating ${(drift * 100).toFixed(0)}% vs last month`); }
      }

      // Consensus drift — 3 months
      if (rc.length >= 3) {
        const drift3m = bull - calcBullRatio(rc[2]);
        if (drift3m > 0.15 && bull > 0.50)  { d("3m upgrade cycle", +0.3); ins.push(`3-month upgrade cycle — sustained analyst conviction`); }
        if (drift3m < -0.15 && bull < 0.50) { d("3m downgrade", -0.3); ins.push(`3-month downgrade cycle — sustained sentiment erosion`); }
      }
    }
  }

  const tl  = m.targetPriceLow;
  const th  = m.targetPriceHigh;
  const tm  = m.targetPriceMean ?? m.targetPrice;
  const cur = q.c;
  if (tm) {
    d("Targets available", +0.5);
    if (cur) {
      const upside = ((tm - cur) / cur) * 100;
      if (upside > 30)      { d("Upside >30%", +0.6); }
      else if (upside > 15) { d("Upside >15%", +0.3); }
      else if (upside < 0)  { d("Below target", -0.5); }
      const uStr = (upside >= 0 ? "+" : "") + upside.toFixed(1) + "% upside";
      if (tl && th) {
        const spread = (th - tl) / tm;
        if (spread < 0.15)      { d("Tight range", +0.4); ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr}, analysts tightly aligned)`); }
        else if (spread < 0.40) { d("OK range", +0.1); ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr})`); }
        else                    { d("Wide range", -0.2); ins.push(`Target $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)} (${uStr}, wide spread — analysts disagree)`); }
      } else {
        ins.push(`Analyst target $${tm.toFixed(2)} (${uStr})`);
      }
    } else if (tl && th) {
      ins.push(`Targets: $${tl.toFixed(0)}–$${tm.toFixed(0)}–$${th.toFixed(0)}`);
    }
  }

  const sector = p.finnhubIndustry ?? p.industry ?? "";
  if (["Semiconductors", "Software", "Internet", "Artificial", "Cloud", "Technology", "Aerospace"].some((x) => sector.includes(x))) {
    d("Sector tailwind", +0.8); ins.push(`${sector} — structural tailwinds`);
  } else if (["Real Estate", "Energy Oil", "Coal"].some((x) => sector.includes(x))) {
    d("Sector headwind", -0.3); ins.push(`${sector} — sector headwinds`);
  } else if (sector) {
    ins.push(`Sector: ${sector}`);
  }

  // IPO age with lockup-expiry window detection
  const ipo = p.ipo;
  if (ipo) {
    const daysSinceIPO = (Date.now() - new Date(ipo).getTime()) / (24 * 3600 * 1000);
    if (daysSinceIPO < 90)       { d("IPO pre-lock", -0.5); ins.push(`IPO ${ipo} — pre-lockup expiry, insider selling risk pending`); }
    else if (daysSinceIPO < 180) { d("IPO lockup", -0.7); ins.push(`IPO ${ipo} — in lockup expiry window (~${Math.round(daysSinceIPO)}d), elevated sell pressure`); }
    else if (daysSinceIPO < 365) { d("IPO recent", -0.3); ins.push(`IPO ${ipo} — recent IPO, limited history`); }
    else if (daysSinceIPO < 3 * 365) { ins.push(`IPO ${ipo} — narrative still forming`); }
    else                         { ins.push(`Public since ${ipo} — established track record`); }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 7),
    deltas,
    verdict: s >= 8.0 ? "Overwhelming bullish consensus — analyst and narrative aligned"
           : s >= 6.5 ? "Positive backdrop — supportive consensus, improving trend"
           : s >= 5.0 ? "Divided views — consensus drift or sector rotation"
           : s >= 3.5 ? "Bearish consensus — analysts skeptical"
           :            "Strong bearish consensus — multiple red flags",
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

export function scoreCryptoMomentum({ q, m, candles }: Pick<AnalysisInput, "q" | "m" | "candles">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };

  const cur = q.c;
  const h52 = m["52WeekHigh"];
  const l52 = m["52WeekLow"];

  // 90-day momentum via SMA
  if (candles && candles.closes.length >= 90) {
    const sma30  = calcSMA(candles.closes, 30);
    const sma90  = calcSMA(candles.closes, 90);
    if (sma30 && sma90) {
      const mom = (sma30 - sma90) / sma90;
      if (mom > 0.15)      { d("30d vs 90d strong", +1.2); ins.push(`SMA30 ${(mom * 100).toFixed(0)}% above SMA90 — strong upward momentum`); }
      else if (mom > 0.05) { d("30d vs 90d up", +0.6);    ins.push(`SMA30 ${(mom * 100).toFixed(0)}% above SMA90 — positive momentum`); }
      else if (mom > -0.05){ ins.push(`SMA30/90 flat — momentum neutral`); }
      else if (mom > -0.15){ d("30d vs 90d weak", -0.6);  ins.push(`SMA30 ${(Math.abs(mom) * 100).toFixed(0)}% below SMA90 — negative momentum`); }
      else                 { d("30d vs 90d bear", -1.2);  ins.push(`SMA30 ${(Math.abs(mom) * 100).toFixed(0)}% below SMA90 — severe downtrend`); }
    }
    // RSI momentum (crypto-adjusted: 70+ is not necessarily overbought)
    const rsi = calcRSI(candles.closes, 14);
    if (rsi != null) {
      if (rsi >= 55 && rsi <= 72)    { d("RSI momentum", +0.8); ins.push(`RSI ${rsi.toFixed(0)} — healthy momentum range for crypto`); }
      else if (rsi > 72 && rsi < 85) { d("RSI extended", +0.3); ins.push(`RSI ${rsi.toFixed(0)} — extended but crypto can sustain longer`); }
      else if (rsi >= 85)            { d("RSI parabolic", -0.5); ins.push(`RSI ${rsi.toFixed(0)} — parabolic, mean-reversion risk`); }
      else if (rsi >= 40 && rsi < 55){ ins.push(`RSI ${rsi.toFixed(0)} — momentum cooling, neutral`); }
      else                           { d("RSI weak", -0.8); ins.push(`RSI ${rsi.toFixed(0)} — bearish momentum`); }
    }
    // Volume acceleration (5d vs 30d)
    if (candles.volumes && candles.volumes.length >= 30) {
      const vol5d  = candles.volumes.slice(-5).reduce((a, v) => a + v, 0) / 5;
      const vol30d = candles.volumes.slice(-30).reduce((a, v) => a + v, 0) / 30;
      if (vol30d > 0) {
        const vr = vol5d / vol30d;
        if (vr > 2.0)      { d("Vol surge", +0.8); ins.push(`Volume ${vr.toFixed(1)}× 30d avg — buying surge`); }
        else if (vr > 1.3) { d("Vol elevated", +0.4); ins.push(`Volume ${vr.toFixed(1)}× 30d avg — elevated interest`); }
        else if (vr < 0.6) { d("Vol fading", -0.4); ins.push(`Volume ${vr.toFixed(1)}× 30d avg — participation fading`); }
      }
    }
  }

  // Drawdown from 52W high
  if (cur && h52) {
    const dd = (h52 - cur) / h52;
    if (dd < 0.10)      { d("Near ATH zone", +0.8); ins.push(`${(dd * 100).toFixed(0)}% from 52W high — near cycle highs`); }
    else if (dd < 0.25) { d("Mild drawdown", +0.3); ins.push(`${(dd * 100).toFixed(0)}% from 52W high — healthy consolidation`); }
    else if (dd < 0.50) { d("Mid drawdown", -0.4); ins.push(`${(dd * 100).toFixed(0)}% from 52W high — in correction`); }
    else                { d("Deep drawdown", -1.0); ins.push(`${(dd * 100).toFixed(0)}% from 52W high — deep bear territory`); }
  }

  // 52W range utilisation
  if (cur && h52 && l52 && h52 > l52) {
    const pct = (cur - l52) / (h52 - l52);
    if (pct > 0.7)       { d("52W upper half", +0.4); ins.push(`At ${(pct * 100).toFixed(0)}% of annual range`); }
    else if (pct < 0.3)  { d("52W lower half", -0.4); ins.push(`At ${(pct * 100).toFixed(0)}% of annual range — near lows`); }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    deltas,
    verdict: s >= 7.5 ? "Strong bullish momentum — trend aligned across timeframes"
           : s >= 6.0 ? "Positive momentum — uptrend intact"
           : s >= 4.5 ? "Mixed momentum — consolidation or indecision"
           : s >= 3.0 ? "Bearish momentum — downtrend dominant"
           :            "Severe momentum breakdown — distribution phase",
  };
}

export function scoreCryptoMarket({ q, p, m }: Pick<AnalysisInput, "q" | "p" | "m">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };

  // Market cap tier
  const mc = p.marketCapitalization; // in billions
  if (mc) {
    if (mc > 100)      { d("Mega-cap crypto", +1.0); ins.push(`Market cap $${(mc).toFixed(0)}B — top-tier, high liquidity & adoption`); }
    else if (mc > 10)  { d("Large-cap crypto", +0.5); ins.push(`Market cap $${mc.toFixed(0)}B — established asset`); }
    else if (mc > 1)   { ins.push(`Market cap $${mc.toFixed(1)}B — mid-cap, growth potential`); }
    else if (mc > 0.1) { d("Small-cap crypto", -0.5); ins.push(`Market cap $${(mc * 1000).toFixed(0)}M — small-cap, elevated risk`); }
    else               { d("Micro-cap crypto", -1.0); ins.push(`Market cap < $100M — speculative, high failure risk`); }
  }

  // Liquidity
  const adtv = m["3MonthADTV"];
  if (adtv != null) {
    if (adtv > 500)      { d("Deep liquidity", +1.0); ins.push(`Avg vol $${(adtv / 1000).toFixed(1)}B/day — deep market`); }
    else if (adtv > 50)  { d("Good liquidity", +0.5); ins.push(`Avg vol $${adtv.toFixed(0)}M/day — liquid`); }
    else if (adtv > 5)   { ins.push(`Avg vol $${adtv.toFixed(0)}M/day — moderate`); }
    else                 { d("Low liquidity", -0.8); ins.push(`Avg vol $${adtv.toFixed(1)}M/day — illiquid, slippage risk`); }
  }

  // 52W range — crypto-specific: wide range is normal but extreme is chaotic
  const h52 = m["52WeekHigh"];
  const l52 = m["52WeekLow"];
  if (h52 && l52 && l52 > 0) {
    const rng = (h52 - l52) / l52;
    if (rng > 5.0)       { d("Extreme range", -1.0); ins.push(`52W range ${(rng * 100).toFixed(0)}% — extreme volatility`); }
    else if (rng > 2.0)  { d("High range", -0.4); ins.push(`52W range ${(rng * 100).toFixed(0)}% — high volatility`); }
    else if (rng > 0.8)  { ins.push(`52W range ${(rng * 100).toFixed(0)}% — normal for crypto`); }
    else                 { d("Low range", +0.4); ins.push(`52W range ${(rng * 100).toFixed(0)}% — stable for crypto`); }
  }

  // Beta relative to BTC (proxied by standard beta metric)
  const beta = m.beta;
  if (beta != null) {
    if (beta > 2.5)      { d("High beta", -0.6); ins.push(`Beta ${beta.toFixed(1)} — amplified moves vs market`); }
    else if (beta > 1.0) { ins.push(`Beta ${beta.toFixed(1)} — market-like sensitivity`); }
    else if (beta < 0.5) { d("Low beta", +0.4); ins.push(`Beta ${beta.toFixed(1)} — relatively defensive`); }
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    deltas,
    verdict: s >= 7.5 ? "Strong market structure — deep liquidity, large cap, established"
           : s >= 6.0 ? "Solid market position — reasonable liquidity and cap"
           : s >= 4.5 ? "Mixed market structure — some concerns with size or liquidity"
           : s >= 3.0 ? "Weak market structure — liquidity or cap risk elevated"
           :            "Poor market structure — speculative, high failure risk",
  };
}

export function scoreCryptoSentiment({ q, p, m, rc }: Pick<AnalysisInput, "q" | "p" | "m" | "rc">): PillarResult {
  let score = 5.0;
  const ins: string[] = [];
  const deltas: ScoreDelta[] = [];
  const d = (label: string, delta: number) => { score += delta; deltas.push({ label, delta }); };

  // Analyst consensus (available for some crypto via Yahoo)
  if (rc && rc.length > 0) {
    const l = rc[0];
    const total = (l.buy ?? 0) + (l.hold ?? 0) + (l.sell ?? 0) + (l.strongBuy ?? 0) + (l.strongSell ?? 0);
    if (total > 0) {
      const bull = calcBullRatio(l);
      if (bull > 0.65)     { d("Analyst bullish", +1.2); ins.push(`${Math.round(bull * 100)}% of analysts: bullish on this asset`); }
      else if (bull > 0.4) { ins.push(`${Math.round(bull * 100)}% bullish — mixed analyst views`); }
      else                 { d("Analyst bearish", -0.8); ins.push(`Analyst consensus bearish`); }
    }
  } else {
    ins.push("Limited analyst coverage — typical for crypto assets");
  }

  // Price target upside
  const tm = m.targetPriceMean ?? m.targetPrice;
  const cur = q.c;
  if (tm && cur) {
    d("Target available", +0.5);
    const upside = ((tm - cur) / cur) * 100;
    if (upside > 50)      { d("Large upside", +0.8); ins.push(`Analyst target ${upside.toFixed(0)}% above current — high conviction`); }
    else if (upside > 20) { d("Moderate upside", +0.4); ins.push(`Analyst target +${upside.toFixed(0)}% — positive view`); }
    else if (upside < 0)  { d("Above target", -0.6); ins.push(`Trading ${Math.abs(upside).toFixed(0)}% above analyst target — stretched`); }
  }

  // Sector narrative (crypto chain/category)
  const sector = p.finnhubIndustry ?? p.industry ?? "";
  if (["Bitcoin", "Cryptocurrency"].some(x => sector.includes(x))) {
    d("BTC narrative", +0.5); ins.push("Bitcoin/major crypto — institutional adoption narrative");
  } else if (["Ethereum", "DeFi", "Smart Contract"].some(x => sector.includes(x))) {
    d("DeFi narrative", +0.3); ins.push("Smart contract / DeFi ecosystem — platform narrative");
  }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: +s.toFixed(1),
    insights: ins.slice(0, 6),
    deltas,
    verdict: s >= 7.0 ? "Positive crypto sentiment — market and analysts constructive"
           : s >= 5.0 ? "Neutral sentiment — mixed signals, watch for catalyst"
           : s >= 3.0 ? "Cautious sentiment — bearish narrative dominates"
           :            "Negative consensus — strong bearish signals",
  };
}

export function runCryptoScoring(data: AnalysisInput): { scores: CryptoScores; comp: number; sig: string } {
  // Re-use scoreTechnical (it's fully crypto-compatible) as the technical pillar
  const technicalResult = scoreTechnical(data);
  const scores: CryptoScores = {
    cryptoTechnical: technicalResult,
    cryptoMomentum:  scoreCryptoMomentum(data),
    cryptoMarket:    scoreCryptoMarket(data),
    cryptoSentiment: scoreCryptoSentiment(data),
  };
  const comp = compositeCrypto(scores);
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
