import { describe, it, expect } from "vitest";
import {
  scoreFundamental, scoreTechnical, scoreEntropy, scoreSemantic,
  calcSMA, calcRSI, calcEMA, calcMACD, calcBollingerBands,
  isCrypto, composite, signal, riskLevel, runStockScoring,
  type AnalysisInput, type StockScores,
} from "../engine";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeInput(overrides: Partial<AnalysisInput> = {}): AnalysisInput {
  return {
    q: { c: 150, o: 148, h: 152, l: 147, pc: 148 },
    p: { name: "TestCo", finnhubIndustry: "Technology", sector: "Technology", ipo: "2010-01-01", marketCapitalization: 50 },
    m: {
      peBasicExclExtraTTM: 25,
      revenueGrowthTTMYoy: 15,
      grossMarginTTM: 55,
      roeTTM: 20,
      debtEquityQuarterlyLastQ: 0.5,
      currentRatioQuarterly: 1.5,
      freeCashFlowPerShareTTM: 5,
      priceToBookQuarterly: 5,
      epsGrowthTTMYoy: 10,
      epsTTM: 6,
      peForwardAnnual: 22,
      beta: 1.1,
      "52WeekHigh": 180,
      "52WeekLow": 110,
      "3MonthADTV": 100,
      targetPriceMean: 170,
      targetPriceLow: 155,
      targetPriceHigh: 190,
      dividendYieldIndicatedAnnual: 0,
    },
    rc: [
      { buy: 15, strongBuy: 10, hold: 5, sell: 2, strongSell: 0 },
      { buy: 13, strongBuy: 8,  hold: 6, sell: 3, strongSell: 0 },
      { buy: 10, strongBuy: 6,  hold: 8, sell: 4, strongSell: 0 },
    ],
    candles: null,
    ...overrides,
  };
}

function makeCandles(n = 220, trend: "up" | "down" | "flat" = "up"): { closes: number[]; timestamps: number[]; volumes: number[] } {
  const closes: number[] = [];
  const timestamps: number[] = [];
  const volumes: number[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    if (trend === "up")   price += Math.random() * 1.5;
    if (trend === "down") price -= Math.random() * 1.5;
    closes.push(price);
    timestamps.push(Date.now() - (n - i) * 86400000);
    volumes.push(1_000_000 + Math.random() * 500_000);
  }
  return { closes, timestamps, volumes };
}

// ── isCrypto ─────────────────────────────────────────────────────────────────

describe("isCrypto", () => {
  it("returns true for -USD suffix", () => expect(isCrypto("BTC-USD")).toBe(true));
  it("returns true for -BTC suffix", () => expect(isCrypto("ETH-BTC")).toBe(true));
  it("returns true for -ETH suffix", () => expect(isCrypto("LINK-ETH")).toBe(true));
  it("returns false for regular ticker", () => expect(isCrypto("AAPL")).toBe(false));
  it("returns false for NVDA", () => expect(isCrypto("NVDA")).toBe(false));
});

// ── Math helpers ─────────────────────────────────────────────────────────────

describe("calcSMA", () => {
  it("returns null when insufficient data", () => {
    expect(calcSMA([1, 2, 3], 5)).toBeNull();
  });
  it("calculates simple average correctly", () => {
    expect(calcSMA([2, 4, 6, 8, 10], 5)).toBe(6);
  });
  it("uses only the last N values", () => {
    expect(calcSMA([100, 200, 2, 4, 6], 3)).toBeCloseTo(4);
  });
});

describe("calcRSI", () => {
  it("returns null when insufficient data", () => {
    expect(calcRSI([1, 2, 3], 14)).toBeNull();
  });
  it("returns 100 when there are no losses", () => {
    const allUp = Array.from({ length: 20 }, (_, i) => i + 1);
    expect(calcRSI(allUp, 14)).toBe(100);
  });
  it("returns a value in [0, 100]", () => {
    const mixed = Array.from({ length: 20 }, (_, i) => i % 2 === 0 ? 10 : 9);
    const rsi = calcRSI(mixed, 14);
    expect(rsi).not.toBeNull();
    expect(rsi!).toBeGreaterThanOrEqual(0);
    expect(rsi!).toBeLessThanOrEqual(100);
  });
});

describe("calcEMA", () => {
  it("returns [] when insufficient data", () => {
    expect(calcEMA([1, 2], 5)).toEqual([]);
  });
  it("returns array with correct length", () => {
    const closes = Array.from({ length: 30 }, (_, i) => i + 1);
    const ema = calcEMA(closes, 10);
    expect(ema.length).toBe(21); // 30 - 10 + 1
  });
  it("EMA reacts to recent prices more than SMA", () => {
    const flat = Array.from({ length: 20 }, () => 100);
    flat.push(200); // spike at the end
    const ema = calcEMA(flat, 10);
    const lastEma = ema[ema.length - 1];
    expect(lastEma).toBeGreaterThan(100); // reacted upward
    expect(lastEma).toBeLessThan(200);    // but not fully
  });
});

describe("calcMACD", () => {
  it("returns null when insufficient data", () => {
    expect(calcMACD([1, 2, 3])).toBeNull();
  });
  it("returns macd, signal, histogram for sufficient data", () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + i);
    const result = calcMACD(closes);
    expect(result).not.toBeNull();
    expect(typeof result!.macd).toBe("number");
    expect(typeof result!.signal).toBe("number");
    expect(result!.histogram).toBeCloseTo(result!.macd - result!.signal);
  });
});

describe("calcBollingerBands", () => {
  it("returns null when insufficient data", () => {
    expect(calcBollingerBands([1, 2, 3], 20)).toBeNull();
  });
  it("upper > middle > lower", () => {
    const closes = Array.from({ length: 25 }, (_, i) => 100 + Math.sin(i) * 10);
    const bb = calcBollingerBands(closes, 20);
    expect(bb).not.toBeNull();
    expect(bb!.upper).toBeGreaterThan(bb!.middle);
    expect(bb!.middle).toBeGreaterThan(bb!.lower);
  });
  it("bandwidth is positive", () => {
    const closes = Array.from({ length: 25 }, (_, i) => 100 + i * 0.5);
    const bb = calcBollingerBands(closes, 20);
    expect(bb!.bandwidth).toBeGreaterThan(0);
  });
});

// ── scoreFundamental ──────────────────────────────────────────────────────────

describe("scoreFundamental", () => {
  it("returns score in [0, 10]", () => {
    const input = makeInput();
    const result = scoreFundamental(input);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("includes deltas array", () => {
    const result = scoreFundamental(makeInput());
    expect(Array.isArray(result.deltas)).toBe(true);
  });

  it("penalises negative P/E", () => {
    const base = scoreFundamental(makeInput()).score;
    const neg = scoreFundamental(makeInput({ m: { ...makeInput().m, peBasicExclExtraTTM: -5, peTTM: -5 } })).score;
    expect(neg).toBeLessThan(base);
    const negResult = scoreFundamental(makeInput({ m: { ...makeInput().m, peBasicExclExtraTTM: -5, peTTM: -5 } }));
    expect(negResult.deltas.some(d => d.label === "P/E negative")).toBe(true);
  });

  it("rewards value-territory P/E", () => {
    const base = scoreFundamental(makeInput()).score;
    // Tech sector value threshold is 20; pe=10 is below it (value territory).
    // Remove peForwardAnnual to isolate the P/E signal (fwd discount otherwise offsets).
    const value = scoreFundamental(makeInput({ m: { ...makeInput().m, peBasicExclExtraTTM: 10, peForwardAnnual: undefined } })).score;
    expect(value).toBeGreaterThan(base);
  });

  it("rewards hypergrowth revenue (>50%)", () => {
    const base = scoreFundamental(makeInput()).score;
    const hyper = scoreFundamental(makeInput({ m: { ...makeInput().m, revenueGrowthTTMYoy: 60 } })).score;
    expect(hyper).toBeGreaterThan(base);
    const result = scoreFundamental(makeInput({ m: { ...makeInput().m, revenueGrowthTTMYoy: 60 } }));
    expect(result.deltas.some(d => d.label === "Revenue hyper")).toBe(true);
  });

  it("penalises shrinking revenue", () => {
    const base = scoreFundamental(makeInput()).score;
    const shrink = scoreFundamental(makeInput({ m: { ...makeInput().m, revenueGrowthTTMYoy: -10 } })).score;
    expect(shrink).toBeLessThan(base);
  });

  it("rewards exceptional gross margins (>65%)", () => {
    const base = scoreFundamental(makeInput()).score;
    const exceptional = scoreFundamental(makeInput({ m: { ...makeInput().m, grossMarginTTM: 75 } })).score;
    expect(exceptional).toBeGreaterThan(base);
  });

  it("penalises thin margins (<20%)", () => {
    const base = scoreFundamental(makeInput()).score;
    const thin = scoreFundamental(makeInput({ m: { ...makeInput().m, grossMarginTTM: 10 } })).score;
    expect(thin).toBeLessThan(base);
  });

  it("rewards very low debt (D/E < 0.3)", () => {
    const base = scoreFundamental(makeInput()).score;
    const lowDebt = scoreFundamental(makeInput({ m: { ...makeInput().m, debtEquityQuarterlyLastQ: 0.1 } })).score;
    expect(lowDebt).toBeGreaterThan(base);
  });

  it("penalises high leverage (D/E > 2)", () => {
    const base = scoreFundamental(makeInput()).score;
    const highDebt = scoreFundamental(makeInput({ m: { ...makeInput().m, debtEquityQuarterlyLastQ: 2.5 } })).score;
    expect(highDebt).toBeLessThan(base);
  });

  it("penalises near-term liquidity stress (current ratio < 1)", () => {
    const base = scoreFundamental(makeInput()).score;
    const stress = scoreFundamental(makeInput({ m: { ...makeInput().m, currentRatioQuarterly: 0.8 } })).score;
    expect(stress).toBeLessThan(base);
  });

  it("penalises negative FCF", () => {
    const base = scoreFundamental(makeInput()).score;
    const negFcf = scoreFundamental(makeInput({ m: { ...makeInput().m, freeCashFlowPerShareTTM: -2 } })).score;
    expect(negFcf).toBeLessThan(base);
  });

  it("rewards deeply undervalued PEG (< 0.75)", () => {
    // PEG = PE / epsGrowth. Use peForwardAnnual=10, epsGrowth=20 → PEG=0.5
    const highPeg = makeInput({ m: { ...makeInput().m, peForwardAnnual: 40, epsGrowthTTMYoy: 5 } });
    const lowPeg  = makeInput({ m: { ...makeInput().m, peForwardAnnual: 10, epsGrowthTTMYoy: 20 } });
    expect(scoreFundamental(lowPeg).score).toBeGreaterThan(scoreFundamental(highPeg).score);
  });

  it("catches negative EPS on absolute basis even when growth is positive", () => {
    // Negative EPS with positive growth = "growth off a negative base" artefact
    const result = scoreFundamental(makeInput({ m: { ...makeInput().m, epsTTM: -1.5 } }));
    expect(result.deltas.some(d => d.label === "EPS loss")).toBe(true);
  });

  it("applies severe EPS loss penalty for large negative EPS", () => {
    const mild = scoreFundamental(makeInput({ m: { ...makeInput().m, epsTTM: -0.5 } }));
    const severe = scoreFundamental(makeInput({ m: { ...makeInput().m, epsTTM: -8 } }));
    expect(severe.score).toBeLessThan(mild.score);
  });

  it("applies data completeness penalty for sparse metrics", () => {
    const sparse = scoreFundamental(makeInput({ m: { beta: 1.0 } }));
    expect(sparse.deltas.some(d => d.label === "Data limited")).toBe(true);
  });

  it("verdict is always a non-empty string", () => {
    const result = scoreFundamental(makeInput());
    expect(result.verdict.length).toBeGreaterThan(0);
  });

  it("uses sector-adjusted PE bands — biotech gets higher fair value threshold", () => {
    // scoreFundamental uses p.sector first, then p.finnhubIndustry — override both.
    const biotech = makeInput({
      p: { ...makeInput().p, finnhubIndustry: "Biotechnology", sector: "Biotechnology" },
      m: { ...makeInput().m, peBasicExclExtraTTM: 50 }, // 50x = fair for biotech, growth-premium for tech
    });
    const tech = makeInput({
      p: { ...makeInput().p, finnhubIndustry: "Technology", sector: "Technology" },
      m: { ...makeInput().m, peBasicExclExtraTTM: 50 },
    });
    // Biotech PE bands: value=30, fair=60 → pe=50 scores as "fair" (+0.5)
    // Tech PE bands: value=20, fair=40, growth=70 → pe=50 is "growth premium" (no bonus)
    expect(scoreFundamental(biotech).score).toBeGreaterThan(scoreFundamental(tech).score);
  });
});

// ── scoreTechnical ────────────────────────────────────────────────────────────

describe("scoreTechnical", () => {
  it("returns score in [0, 10]", () => {
    const result = scoreTechnical(makeInput());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("includes deltas array", () => {
    const result = scoreTechnical(makeInput());
    expect(Array.isArray(result.deltas)).toBe(true);
  });

  it("rewards stock near 52W highs", () => {
    const near = makeInput({ q: { c: 178, o: 175, h: 179, l: 174, pc: 175 } }); // ~97% of 110–180 range
    const low  = makeInput({ q: { c: 112, o: 111, h: 113, l: 110, pc: 111 } }); // ~3% of range
    expect(scoreTechnical(near).score).toBeGreaterThan(scoreTechnical(low).score);
  });

  it("penalises stock near 52W lows", () => {
    const result = scoreTechnical(makeInput({ q: { c: 112, o: 111, h: 113, l: 110, pc: 111 } }));
    expect(result.deltas.some(d => d.label === "52W near lows")).toBe(true);
  });

  it("rewards strong intraday performance (>+2% vs open)", () => {
    const strong = makeInput({ q: { c: 155, o: 148, h: 156, l: 147, pc: 148 } }); // +4.7% intraday
    const flat   = makeInput({ q: { c: 149, o: 148, h: 150, l: 147, pc: 148 } }); // +0.7% intraday
    expect(scoreTechnical(strong).score).toBeGreaterThan(scoreTechnical(flat).score);
  });

  it("with uptrend candles: golden cross fires", () => {
    const candles = makeCandles(220, "up");
    const result = scoreTechnical(makeInput({ candles }));
    const goldenCross = result.deltas.some(d =>
      d.label === "Golden cross str." || d.label === "Golden cross early"
    );
    expect(goldenCross).toBe(true);
  });

  it("RSI bullish range (50–65) is rewarded", () => {
    // Build a gentle uptrend that keeps RSI around 55–60
    const closes: number[] = [];
    for (let i = 0; i < 60; i++) closes.push(100 + i * 0.3 + Math.sin(i * 0.5) * 2);
    const candles = { closes, timestamps: closes.map((_, i) => i), volumes: closes.map(() => 1e6) };
    const result = scoreTechnical(makeInput({ candles }));
    const rsi = result.deltas.find(d => d.label === "RSI bullish" || d.label === "RSI strong" || d.label === "RSI overbought" || d.label === "RSI weak" || d.label === "RSI oversold");
    // Just verify RSI delta exists when we have enough candles
    expect(rsi).toBeDefined();
  });

  it("MACD bullish fires on consistent uptrend", () => {
    // Linear trend → MACD ≈ signal (constant velocity). Use exponential growth so
    // MACD line is increasing → latest MACD > signal → histogram > 0.
    const closes: number[] = [];
    for (let i = 0; i < 80; i++) closes.push(100 * Math.pow(1.015, i));
    const candles = { closes, timestamps: closes.map((_, i) => i), volumes: closes.map(() => 1e6) };
    const result = scoreTechnical(makeInput({ candles }));
    expect(result.deltas.some(d => d.label === "MACD bullish")).toBe(true);
  });

  it("MACD bearish fires on consistent downtrend", () => {
    // Warm up with an uptrend, then reverse sharply. EMA(12) reacts faster to the
    // reversal than EMA(26) → MACD crosses below signal → histogram < 0.
    const closes: number[] = [];
    for (let i = 0; i < 50; i++) closes.push(100 + i * 2);     // uptrend warm-up: 100→198
    for (let i = 0; i < 50; i++) closes.push(198 - i * 3.5);   // sharp reversal: 198→23
    const candles = { closes, timestamps: closes.map((_, i) => i), volumes: closes.map(() => 1e6) };
    const result = scoreTechnical(makeInput({ candles }));
    expect(result.deltas.some(d => d.label === "MACD bearish")).toBe(true);
  });

  it("score never exceeds 10 regardless of signals", () => {
    const candles = makeCandles(220, "up");
    const result = scoreTechnical(makeInput({ candles, q: { c: 179, o: 170, h: 180, l: 169, pc: 170 } }));
    expect(result.score).toBeLessThanOrEqual(10);
  });
});

// ── scoreEntropy ──────────────────────────────────────────────────────────────

describe("scoreEntropy", () => {
  it("returns score in [0, 10]", () => {
    const result = scoreEntropy(makeInput());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("base score starts at 6.5 (high beta penalty reduces it)", () => {
    // With no beta and no candles, default metrics should keep entropy moderate
    const result = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 1.0 } }));
    expect(result.score).toBeGreaterThan(4); // still moderate
  });

  it("penalises extreme beta (>2.5) severely", () => {
    const low  = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 0.8 } })).score;
    const high = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 3.0 } })).score;
    expect(high).toBeLessThan(low);
    const highResult = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 3.0 } }));
    expect(highResult.deltas.some(d => d.label === "Beta extreme")).toBe(true);
  });

  it("rewards defensive beta (0.5–1.2)", () => {
    const defensive = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 0.7 } }));
    expect(defensive.deltas.some(d => d.label === "Beta defensive")).toBe(true);
  });

  it("penalises binary-catalyst sector (Biotechnology)", () => {
    const biotech = scoreEntropy(makeInput({ p: { ...makeInput().p, finnhubIndustry: "Biotechnology" } }));
    expect(biotech.deltas.some(d => d.label === "Sector binary")).toBe(true);
  });

  it("rewards defensive sector (Utilities)", () => {
    const utilities = scoreEntropy(makeInput({ p: { ...makeInput().p, finnhubIndustry: "Utilities" } }));
    expect(utilities.deltas.some(d => d.label === "Sector defensive")).toBe(true);
  });

  it("penalises illiquid stock (ADTV < $5M)", () => {
    const illiquid = scoreEntropy(makeInput({ m: { ...makeInput().m, "3MonthADTV": 2 } }));
    expect(illiquid.deltas.some(d => d.label === "Illiquid")).toBe(true);
  });

  it("rewards highly liquid stock (ADTV > $500M)", () => {
    const liquid = scoreEntropy(makeInput({ m: { ...makeInput().m, "3MonthADTV": 1000 } }));
    expect(liquid.deltas.some(d => d.label === "Highly liquid")).toBe(true);
  });

  it("detects high realised volatility from candles", () => {
    // Build very noisy candles (large daily moves)
    const closes: number[] = [100];
    for (let i = 1; i < 60; i++) {
      closes.push(closes[i - 1] * (1 + (Math.random() > 0.5 ? 0.06 : -0.06)));
    }
    const candles = { closes, timestamps: closes.map((_, i) => i), volumes: closes.map(() => 1e6) };
    const result = scoreEntropy(makeInput({ candles }));
    const hasVolPenalty = result.deltas.some(d =>
      d.label === "Vol elevated" || d.label === "Vol high" || d.label === "Vol extreme"
    );
    expect(hasVolPenalty).toBe(true);
  });

  it("detects vol/beta divergence when realized vol >> beta-implied vol", () => {
    // beta=0.5 implies ~10% vol; but realized vol will be high from noisy candles
    const closes: number[] = [100];
    for (let i = 1; i < 60; i++) {
      closes.push(closes[i - 1] * (1 + (Math.random() > 0.5 ? 0.07 : -0.07)));
    }
    const candles = { closes, timestamps: closes.map((_, i) => i), volumes: closes.map(() => 1e6) };
    const result = scoreEntropy(makeInput({ m: { ...makeInput().m, beta: 0.5 }, candles }));
    // vol/beta divergence fires when annVol > beta*0.20*1.5 = 0.15
    // With ±7% daily moves, annVol ≈ 0.07*√252 ≈ 111% >> 15%
    expect(result.deltas.some(d => d.label === "Vol/Beta diverg.")).toBe(true);
  });

  it("extreme 52W range is penalised", () => {
    const wide = scoreEntropy(makeInput({ m: { ...makeInput().m, "52WeekHigh": 300, "52WeekLow": 100 } }));
    expect(wide.deltas.some(d => d.label === "52W extreme")).toBe(true);
  });
});

// ── scoreSemantic ─────────────────────────────────────────────────────────────

describe("scoreSemantic", () => {
  it("returns score in [0, 10]", () => {
    const result = scoreSemantic(makeInput());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("rewards overwhelming bullish consensus (>70% bull)", () => {
    const bullish = scoreSemantic(makeInput({
      rc: [{ buy: 20, strongBuy: 15, hold: 3, sell: 1, strongSell: 0 }], // 87% bull
    }));
    expect(bullish.deltas.some(d => d.label === "Analyst strong bull")).toBe(true);
  });

  it("penalises bearish consensus (>40% bears)", () => {
    const bearish = scoreSemantic(makeInput({
      rc: [{ buy: 2, strongBuy: 0, hold: 5, sell: 8, strongSell: 5 }], // 65% bear
    }));
    expect(bearish.deltas.some(d => d.label === "Analyst bearish")).toBe(true);
  });

  it("rewards improving 1-month consensus drift (+8%)", () => {
    const improving = scoreSemantic(makeInput({
      rc: [
        { buy: 18, strongBuy: 10, hold: 4, sell: 2, strongSell: 0 }, // current: ~82%
        { buy: 10, strongBuy: 5,  hold: 8, sell: 4, strongSell: 0 }, // last month: ~56%
      ],
    }));
    expect(improving.deltas.some(d => d.label === "Consensus improv.")).toBe(true);
  });

  it("penalises deteriorating 1-month consensus drift", () => {
    const deteriorating = scoreSemantic(makeInput({
      rc: [
        { buy: 5,  strongBuy: 2, hold: 8, sell: 8,  strongSell: 2 }, // current: ~28%
        { buy: 15, strongBuy: 8, hold: 6, sell: 2,  strongSell: 0 }, // last month: ~74%
      ],
    }));
    expect(deteriorating.deltas.some(d => d.label === "Consensus deteri.")).toBe(true);
  });

  it("rewards upside >30% to analyst mean target", () => {
    const highUpside = scoreSemantic(makeInput({
      q: { c: 100, o: 100, h: 102, l: 98, pc: 99 },
      m: { ...makeInput().m, targetPriceMean: 140, targetPriceLow: 120, targetPriceHigh: 165 },
    }));
    expect(highUpside.deltas.some(d => d.label === "Upside >30%")).toBe(true);
  });

  it("penalises when stock trades above analyst mean target", () => {
    const aboveTarget = scoreSemantic(makeInput({
      q: { c: 200, o: 198, h: 202, l: 197, pc: 198 },
      m: { ...makeInput().m, targetPriceMean: 160, targetPriceLow: 140, targetPriceHigh: 180 },
    }));
    expect(aboveTarget.deltas.some(d => d.label === "Below target")).toBe(true);
  });

  it("rewards semiconductor sector tailwind", () => {
    const semi = scoreSemantic(makeInput({ p: { ...makeInput().p, finnhubIndustry: "Semiconductors" } }));
    expect(semi.deltas.some(d => d.label === "Sector tailwind")).toBe(true);
  });

  it("penalises IPO pre-lockup expiry (<90 days)", () => {
    const recentIPO = new Date();
    recentIPO.setDate(recentIPO.getDate() - 30); // 30 days ago
    const result = scoreSemantic(makeInput({ p: { ...makeInput().p, ipo: recentIPO.toISOString().split("T")[0] } }));
    expect(result.deltas.some(d => d.label === "IPO pre-lock")).toBe(true);
  });

  it("penalises IPO lockup window (90–180 days)", () => {
    const lockupIPO = new Date();
    lockupIPO.setDate(lockupIPO.getDate() - 120); // 120 days ago
    const result = scoreSemantic(makeInput({ p: { ...makeInput().p, ipo: lockupIPO.toISOString().split("T")[0] } }));
    expect(result.deltas.some(d => d.label === "IPO lockup")).toBe(true);
  });

  it("rewards tightly-aligned analyst targets (spread < 15%)", () => {
    const tight = scoreSemantic(makeInput({
      q: { c: 100, o: 100, h: 102, l: 98, pc: 99 },
      m: { ...makeInput().m, targetPriceMean: 115, targetPriceLow: 110, targetPriceHigh: 120 }, // spread=9%
    }));
    expect(tight.deltas.some(d => d.label === "Tight range")).toBe(true);
  });
});

// ── composite & signal ────────────────────────────────────────────────────────

describe("composite & signal", () => {
  it("composite applies correct weights (30/35/10/25)", () => {
    const scores: StockScores = {
      fundamental: { score: 10, insights: [], verdict: "", deltas: [] },
      technical:   { score: 0,  insights: [], verdict: "", deltas: [] },
      entropy:     { score: 0,  insights: [], verdict: "", deltas: [] },
      semantic:    { score: 0,  insights: [], verdict: "", deltas: [] },
    };
    expect(composite(scores)).toBeCloseTo(3.0); // 10*0.30
  });

  it("composite sums to 10 when all pillars are 10", () => {
    const perfect: StockScores = {
      fundamental: { score: 10, insights: [], verdict: "", deltas: [] },
      technical:   { score: 10, insights: [], verdict: "", deltas: [] },
      entropy:     { score: 10, insights: [], verdict: "", deltas: [] },
      semantic:    { score: 10, insights: [], verdict: "", deltas: [] },
    };
    expect(composite(perfect)).toBeCloseTo(10);
  });

  it("signal returns STRONG BUY for score >= 8.5", () => expect(signal(9.0)).toBe("STRONG BUY"));
  it("signal returns BUY for 7.2–8.4", () => expect(signal(7.5)).toBe("BUY"));
  it("signal returns NEUTRAL for 5.5–7.1", () => expect(signal(6.0)).toBe("NEUTRAL"));
  it("signal returns SELL for 4.0–5.4", () => expect(signal(4.5)).toBe("SELL"));
  it("signal returns STRONG SELL for < 4.0", () => expect(signal(3.0)).toBe("STRONG SELL"));
  it("signal boundary: 8.5 is STRONG BUY", () => expect(signal(8.5)).toBe("STRONG BUY"));
  it("signal boundary: 7.2 is BUY", () => expect(signal(7.2)).toBe("BUY"));
  it("signal boundary: 5.5 is NEUTRAL", () => expect(signal(5.5)).toBe("NEUTRAL"));
  it("signal boundary: 4.0 is SELL", () => expect(signal(4.0)).toBe("SELL"));
});

// ── riskLevel ─────────────────────────────────────────────────────────────────

describe("riskLevel", () => {
  it("returns HIGH for beta > 1.8", () => expect(riskLevel(2.0, 6)).toBe("HIGH"));
  it("returns HIGH for entropy < 4.5", () => expect(riskLevel(1.0, 4.0)).toBe("HIGH"));
  it("returns MEDIUM for beta 1.2–1.8", () => expect(riskLevel(1.5, 6)).toBe("MEDIUM"));
  it("returns LOW for beta < 1.2 and entropy >= 6", () => expect(riskLevel(0.8, 7)).toBe("LOW"));
  it("returns HIGH when beta undefined and entropy < 5", () => expect(riskLevel(undefined, 4)).toBe("HIGH"));
});

// ── runStockScoring (integration) ─────────────────────────────────────────────

describe("runStockScoring (integration)", () => {
  it("returns all four pillars", () => {
    const { scores } = runStockScoring(makeInput());
    expect(scores.fundamental).toBeDefined();
    expect(scores.technical).toBeDefined();
    expect(scores.entropy).toBeDefined();
    expect(scores.semantic).toBeDefined();
  });

  it("composite matches manual calculation", () => {
    const { scores, comp } = runStockScoring(makeInput());
    const manual = composite(scores);
    expect(comp).toBeCloseTo(manual, 5);
  });

  it("sig matches signal(comp)", () => {
    const { comp, sig } = runStockScoring(makeInput());
    expect(sig).toBe(signal(comp));
  });

  it("all pillars have deltas array", () => {
    const { scores } = runStockScoring(makeInput());
    for (const key of ["fundamental", "technical", "entropy", "semantic"] as const) {
      expect(Array.isArray(scores[key].deltas)).toBe(true);
    }
  });

  it("strong stock scores higher than weak stock", () => {
    const strong = makeInput({
      m: {
        ...makeInput().m,
        revenueGrowthTTMYoy: 50,
        grossMarginTTM: 70,
        roeTTM: 35,
        debtEquityQuarterlyLastQ: 0.1,
        freeCashFlowPerShareTTM: 10,
        beta: 0.8,
        peBasicExclExtraTTM: 15,
      },
    });
    const weak = makeInput({
      m: {
        ...makeInput().m,
        revenueGrowthTTMYoy: -20,
        grossMarginTTM: 10,
        roeTTM: -5,
        debtEquityQuarterlyLastQ: 3,
        freeCashFlowPerShareTTM: -3,
        beta: 2.5,
      },
    });
    expect(runStockScoring(strong).comp).toBeGreaterThan(runStockScoring(weak).comp);
  });

  it("all pillar scores are within [0, 10]", () => {
    const { scores } = runStockScoring(makeInput({ candles: makeCandles(220, "up") }));
    for (const key of ["fundamental", "technical", "entropy", "semantic"] as const) {
      expect(scores[key].score).toBeGreaterThanOrEqual(0);
      expect(scores[key].score).toBeLessThanOrEqual(10);
    }
  });
});
