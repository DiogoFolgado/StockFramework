"use client";

import { useState } from "react";

interface SentimentEntry {
  score:           number;
  summary:         string;
  thesisShift:     boolean;
  newsSampleCount: number;
  analyzedAt:      string;
}

interface Props {
  sentiment:       Record<string, SentimentEntry>;
  onRefresh:       () => void;
  refreshing:      boolean;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{
      width:        36,
      height:       36,
      borderRadius: "50%",
      border:       `2px solid ${color}`,
      display:      "flex",
      alignItems:   "center",
      justifyContent: "center",
      fontSize:     13,
      fontWeight:   700,
      color,
      flexShrink:   0,
    }}>
      {score.toFixed(1)}
    </div>
  );
}

export function SentimentPanel({ sentiment, onRefresh, refreshing }: Props) {
  const entries = Object.entries(sentiment);

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          SEMANTIC SENTIMENT ENGINE
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            padding:      "5px 12px",
            borderRadius: 6,
            border:       "1px solid var(--border)",
            background:   "var(--bg1)",
            color:        "var(--text2)",
            fontSize:     12,
            cursor:       refreshing ? "not-allowed" : "pointer",
            opacity:      refreshing ? 0.6 : 1,
          }}
        >
          {refreshing ? "Analyzing…" : "↻ Refresh Sentiment"}
        </button>
      </div>

      {entries.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
          Click "Refresh Sentiment" to run AI news analysis on your holdings.
        </div>
      ) : (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map(([ticker, entry]) => {
            const date = new Date(entry.analyzedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
            return (
              <div key={ticker} style={{
                display:      "flex",
                alignItems:   "flex-start",
                gap:          12,
                padding:      "10px 12px",
                background:   entry.thesisShift ? "rgba(239,68,68,0.07)" : "var(--bg1)",
                borderRadius: 8,
                border:       entry.thesisShift ? "1px solid rgba(239,68,68,0.30)" : "1px solid transparent",
              }}>
                <ScoreBadge score={entry.score} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{ticker}</span>
                    {entry.thesisShift && (
                      <span style={{
                        background: "#ef4444",
                        color:      "#fff",
                        fontSize:   10,
                        fontWeight: 700,
                        padding:    "2px 6px",
                        borderRadius: 4,
                      }}>
                        ⚠ THESIS SHIFT
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--text2)", marginLeft: "auto" }}>
                      {entry.newsSampleCount} articles · {date}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)" }}>{entry.summary}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
