"use client";

import type { TickerScore } from "@/app/api/portfolio/scores/route";

interface Props {
  scores:  Record<string, TickerScore>;
  tickers: string[];
}

function pillarColor(score: number): string {
  if (score < 4.0) return "rgba(239,68,68,0.18)";
  if (score < 5.5) return "rgba(245,158,11,0.15)";
  return "rgba(34,197,94,0.10)";
}

function pillarText(score: number): string {
  if (score < 4.0) return "#ef4444";
  if (score < 5.5) return "#f59e0b";
  return "#22c55e";
}

function signalColor(signal: string): string {
  if (signal.includes("STRONG BUY"))  return "#22c55e";
  if (signal.includes("BUY"))         return "#86efac";
  if (signal.includes("STRONG SELL")) return "#ef4444";
  if (signal.includes("SELL"))        return "#fca5a5";
  return "var(--text2)";
}

function ScoreCell({ score }: { score: number }) {
  return (
    <td style={{
      padding:    "10px 12px",
      textAlign:  "center",
      background: pillarColor(score),
      color:      pillarText(score),
      fontWeight: 700,
      fontSize:   13,
    }}>
      {score.toFixed(1)}
    </td>
  );
}

export function PillarScoreTable({ scores, tickers }: Props) {
  const thStyle: React.CSSProperties = {
    padding:       "8px 12px",
    textAlign:     "center",
    fontSize:      11,
    fontFamily:    "'Space Mono', monospace",
    letterSpacing: 1,
    color:         "var(--text2)",
    fontWeight:    600,
    borderBottom:  "1px solid var(--border)",
    whiteSpace:    "nowrap",
  };

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          FOUR-PILLAR SCORE DASHBOARD
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg1)" }}>
              <th style={{ ...thStyle, textAlign: "left" }}>TICKER</th>
              <th style={thStyle}>FUND</th>
              <th style={thStyle}>TECH</th>
              <th style={thStyle}>ENTROPY</th>
              <th style={thStyle}>SEMANTIC</th>
              <th style={thStyle}>COMPOSITE</th>
              <th style={thStyle}>SIGNAL</th>
              <th style={{ ...thStyle, textAlign: "right" }}>ANALYZED</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map(ticker => {
              const s = scores[ticker];
              if (!s) {
                return (
                  <tr key={ticker} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 13 }}>{ticker}</td>
                    <td colSpan={7} style={{ padding: "10px 12px", color: "var(--text2)", fontSize: 12, fontStyle: "italic" }}>
                      Not scored yet — run analysis from the home page
                    </td>
                  </tr>
                );
              }
              const date = new Date(s.analyzedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              return (
                <tr key={ticker} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, fontSize: 13 }}>{ticker}</td>
                  <ScoreCell score={s.fundamental} />
                  <ScoreCell score={s.technical}   />
                  <ScoreCell score={s.entropy}     />
                  <ScoreCell score={s.semantic}    />
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                    {s.composite.toFixed(1)}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, fontWeight: 700, color: signalColor(s.signal) }}>
                    {s.signal}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, color: "var(--text2)" }}>
                    {date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 16, fontSize: 11, color: "var(--text2)" }}>
        <span><span style={{ color: "#ef4444" }}>■</span> &lt;4.0 Alert</span>
        <span><span style={{ color: "#f59e0b" }}>■</span> 4.0–5.5 Watch</span>
        <span><span style={{ color: "#22c55e" }}>■</span> ≥5.5 OK</span>
      </div>
    </div>
  );
}
