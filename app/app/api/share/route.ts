import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// POST /api/share — create a public shareable snapshot of an analysis result
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ticker, companyName, sector, composite, signal, scores, quote, metrics, isCrypto } = body;

  if (!ticker || !scores) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Expire in 30 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const shared = await prisma.sharedAnalysis.create({
    data: {
      ticker: String(ticker).toUpperCase(),
      companyName: String(companyName ?? ticker),
      sector: String(sector ?? "—"),
      composite: Number(composite ?? 0),
      signal: String(signal ?? "NEUTRAL"),
      scores: scores as object,
      quote: (quote ?? {}) as object,
      metrics: (metrics ?? {}) as object,
      isCrypto: Boolean(isCrypto),
      expiresAt,
    },
  });

  return NextResponse.json({ id: shared.id });
}
