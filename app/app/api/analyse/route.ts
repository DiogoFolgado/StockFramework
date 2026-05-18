import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fetchAll } from "@/lib/yahoo/client";
import { isCrypto, runStockScoring, runCryptoScoring, PILLARS, CRYPTO_PILLARS, signal } from "@/lib/scoring/engine";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticker } = await req.json();
  if (!ticker) return NextResponse.json({ error: "Missing ticker" }, { status: 400 });

  const tkr = (ticker as string).toUpperCase();

  try {
    const data = await fetchAll(tkr);

    const crypto = isCrypto(tkr);
    const { scores, comp, sig } = crypto ? runCryptoScoring(data) : runStockScoring(data);
    const pillars = crypto ? CRYPTO_PILLARS : PILLARS;

    const sector = data.p.finnhubIndustry ?? data.p.industry ?? data.p.sector ?? "—";
    const companyName = data.p.name ?? tkr;

    await prisma.analysisHistory.create({
      data: {
        userId: session.user.id,
        ticker: tkr,
        companyName,
        score: comp,
        signal: sig,
        sector,
        pillars: scores as object,
      },
    });

    return NextResponse.json({
      ticker: tkr,
      companyName,
      sector,
      scores,
      pillars,
      composite: comp,
      signal: signal(comp),
      quote: data.q,
      profile: data.p,
      metrics: data.m,
      isCrypto: crypto,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
