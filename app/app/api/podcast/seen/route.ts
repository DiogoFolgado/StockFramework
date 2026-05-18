import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { trackId?: unknown };
  if (typeof body.trackId !== "number" || !Number.isFinite(body.trackId)) {
    return NextResponse.json({ error: "Invalid trackId" }, { status: 400 });
  }

  try {
    // Client sends a regular number — convert to BigInt for the BIGINT column
    const trackId = BigInt(Math.round(body.trackId));
    await prisma.podcastNotificationState.upsert({
      where:  { userId: session.user.id },
      create: { userId: session.user.id, lastSeenTrackId: trackId },
      update: { lastSeenTrackId: trackId },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
