"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PodcastHeader } from "@/components/podcast/PodcastHeader";
import { EpisodeCard } from "@/components/podcast/EpisodeCard";
import { NotificationBanner } from "@/components/podcast/NotificationBanner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

interface Episode {
  id: string;
  trackId: number;
  trackName: string;
  releaseDate: string;
  durationMs: number;
  trackViewUrl: string;
  artworkUrl: string;
  aiSummary: string | null;
}

function usePodcastCheck(onNewEpisode: (name: string) => void) {
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/podcast/check-new");
        if (!res.ok) return;
        const { hasNew, latestEpisodeName } = await res.json();
        if (hasNew) {
          localStorage.setItem("podcast_has_new", "true");
          onNewEpisode(latestEpisodeName as string);
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("The Rundown — New Episode", {
              body: latestEpisodeName,
              icon: "/favicon.ico",
            });
          }
        }
      } catch {
        // fail silently
      }
    };

    poll();
    const id = setInterval(poll, 5 * 60 * 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// Inner component that uses useSearchParams — must be inside <Suspense>
function PodcastPageInner() {
  const searchParams = useSearchParams();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(
    searchParams.get("newEpisode") === "1"
  );

  usePodcastCheck(() => setBannerVisible(true));

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/podcast/episodes");
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { episodes: Episode[]; latestTrackId: number };
      setEpisodes(data.episodes ?? []);

      if (data.latestTrackId) {
        fetch("/api/podcast/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId: data.latestTrackId }),
        }).catch(() => {});
        localStorage.removeItem("podcast_has_new");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load episodes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
      <PodcastHeader />

      <NotificationBanner
        show={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />

      {loading && (
        <LoadingSpinner message="Loading episodes & generating summaries…" />
      )}

      {error && !loading && <ErrorBanner message={error} />}

      {!loading && !error && episodes.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)", fontSize: 14 }}>
          No episodes found.
        </div>
      )}

      {!loading && episodes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}

      {!loading && episodes.length > 0 && (
        <div style={{
          marginTop: 24,
          textAlign: "center",
          color: "var(--text3)",
          fontSize: 11,
          fontFamily: "'Space Mono', monospace",
        }}>
          Showing latest {episodes.length} episodes · Checks for new episodes every 5 minutes
        </div>
      )}
    </main>
  );
}

export default function PodcastPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
          <LoadingSpinner message="Loading podcast…" />
        </main>
      }
    >
      <PodcastPageInner />
    </Suspense>
  );
}
