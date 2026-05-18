import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { fetchItunesEpisodes } from "@/lib/podcast/itunes";
import { generateEpisodeSummary } from "@/lib/podcast/summarise";

const CACHE_MINUTES = 60;
const SHOW_URL = "https://podcasts.apple.com/podcast/id1726048251";
const EPISODE_LIMIT = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check DB freshness — skip iTunes if we have recent data
    const newest = await prisma.podcastEpisode.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    const stale =
      !newest ||
      Date.now() - newest.updatedAt.getTime() > CACHE_MINUTES * 60 * 1000;

    if (stale) {
      const raw = await fetchItunesEpisodes();

      for (const ep of raw) {
        // iTunes trackId is a large int (>2B) — must be stored as BigInt
        await prisma.podcastEpisode.upsert({
          where: { trackId: BigInt(ep.trackId) },
          create: {
            trackId:     BigInt(ep.trackId),
            trackName:   ep.trackName,
            description: ep.description ?? "",
            releaseDate: new Date(ep.releaseDate),
            durationMs:  ep.trackTimeMillis ?? 0,
            episodeUrl:  ep.episodeUrl ?? "",
            trackViewUrl: ep.trackViewUrl || SHOW_URL,
            artworkUrl:  ep.artworkUrl600 ?? "",
          },
          // Do NOT include aiSummary — preserve cached summaries on re-fetch
          update: { updatedAt: new Date() },
        });
      }
    }

    const dbEpisodes = await prisma.podcastEpisode.findMany({
      orderBy: { releaseDate: "desc" },
      take: EPISODE_LIMIT,
    });

    if (dbEpisodes.length === 0) {
      return NextResponse.json({ episodes: [], latestTrackId: 0 });
    }

    // Generate missing summaries sequentially — a failure on any one episode
    // is caught and skipped so the rest of the list still loads.
    const episodes = dbEpisodes.map((ep) => ({ ...ep }));
    for (const ep of episodes) {
      if (!ep.aiSummary && ep.description) {
        try {
          const summary = await generateEpisodeSummary(ep.trackName, ep.description);
          if (summary) {
            await prisma.podcastEpisode.update({
              where: { id: ep.id },
              data:  { aiSummary: summary },
            });
            ep.aiSummary = summary;
          }
        } catch {
          // Summary generation failed — leave aiSummary null, continue
        }
      }
    }

    // BigInt doesn't serialize to JSON — convert trackId to Number.
    // All iTunes IDs fit within Number.MAX_SAFE_INTEGER (~9 * 10^15).
    const serialized = episodes.map((ep) => ({
      ...ep,
      trackId:    Number(ep.trackId),
      releaseDate: ep.releaseDate.toISOString(),
      fetchedAt:   ep.fetchedAt.toISOString(),
      updatedAt:   ep.updatedAt.toISOString(),
    }));

    const latestTrackId = Math.max(...serialized.map((e) => e.trackId));

    return NextResponse.json({ episodes: serialized, latestTrackId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch episodes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
