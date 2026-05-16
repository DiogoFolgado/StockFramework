"use client";

import { newsAge } from "@/lib/utils/formatters";

interface NewsItem {
  id:       number;
  headline: string;
  source:   string;
  url:      string;
  datetime: number;
  summary:  string;
  image:    string;
}

export function NewsCard({ item: n }: { item: NewsItem }) {
  return (
    <a
      href={n.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "14px 18px",
        display: "flex", gap: 14, textDecoration: "none", color: "inherit",
      }}
    >
      {n.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={n.image} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>{n.headline}</div>
        <div style={{
          color: "var(--text2)", fontSize: 12, marginBottom: 6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {n.summary}
        </div>
        <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
          {n.source} · {newsAge(n.datetime)}
        </div>
      </div>
    </a>
  );
}
