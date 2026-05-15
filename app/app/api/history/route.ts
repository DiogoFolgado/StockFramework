import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const saveSchema = z.object({
  ticker:      z.string().min(1).max(20),
  companyName: z.string(),
  score:       z.number().min(0).max(10),
  signal:      z.string(),
  sector:      z.string(),
  pillars:     z.record(z.string(), z.unknown()),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const skip  = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.analysisHistory.findMany({
      where:   { userId: session.user.id },
      orderBy: { analyzedAt: "desc" },
      skip,
      take:    limit,
    }),
    prisma.analysisHistory.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ records, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { ticker, companyName, score, signal, sector, pillars } = saveSchema.parse(body);

    const record = await prisma.analysisHistory.create({
      data: {
        userId: session.user.id,
        ticker: ticker.toUpperCase(),
        companyName,
        score,
        signal,
        sector,
        pillars: pillars as object,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }
}
