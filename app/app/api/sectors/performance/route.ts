import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SECTORS } from "@/lib/sectors/data";
import { fetchQuote } from "@/lib/yahoo/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectorId = req.nextUrl.searchParams.get("sectorId");
  if (!sectorId) return NextResponse.json({ error: "Missing sectorId" }, { status: 400 });

  const sector = SECTORS.find((s) => s.id === sectorId);
  if (!sector) return NextResponse.json({ error: "Unknown sector" }, { status: 404 });

  const allStocks = [...sector.stocks, ...sector.backup];

  const results = await Promise.allSettled(
    allStocks.map((s) => fetchQuote(s.ticker).then((q) => ({ ...s, q })))
  );

  const valid: Array<{ ticker: string; name: string; price: number; chgPct: number }> = [];
  for (const r of results) {
    if (valid.length >= 10) break;
    if (r.status !== "fulfilled") continue;
    const { ticker, name, q } = r.value;
    if (!q.c || !q.pc || q.c <= 0 || q.pc <= 0) continue;
    const chgPct = ((q.c - q.pc) / q.pc) * 100;
    valid.push({ ticker, name, price: q.c, chgPct });
  }

  valid.sort((a, b) => b.chgPct - a.chgPct);

  const avg = valid.length > 0
    ? valid.reduce((sum, r) => sum + r.chgPct, 0) / valid.length
    : null;

  return NextResponse.json({ stocks: valid, avg });
}
