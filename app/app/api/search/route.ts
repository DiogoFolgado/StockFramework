import { NextRequest, NextResponse } from "next/server";
import { searchTickers } from "@/lib/yahoo/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  if (!q || q.trim().length < 1) return NextResponse.json({ results: [] });

  try {
    const results = await searchTickers(q.trim());
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
