"use client";

import { useState, useRef, useEffect } from "react";
import { PILLARS } from "@/lib/scoring/engine";

interface PillarResult {
  score: number;
  insights: string[];
  verdict: string;
}

interface AnalysisResult {
  ticker: string;
  companyName: string;
  sector: string;
  composite: number;
  signal: string;
  quote: { c?: number; pc?: number; o?: number; h?: number; l?: number };
  scores: Record<string, PillarResult>;
}

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

const SIGNAL_COLORS: Record<string, string> = {
  "STRONG BUY":  "#4cbb8a",
  "BUY":         "#7de8b0",
  "NEUTRAL":     "#d4a843",
  "SELL":        "#e87d3e",
  "STRONG SELL": "#e85d5d",
};

const PILLAR_COLORS: Record<string, string> = {
  fundamental: "#d4a843",
  technical:   "#4d9de0",
  entropy:     "#9b72cf",
  semantic:    "#4cbb8a",
};

export default function HomePage() {
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selected, setSelected]       = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<AnalysisResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [showDrop, setShowDrop]       = useState(false);
  const searchTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const { results } = await res.json();
        setSuggestions(results ?? []);
        setShowDrop(true);
      } catch { setSuggestions([]); }
    }, 280);
  }, [query]);

  async function analyse(ticker: string) {
    setShowDrop(false);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Analysis failed"); return; }
      setResult(data as AnalysisResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const chg      = result?.quote.c && result?.quote.pc ? (result.quote.c - result.quote.pc) / result.quote.pc : null;
  const sigColor = result ? (SIGNAL_COLORS[result.signal] ?? "var(--text)") : "var(--text)";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
          STOCK ANALYSIS
        </div>
        <div className="relative" style={{ maxWidth: 480 }}>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              onKeyDown={(e) => { if (e.key === "Enter" && (selected ?? query)) analyse(selected ?? query.toUpperCase()); }}
              placeholder="Ticker or company name…"
              style={{
                flex: 1, background: "var(--bg2)", border: "1px solid var(--border2)",
                borderRadius: "var(--radius)", color: "var(--text)", padding: "10px 14px", fontSize: 15,
                fontFamily: "'Space Mono', monospace", outline: "none",
              }}
              onFocus={() => suggestions.length && setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            />
            <button
              onClick={() => { if (selected ?? query) analyse(selected ?? query.toUpperCase()); }}
              style={{
                background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius)",
                padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              Analyse
            </button>
          </div>

          {showDrop && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 60, zIndex: 100,
              background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
              marginTop: 4, overflow: "hidden",
            }}>
              {suggestions.map((s) => (
                <div
                  key={s.ticker}
                  onMouseDown={() => { setQuery(s.name); setSelected(s.ticker); setSuggestions([]); setShowDrop(false); }}
                  style={{
                    padding: "9px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between",
                    alignItems: "center", borderBottom: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <span style={{ fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>{s.ticker}</span>
                    <span style={{ marginLeft: 10, color: "var(--text2)", fontSize: 12 }}>{s.name}</span>
                  </div>
                  <span style={{ color: "var(--text3)", fontSize: 11 }}>{s.exchange}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>
          <div style={{ fontSize: 28, marginBottom: 12, animation: "spin 1s linear infinite" }}>◎</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Analysing…</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(232,93,93,.1)", border: "1px solid var(--red)", borderRadius: "var(--radius)",
          padding: "14px 18px", color: "var(--red)", marginBottom: 20,
        }}>
          ⚠ {error}
        </div>
      )}

      {result && !loading && (
        <div>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "20px 24px", marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 22, fontWeight: 700 }}>
                {result.ticker}
              </div>
              <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 2 }}>{result.companyName}</div>
              <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{result.sector}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                ${result.quote.c?.toFixed(2) ?? "—"}
              </div>
              {chg != null && (
                <div style={{ color: chg >= 0 ? "var(--green)" : "var(--red)", fontSize: 14 }}>
                  {chg >= 0 ? "▲ +" : "▼ "}{(chg * 100).toFixed(2)}% today
                </div>
              )}
              <div style={{
                marginTop: 8, display: "inline-block", padding: "4px 14px", borderRadius: 6,
                background: sigColor + "22", color: sigColor, fontFamily: "'Space Mono', monospace",
                fontSize: 12, fontWeight: 700, border: `1px solid ${sigColor}44`,
              }}>
                {result.signal}
              </div>
            </div>
          </div>

          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "18px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: sigColor }}>
                {result.composite.toFixed(1)}
              </div>
              <div style={{ color: "var(--text3)", fontSize: 11 }}>/ 10.0</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${result.composite * 10}%`,
                  background: `linear-gradient(90deg, var(--blue), ${sigColor})`,
                  borderRadius: 4, transition: "width 1s ease",
                }} />
              </div>
              <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 6 }}>Composite Score (0–10)</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 16 }}>
            {PILLARS.map((pl) => {
              const s = result.scores[pl.id];
              if (!s) return null;
              const circ = 2 * Math.PI * 20;
              return (
                <div key={pl.id} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="20" fill="none" stroke="#1a1a35" strokeWidth="4" />
                      <circle
                        cx="26" cy="26" r="20" fill="none" stroke={PILLAR_COLORS[pl.id]} strokeWidth="4"
                        strokeDasharray={`${(s.score / 10) * circ} ${circ}`}
                        strokeLinecap="round" transform="rotate(-90 26 26)"
                      />
                      <text x="26" y="31" textAnchor="middle" fill={PILLAR_COLORS[pl.id]}
                        style={{ font: "700 11px 'Space Mono', monospace" }}>
                        {s.score}
                      </text>
                    </svg>
                    <div>
                      <div style={{ color: PILLAR_COLORS[pl.id], fontWeight: 600, fontSize: 13 }}>
                        {pl.icon} {pl.label}
                      </div>
                      <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>WEIGHT {pl.wLabel}</div>
                    </div>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 12, marginBottom: 8 }}>{s.verdict}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {s.insights.map((ins, i) => (
                      <li key={i} style={{ fontSize: 12, color: "var(--text)", paddingLeft: 12, position: "relative", lineHeight: 1.5 }}>
                        <span style={{ position: "absolute", left: 0, color: PILLAR_COLORS[pl.id] }}>·</span>
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setResult(null)}
            style={{
              background: "transparent", border: "1px solid var(--border2)", color: "var(--text3)",
              borderRadius: "var(--radius)", padding: "8px 16px", fontSize: 12, cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
