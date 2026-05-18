import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [state, latest] = await Promise.all([
      prisma.podcastNotificationState.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.podcastEpisode.findFirst({
        orderBy: { trackId: "desc" },
        select: { trackId: true, trackName: true },
      }),
    ]);

    if (!latest) {
      return NextResponse.json({ hasNew: false, latestTrackId: 0, latestEpisodeName: "" });
    }

    // Both trackId and lastSeenTrackId are BigInt — compare directly
    const hasNew = latest.trackId > (state?.lastSeenTrackId ?? BigInt(0));

    return NextResponse.json({
      hasNew,
      latestTrackId:    Number(latest.trackId), // safe: fits in Number.MAX_SAFE_INTEGER
      latestEpisodeName: latest.trackName,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
