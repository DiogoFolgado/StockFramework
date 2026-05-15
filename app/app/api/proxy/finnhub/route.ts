import { NextRequest, NextResponse } from "next/server";

const FINNHUB_BASE = "https://finnhub.io/api/v1";

export async function GET(req: NextRequest) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Finnhub API key not configured" }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const sep = path.includes("?") ? "&" : "?";
  const upstreamUrl = `${FINNHUB_BASE}${path}${sep}token=${key}`;

  try {
    const res = await fetch(upstreamUrl);
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "Invalid Finnhub API key" }, { status: 401 });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Finnhub proxy failed" }, { status: 502 });
  }
}
