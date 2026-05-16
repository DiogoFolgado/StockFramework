import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { RISING_SECTORS } from "@/lib/sectors/data";
import { fetchAllLite } from "@/lib/yahoo/client";
import { runStockScoring } from "@/lib/scoring/engine";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sectorId = req.nextUrl.searchParams.get("sectorId");
  if (!sectorId) return new Response("Missing sectorId", { status: 400 });

  const sector = RISING_SECTORS.find((s) => s.id === sectorId);
  if (!sector) return new Response("Unknown sector", { status: 404 });

  const encoder = new TextEncoder();
  const candidates = sector.candidates.slice(0, 200);
  const userId = session.user.id;

  // Tickers already saved to history today — skip re-inserting them
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const savedToday = await prisma.analysisHistory.findMany({
    where: { userId, analyzedAt: { gte: todayStart } },
    select: { ticker: true },
  });
  const savedTickers = new Set(savedToday.map((r) => r.ticker));

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send({ type: "start", total: candidates.length });

      const BATCH = 3;
      const DELAY = 600;

      for (let i = 0; i < candidates.length; i += BATCH) {
        const batch = candidates.slice(i, i + BATCH);

        const batchResults = await Promise.allSettled(
          batch.map(async (ticker) => {
            const data = await fetchAllLite(ticker);
            const result = runStockScoring(data);
            return { ticker, data, result };
          })
        );

        for (let j = 0; j < batch.length; j++) {
          const r = batchResults[j];
          const idx = i + j + 1;
          if (r.status === "fulfilled") {
            const { ticker, data, result } = r.value;

            // Persist to history (skip if already saved today)
            if (!savedTickers.has(ticker)) {
              savedTickers.add(ticker);
              prisma.analysisHistory.create({
                data: {
                  userId,
                  ticker,
                  companyName: data.p?.name ?? ticker,
                  score:       result.comp,
                  signal:      result.sig,
                  sector:      data.p?.finnhubIndustry ?? data.p?.industry ?? sector.name,
                  pillars:     result.scores as object,
                },
              }).catch(() => { /* non-blocking — ignore individual save failures */ });
            }

            send({
              type: "tick",
              checked: idx,
              total: candidates.length,
              ticker,
              comp: result.comp,
              signal: result.sig,
              name: data.p?.name ?? ticker,
              price: data.q?.c ?? 0,
              chgPct: data.q?.c && data.q?.pc ? ((data.q.c - data.q.pc) / data.q.pc) * 100 : null,
              pillars: {
                fundamental: result.scores.fundamental.score,
                technical: result.scores.technical.score,
                entropy: result.scores.entropy.score,
                semantic: result.scores.semantic.score,
              },
              verdicts: {
                technical: result.scores.technical.verdict,
                semantic: result.scores.semantic.verdict,
              },
              metrics: {
                pe: data.m?.peBasicExclExtraTTM ?? null,
                beta: data.m?.beta ?? null,
                industry: data.p?.finnhubIndustry ?? data.p?.industry ?? null,
              },
            });
          } else {
            send({ type: "tick", checked: idx, total: candidates.length, ticker: batch[j], skipped: true });
          }
        }

        if (i + BATCH < candidates.length) {
          await new Promise((r) => setTimeout(r, DELAY));
        }
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
