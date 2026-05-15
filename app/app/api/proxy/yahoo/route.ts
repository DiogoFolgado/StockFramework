import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.YAHOO_WORKER_URL ?? "https://noisy-bread-1e4c.diogo-lafp.workers.dev";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const upstreamUrl = `${WORKER_URL}${path}`;
  try {
    const res = await fetch(upstreamUrl, {
      headers: { "User-Agent": "StockFramework/2.0" },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Yahoo proxy failed" }, { status: 502 });
  }
}
