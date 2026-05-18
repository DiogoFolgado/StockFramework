import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/db/prisma";

const WORKER_URL = process.env.YAHOO_WORKER_URL ?? "https://noisy-bread-1e4c.diogo-lafp.workers.dev";

async function fetch90dCandles(ticker: string): Promise<number[] | null> {
  try {
    const res  = await fetch(
      `${WORKER_URL}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=3mo`,
      { headers: { "User-Agent": "StockFramework/2.0" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: { result?: Array<{ indicators?: { quote?: Array<{ close?: (number | null)[] }> } }> }
    };
    const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!closes) return null;
    return closes.filter((c): c is number => c !== null && c !== undefined);
  } catch {
    return null;
  }
}

function logReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  return returns;
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 5) return 0;
  const xa = a.slice(0, n);
  const xb = b.slice(0, n);
  const meanA = xa.reduce((s, v) => s + v, 0) / n;
  const meanB = xb.reduce((s, v) => s + v, 0) / n;
  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const da = xa[i] - meanA;
    const db = xb[i] - meanB;
    cov  += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA === 0 || varB === 0) return 0;
  return Math.round((cov / Math.sqrt(varA * varB)) * 1000) / 1000;
}

const CRYPTO_PATTERNS = /^(BTC|ETH|SOL|ADA|XRP|DOGE|AVAX|DOT|MATIC|LTC)/i;

export interface TailRiskPair {
  a:    string;
  b:    string;
  corr: number;
}

export interface CryptoPair {
  ticker:  string;
  btcCorr: number;
}

export interface CorrelationResponse {
  tickers:       string[];
  matrix:        number[][];
  tailRiskPairs: TailRiskPair[];
  cryptoPairs:   CryptoPair[];
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const sections = await prisma.section.findMany({
    where:   { userId },
    include: { positions: { select: { ticker: true } } },
  });

  const tickers = [...new Set(sections.flatMap(s => s.positions.map(p => p.ticker)))];
  if (tickers.length < 2) {
    return NextResponse.json({ tickers, matrix: [], tailRiskPairs: [], cryptoPairs: [] });
  }

  // Fetch 90-day candles for all tickers in parallel
  const candleResults = await Promise.all(tickers.map(t => fetch90dCandles(t)));
  const returnsMap = new Map<string, number[]>();
  for (let i = 0; i < tickers.length; i++) {
    const closes = candleResults[i];
    if (closes && closes.length >= 10) {
      returnsMap.set(tickers[i], logReturns(closes));
    }
  }

  const validTickers = tickers.filter(t => returnsMap.has(t));

  // Build NxN correlation matrix
  const n = validTickers.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const corr = pearson(returnsMap.get(validTickers[i])!, returnsMap.get(validTickers[j])!);
      matrix[i][j] = corr;
      matrix[j][i] = corr;
    }
  }

  // Tail-risk pairs: correlation > 0.70
  const tailRiskPairs: TailRiskPair[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[i][j]) > 0.70) {
        tailRiskPairs.push({ a: validTickers[i], b: validTickers[j], corr: matrix[i][j] });
      }
    }
  }

  // Crypto correlations
  const cryptoTickers = validTickers.filter(t => CRYPTO_PATTERNS.test(t));
  const techTickers   = validTickers.filter(t => !CRYPTO_PATTERNS.test(t));
  const cryptoPairs: CryptoPair[] = [];

  for (const crypto of cryptoTickers) {
    for (const tech of techTickers) {
      const ci = validTickers.indexOf(crypto);
      const ti = validTickers.indexOf(tech);
      if (ci >= 0 && ti >= 0) {
        cryptoPairs.push({ ticker: tech, btcCorr: matrix[ci][ti] });
      }
    }
  }

  return NextResponse.json({
    tickers:       validTickers,
    matrix,
    tailRiskPairs,
    cryptoPairs,
  } satisfies CorrelationResponse);
}
