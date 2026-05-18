"use client";

import { useState, useEffect, useCallback } from "react";
import type { Suggestion, SuggestionsResponse } from "@/app/api/portfolio/suggestions/route";

const ACTION_COLOR: Record<string, string> = {
  SELL:         "var(--red)",
  TRIM:         "#e07b39",
  ADD:          "var(--green)",
  BUY:          "var(--green)",
  DEPLOY_CASH:  "var(--gold)",
  HOLD:         "var(--text3)",
};

const ACTION_BG: Record<string, string> = {
  SELL:         "rgba(239,68,68,.12)",
  TRIM:         "rgba(224,123,57,.12)",
  ADD:          "rgba(34,197,94,.12)",
  BUY:          "rgba(34,197,94,.12)",
  DEPLOY_CASH:  "rgba(212,168,67,.12)",
  HOLD:         "rgba(100,100,100,.10)",
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   "var(--red)",
  MEDIUM: "var(--gold)",
  LOW:    "var(--text3)",
};

function SkeletonCard() {
  return (
    <div style={{
      background:   "var(--bg2)",
      border:       "1px solid var(--border)",
      borderRadius: 12,
      padding:      "18px 20px",
      display:      "flex",
      flexDirection: "column",
      gap:           10,
    }}>
      {[80, 55, 95, 65].map((w, i) => (
        <div key={i} style={{
          height:       12,
          borderRadius: 6,
          width:        `${w}%`,
          background:   "var(--bg3)",
          animation:    "sfPulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

function SuggestionCard({ s }: { s: Suggestion }) {
  const action = s.action ?? "HOLD";
  const color  = ACTION_COLOR[action] ?? "var(--text3)";
  const bg     = ACTION_BG[action]    ?? "rgba(100,100,100,.10)";
  const dot    = PRIORITY_COLOR[s.priority ?? "LOW"] ?? "var(--text3)";

  return (
    <div style={{
      background:    "var(--bg2)",
      border:        `1px solid var(--border)`,
      borderLeft:    `3px solid ${color}`,
      borderRadius:  12,
      padding:       "18px 20px",
      display:       "flex",
      flexDirection: "column",
      gap:           10,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Action chip */}
        <span style={{
          padding:      "3px 10px",
          borderRadius: 6,
          fontSize:     11,
          fontWeight:   700,
          fontFamily:   "'Space Mono', monospace",
          letterSpacing: 1,
          background:   bg,
          color,
          border:       `1px solid ${color}`,
          flexShrink:   0,
        }}>
          {action.replace("_", " ")}
        </span>

        {/* Ticker */}
        {s.ticker && (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize:   13,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              color:      "var(--text)",
            }}>
              {s.ticker}
            </span>
            {s.isNew && (
              <span style={{
                fontSize:     9,
                fontWeight:   700,
                fontFamily:   "'Space Mono', monospace",
                letterSpacing: 1,
                padding:      "2px 6px",
                borderRadius: 4,
                background:   "rgba(34,197,94,.15)",
                color:        "var(--green)",
                border:       "1px solid rgba(34,197,94,.3)",
              }}>NEW</span>
            )}
          </span>
        )}

        {/* Title */}
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", flex: 1 }}>
          {s.title}
        </span>

        {/* Priority badge */}
        <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block" }} />
          <span style={{ fontSize: 10, color: dot, fontFamily: "'Space Mono', monospace", letterSpacing: .5 }}>
            {s.priority}
          </span>
        </span>
      </div>

      {/* Reason */}
      <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
        {s.reason}
      </p>

      {/* Details */}
      {s.details && (
        <div style={{
          background:   "var(--bg3)",
          borderRadius: 8,
          padding:      "8px 12px",
          fontSize:     12,
          color:        "var(--text3)",
          fontFamily:   "'Space Mono', monospace",
          lineHeight:   1.6,
        }}>
          {s.details}
        </div>
      )}

      {/* Risk */}
      {s.risk && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ color: "var(--text3)", fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{s.risk}</span>
        </div>
      )}
    </div>
  );
}

export function SuggestionsPanel() {
  const CACHE_KEY = "sf_suggestions_v2";

  const [data,    setData]    = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Load from cache on mount — never auto-fetch
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setData(JSON.parse(cached) as SuggestionsResponse);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    let cash = { eur: 0, usd: 0 };
    try {
      const raw = localStorage.getItem("sf_cash_v1");
      if (raw) cash = JSON.parse(raw) as { eur: number; usd: number };
    } catch { /* ignore */ }

    try {
      const res = await fetch("/api/portfolio/suggestions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cash }),
      });
      if (!res.ok) {
        const e = await res.json() as { error?: string; raw?: string };
        const detail = e.raw ? ` — raw: ${e.raw.slice(0, 200)}` : "";
        throw new Error((e.error ?? `HTTP ${res.status}`) + detail);
      }
      const json = await res.json() as SuggestionsResponse;
      localStorage.setItem(CACHE_KEY, JSON.stringify(json));
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const generatedAt = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })
    : null;

  const sellCount   = data?.suggestions.filter(s => s.action === "SELL" || s.action === "TRIM").length ?? 0;
  const buyCount    = data?.suggestions.filter(s => s.action === "BUY"  || s.action === "ADD").length  ?? 0;
  const highCount   = data?.suggestions.filter(s => s.priority === "HIGH").length ?? 0;
  const newCount    = data?.suggestions.filter(s => s.isNew).length ?? 0;

  return (
    <>
      <style>{`
        @keyframes sfPulse {
          0%, 100% { opacity: .4; }
          50%       { opacity: .8; }
        }
      `}</style>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
            AI-powered suggestions based on your four-pillar scores, live prices, and portfolio composition.
          </div>
          {generatedAt && (
            <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
              Last updated {generatedAt}
            </div>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding:    "9px 18px",
            borderRadius: 8,
            fontSize:   13,
            fontWeight: 600,
            cursor:     loading ? "not-allowed" : "pointer",
            border:     "1px solid var(--gold)",
            background: loading ? "var(--bg3)" : "rgba(212,168,67,.10)",
            color:      loading ? "var(--text3)" : "var(--gold)",
            transition: "all .15s",
            flexShrink: 0,
          }}
        >
          {loading ? "Analysing…" : "↻ Refresh Analysis"}
        </button>
      </div>

      {/* Stats bar */}
      {data && !loading && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Suggestions",  value: data.suggestions.length,  color: "var(--text2)" },
            { label: "Urgent",       value: highCount,                 color: highCount > 0 ? "var(--red)"   : "var(--text3)" },
            { label: "Sell / Trim",  value: sellCount,                 color: sellCount > 0 ? "#e07b39"      : "var(--text3)" },
            { label: "Buy / Add",    value: buyCount,                  color: buyCount  > 0 ? "var(--green)" : "var(--text3)" },
            { label: "New Picks",    value: newCount,                  color: newCount  > 0 ? "var(--green)" : "var(--text3)" },
          ].map(stat => (
            <div key={stat.label} style={{
              background:   "var(--bg2)",
              border:       "1px solid var(--border)",
              borderRadius: 10,
              padding:      "10px 16px",
              display:      "flex",
              flexDirection: "column",
              gap:           2,
            }}>
              <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: stat.color }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: .5 }}>{stat.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background:   "rgba(239,68,68,.08)",
          border:       "1px solid var(--red)",
          borderRadius: 10,
          padding:      "14px 18px",
          color:        "var(--red)",
          fontSize:     13,
          marginBottom: 20,
        }}>
          <strong>Analysis failed:</strong> {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            background:   "rgba(212,168,67,.06)",
            border:       "1px solid var(--border)",
            borderRadius: 12,
            padding:      "14px 18px",
            height:       52,
            animation:    "sfPulse 1.5s ease-in-out infinite",
          }} />
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Summary */}
          <div style={{
            background:   "rgba(212,168,67,.06)",
            border:       "1px solid rgba(212,168,67,.25)",
            borderRadius: 12,
            padding:      "14px 18px",
            display:      "flex",
            gap:           12,
            alignItems:   "flex-start",
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>✦</span>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7 }}>
              {data.summary}
            </p>
          </div>

          {/* Suggestion cards */}
          {data.suggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}

          {/* Cash strategy */}
          {data.cashStrategy && (
            <div style={{
              background:   "var(--bg2)",
              border:       "1px solid var(--border)",
              borderLeft:   "3px solid var(--gold)",
              borderRadius: 12,
              padding:      "16px 20px",
              display:      "flex",
              gap:           12,
              alignItems:   "flex-start",
            }}>
              <span style={{ color: "var(--gold)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>$</span>
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "var(--gold)", letterSpacing: 1, marginBottom: 6 }}>
                  CASH STRATEGY
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                  {data.cashStrategy}
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {data.suggestions.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text3)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: .5 }}>✦</div>
              No suggestions at this time. Your portfolio looks well-positioned.
            </div>
          )}
        </div>
      )}
    </>
  );
}
