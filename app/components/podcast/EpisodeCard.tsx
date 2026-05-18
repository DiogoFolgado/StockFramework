"use client";

const SHOW_URL = "https://podcasts.apple.com/podcast/id1726048251";

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

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin <= 0) return "—";
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${totalMin}m`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function EpisodeCard({ episode: ep }: { episode: Episode }) {
  const href = ep.trackViewUrl || SHOW_URL;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      style={{
        background:     "var(--bg2)",
        border:         "1px solid var(--border)",
        borderRadius:   "var(--radius)",
        padding:        "14px 18px",
        display:        "flex",
        gap:            14,
        textDecoration: "none",
        color:          "inherit",
        transition:     "border-color .15s",
      }}
    >
      {ep.artworkUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ep.artworkUrl}
          alt=""
          style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row — chip sits inline at the right so it never overlaps text */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, flex: 1 }}>
            {ep.trackName}
          </div>
          <span
            style={{
              flexShrink:   0,
              background:   "rgba(212,168,67,0.12)",
              border:       "1px solid rgba(212,168,67,0.3)",
              color:        "var(--gold)",
              borderRadius: 4,
              padding:      "2px 8px",
              fontSize:     10,
              fontFamily:   "'Space Mono', monospace",
              whiteSpace:   "nowrap",
              marginTop:    2,
            }}
          >
            ▶ Apple Podcasts
          </span>
        </div>

        {/* Full summary — no line clamp so the whole thing is readable */}
        <div style={{ color: "var(--text2)", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
          {ep.aiSummary ?? (
            <span style={{ color: "var(--text3)", fontStyle: "italic" }}>
              Generating summary…
            </span>
          )}
        </div>

        <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {formatDuration(ep.durationMs)} · {timeAgo(ep.releaseDate)}
        </div>
      </div>
    </a>
  );
}
