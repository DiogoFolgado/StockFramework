import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { PILLARS, CRYPTO_PILLARS } from "@/lib/scoring/engine";

// Public page — no auth required
export const dynamic = "force-dynamic";

interface SharedAnalysis {
  ticker: string;
  companyName: string;
  sector: string;
  composite: number;
  signal: string;
  scores: Record<string, { score: number; verdict: string; insights: string[] }>;
  quote: { c?: number; pc?: number };
  metrics: { "52WeekHigh"?: number; "52WeekLow"?: number; targetPriceMean?: number; beta?: number };
  isCrypto: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const SIGNAL_COLORS: Record<string, string> = {
  "STRONG BUY":  "#4cbb8a",
  "BUY":         "#8fd46a",
  "NEUTRAL":     "#d4a843",
  "SELL":        "#e07c3c",
  "STRONG SELL": "#e05252",
};

export default async function SharedAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = await prisma.sharedAnalysis.findUnique({ where: { id } });

  if (!raw || raw.expiresAt < new Date()) notFound();

  const r = raw as unknown as SharedAnalysis & { createdAt: Date };
  const pillars = r.isCrypto ? CRYPTO_PILLARS : PILLARS;
  const sigColor = SIGNAL_COLORS[r.signal] ?? "#d4a843";
  const cur = (r.quote as { c?: number }).c;
  const h52 = (r.metrics as { "52WeekHigh"?: number })["52WeekHigh"];
  const l52 = (r.metrics as { "52WeekLow"?: number })["52WeekLow"];
  let sparkPct = 0.5;
  if (cur && h52 && l52 && h52 > l52) sparkPct = Math.min(1, Math.max(0, (cur - l52) / (h52 - l52)));
  const sx = sparkPct * 480 + 20;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Space Mono', monospace" }}>
      {/* Header bar */}
      <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 13 }}>Stock Analysis Framework</div>
          <div style={{ color: "var(--text3)", fontSize: 9, letterSpacing: 2 }}>RESEARCH-GRADE · FOUR-PILLAR</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)" }}>
          Shared analysis · expires {r.expiresAt.toLocaleDateString()}
        </div>
        <a
          href="/login"
          style={{ padding: "5px 14px", background: "var(--gold)", color: "#07070f", borderRadius: 4, fontSize: 11, fontWeight: 700, textDecoration: "none" }}
        >
          Sign in to analyse
        </a>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        {/* Title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 2, marginBottom: 6 }}>
            SHARED ANALYSIS · {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>{r.ticker}</span>
            <span
              style={{
                padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700,
                background: sigColor + "22", border: `1px solid ${sigColor}`, color: sigColor,
              }}
            >
              {r.signal}
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: sigColor }}>
              {r.composite.toFixed(1)}<span style={{ fontSize: 13, color: "var(--text3)" }}>/10</span>
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>{r.companyName} · {r.sector}</div>
        </div>

        {/* 52W sparkline */}
        {h52 && l52 && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 9 }}>PRICE POSITION · 52-WEEK RANGE</div>
            <svg viewBox="0 0 540 60" width="100%" height="60">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e05555" />
                  <stop offset="50%" stopColor="#d4a843" />
                  <stop offset="100%" stopColor="#4cbb8a" />
                </linearGradient>
              </defs>
              <rect x="0" y="22" width="520" height="6" rx="3" fill="#1a1a35" />
              <rect x="0" y="22" width={sx} height="6" rx="3" fill="url(#sg)" />
              <circle cx={sx} cy="25" r="5" fill="var(--gold)" stroke="#07070f" strokeWidth="2" />
              {cur && <text x={sx} y="14" textAnchor="middle" fill="#d4a843" fontSize="10" fontWeight="700">${cur.toFixed(2)}</text>}
              <text x="0" y="50" fill="#5a5a80" fontSize="10">${l52.toFixed(2)}</text>
              <text x="520" y="50" textAnchor="end" fill="#5a5a80" fontSize="10">${h52.toFixed(2)}</text>
            </svg>
          </div>
        )}

        {/* Four pillar cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          {pillars.map(pl => {
            const s = r.scores[pl.id];
            if (!s) return null;
            const circ = 2 * Math.PI * 18;
            return (
              <div key={pl.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: pl.color }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#1a1a35" strokeWidth="3.5" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={pl.color} strokeWidth="3.5"
                      strokeDasharray={`${(s.score / 10) * circ} ${circ}`}
                      strokeLinecap="round" transform="rotate(-90 22 22)" />
                    <text x="22" y="27" textAnchor="middle" fill={pl.color} style={{ font: "700 10px 'Space Mono', monospace" }}>
                      {s.score}
                    </text>
                  </svg>
                  <div>
                    <div style={{ color: pl.color, fontWeight: 600, fontSize: 12 }}>{pl.icon} {pl.label}</div>
                    <div style={{ color: "var(--text3)", fontSize: 10, marginTop: 1 }}>WEIGHT {pl.wLabel}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 6 }}>{s.verdict}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  {s.insights.slice(0, 4).map((ins: string, i: number) => (
                    <li key={i} style={{ fontSize: 11, color: "var(--text)", paddingLeft: 10, position: "relative", lineHeight: 1.4 }}>
                      <span style={{ position: "absolute", left: 0, color: pl.color }}>·</span>
                      {ins}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 8, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10 }}>
            Want to analyse stocks yourself using the same four-pillar framework?
          </div>
          <a
            href="/login"
            style={{ display: "inline-block", padding: "9px 24px", background: "var(--gold)", color: "#07070f", borderRadius: 4, fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            Create Free Account →
          </a>
        </div>
      </main>
    </div>
  );
}
