import { NextRequest, NextResponse } from "next/server";
import Anthropic                      from "@anthropic-ai/sdk";
import { auth }                       from "@/lib/auth";
import { prisma }                     from "@/lib/db/prisma";
import { getCompanyNews }             from "@/lib/finnhub/client";

const client = new Anthropic();

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface SentimentEntry {
  score:          number;
  summary:        string;
  thesisShift:    boolean;
  newsSampleCount: number;
  analyzedAt:     string;
}

async function scoreTicker(
  ticker:   string,
  userId:   string,
  prevScore: number | null,
): Promise<SentimentEntry> {
  const today = daysAgo(0);
  const from  = daysAgo(7);

  let news: { headline: string; summary: string }[] = [];
  try {
    const items = await getCompanyNews(ticker, from, today);
    news = items.slice(0, 5).map(n => ({ headline: n.headline, summary: n.summary }));
  } catch {
    // Finnhub may not have news for all tickers (e.g. crypto)
  }

  if (news.length === 0) {
    const snap = { score: 5, summary: "No recent news available.", thesisShift: false, newsSampleCount: 0, analyzedAt: new Date().toISOString() };
    await prisma.sentimentSnapshot.create({
      data: { userId, ticker, score: snap.score, summary: snap.summary, newsCount: 0 },
    });
    return snap;
  }

  const newsText = news
    .map((n, i) => `${i + 1}. ${n.headline}${n.summary ? " — " + n.summary.slice(0, 120) : ""}`)
    .join("\n");

  const prompt = `You are a financial analyst. Based on these recent news headlines for ${ticker}, score the sentiment from 0 (extremely negative) to 10 (extremely positive) and detect if there is a fundamental thesis shift (e.g. fraud, lost major contract, regulatory ban, CEO departure scandal).

Headlines:
${newsText}

Respond ONLY with valid JSON (no markdown): {"score": <number 0-10>, "summary": "<1 sentence max 100 chars>", "thesisShift": <true|false>}`;

  let score = 5;
  let summary = "Neutral sentiment.";
  let thesisShift = false;

  try {
    const msg = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages:   [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw) as { score: number; summary: string; thesisShift: boolean };
    score       = Math.min(10, Math.max(0, Number(parsed.score)));
    summary     = String(parsed.summary).slice(0, 200);
    thesisShift = Boolean(parsed.thesisShift);
  } catch {
    // Keep defaults on parse failure
  }

  // Detect drift vs previous snapshot
  if (prevScore !== null && score < prevScore - 2) thesisShift = true;

  await prisma.sentimentSnapshot.create({
    data: { userId, ticker, score, summary, newsCount: news.length },
  });

  return { score, summary, thesisShift, newsSampleCount: news.length, analyzedAt: new Date().toISOString() };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let tickers: string[] = [];
  try {
    const body = await req.json() as { tickers?: string[] };
    tickers = body.tickers ?? [];
  } catch { /* empty body */ }

  // If no tickers provided, derive from portfolio
  if (tickers.length === 0) {
    const sections = await prisma.section.findMany({
      where:   { userId },
      include: { positions: { select: { ticker: true } } },
    });
    tickers = [...new Set(sections.flatMap(s => s.positions.map(p => p.ticker)))];
  }

  if (tickers.length === 0) {
    return NextResponse.json({ sentiment: {} });
  }

  // Fetch previous snapshots to detect drift
  const prevSnapshots = await prisma.sentimentSnapshot.findMany({
    where:   { userId, ticker: { in: tickers } },
    orderBy: { createdAt: "desc" },
    distinct: ["ticker"],
  });
  const prevMap = new Map(prevSnapshots.map(s => [s.ticker, s.score]));

  // Score all tickers (sequential to avoid rate limit on Finnhub free tier)
  const sentiment: Record<string, SentimentEntry> = {};
  for (const ticker of tickers) {
    sentiment[ticker] = await scoreTicker(ticker, userId, prevMap.get(ticker) ?? null);
  }

  return NextResponse.json({ sentiment });
}
