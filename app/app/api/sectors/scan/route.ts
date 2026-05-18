import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { RISING_SECTORS } from "@/lib/sectors/data";
import { fetchAllLite } from "@/lib/yahoo/client";
import { runStockScoring } from "@/lib/scoring/engine";

export const maxDuration = 300;

const BATCH     = 5;
const DELAY     = 250; // ms between batches
const MAX_SCORED = 200; // stop after scoring this many unique stocks
const TIMEOUT   = 10_000; // per-stock fetch timeout in ms

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
  const userId = session.user.id;

  // Deduplicate within this sector's candidates list only
  const seen = new Set<string>();
  const toProcess = sector.candidates.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });
  const reportedTotal = Math.min(toProcess.length, MAX_SCORED);

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send({ type: "start", total: reportedTotal });

      let uniqueScored = 0;
      let checked = 0;

      outer: for (let i = 0; i < toProcess.length; i += BATCH) {
        const batch = toProcess.slice(i, i + BATCH);

        const batchResults = await Promise.allSettled(
          batch.map(async (ticker) => {
            const ac = new AbortController();
            const timer = setTimeout(() => ac.abort(), TIMEOUT);
            try {
              const data = await fetchAllLite(ticker, ac.signal);
              const result = runStockScoring(data);
              return { ticker, data, result };
            } finally {
              clearTimeout(timer);
            }
          })
        );

        for (let j = 0; j < batch.length; j++) {
          const r = batchResults[j];
          checked++;

          if (r.status === "fulfilled") {
            const { ticker, data, result } = r.value;
            uniqueScored++;

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
              }).catch(() => { /* non-blocking */ });

            send({
              type: "tick",
              checked,
              total: reportedTotal,
              ticker,
              comp:   result.comp,
              signal: result.sig,
              name:   data.p?.name ?? ticker,
              price:  data.q?.c ?? 0,
              chgPct: data.q?.c && data.q?.pc ? ((data.q.c - data.q.pc) / data.q.pc) * 100 : null,
              pillars: {
                fundamental: result.scores.fundamental.score,
                technical:   result.scores.technical.score,
                entropy:     result.scores.entropy.score,
                semantic:    result.scores.semantic.score,
              },
              verdicts: {
                technical: result.scores.technical.verdict,
                semantic:  result.scores.semantic.verdict,
              },
              metrics: {
                pe:       data.m?.peBasicExclExtraTTM ?? null,
                beta:     data.m?.beta ?? null,
                industry: data.p?.finnhubIndustry ?? data.p?.industry ?? null,
              },
            });

            if (uniqueScored >= MAX_SCORED) break outer;
          } else {
            send({ type: "tick", checked, total: reportedTotal, ticker: batch[j], skipped: true });
          }
        }

        if (i + BATCH < toProcess.length && uniqueScored < MAX_SCORED) {
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
