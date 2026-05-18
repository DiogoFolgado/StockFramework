"use client";

import { useState } from "react";
import type { CorrelationResponse } from "@/app/api/portfolio/correlation/route";

interface Props {
  data: CorrelationResponse;
}

const CRYPTO_PATTERNS = /^(BTC|ETH|SOL|ADA|XRP|DOGE|AVAX|DOT|MATIC|LTC)/i;

function corrColor(value: number): string {
  const abs = Math.abs(value);
  if (value === 1)  return "rgba(212,168,67,0.30)";
  if (abs > 0.70)  return `rgba(239,68,68,${0.15 + abs * 0.40})`;
  if (abs > 0.40)  return `rgba(245,158,11,${0.10 + abs * 0.35})`;
  if (abs > 0.10)  return `rgba(34,197,94,${0.06 + abs * 0.25})`;
  return "rgba(100,100,100,0.06)";
}

function corrTextColor(value: number): string {
  const abs = Math.abs(value);
  if (value === 1)  return "var(--gold)";
  if (abs > 0.70)  return "#ef4444";
  if (abs > 0.40)  return "#f59e0b";
  if (abs > 0.10)  return "#22c55e";
  return "var(--text2)";
}

export function CorrelationMatrix({ data }: Props) {
  const { tickers, matrix, tailRiskPairs, cryptoPairs } = data;
  const n = tickers.length;
  const [tooltip, setTooltip] = useState<{ a: string; b: string; val: number; x: number; y: number } | null>(null);

  if (n < 2) {
    return (
      <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", padding: 24, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
        Add at least 2 holdings to see correlation analysis.
      </div>
    );
  }

  const cellSize = Math.max(36, Math.min(58, Math.floor(480 / n)));
  const labelWidth = 52;

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", position: "relative" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          CORRELATION HEATMAP
        </span>
        <span style={{ fontSize: 11, color: "var(--text2)", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 4, padding: "2px 8px" }}>
          REAL-TIME · 90d
        </span>
      </div>

      {/* Heatmap grid */}
      <div style={{ padding: 16, overflowX: "auto" }}>
        <div style={{ display: "inline-block", minWidth: "100%" }}>

          {/* Column headers (rotated) */}
          <div style={{ display: "flex", marginLeft: labelWidth, marginBottom: 4 }}>
            {tickers.map(t => (
              <div
                key={t}
                style={{
                  width:     cellSize,
                  flexShrink: 0,
                  display:   "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  height:    44,
                  overflow:  "hidden",
                }}
              >
                <span style={{
                  display:       "block",
                  transformOrigin: "bottom center",
                  transform:     "rotate(-45deg) translateX(-2px)",
                  fontSize:      9,
                  fontWeight:    700,
                  fontFamily:    "'Space Mono', monospace",
                  color:         CRYPTO_PATTERNS.test(t) ? "#f59e0b" : "var(--text2)",
                  whiteSpace:    "nowrap",
                  lineHeight:    1,
                }}>
                  {t.length > 7 ? t.slice(0, 6) + "…" : t}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {tickers.map((rowTicker, i) => (
            <div key={rowTicker} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
              {/* Row label */}
              <div style={{
                width:      labelWidth,
                flexShrink: 0,
                fontSize:   9,
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                color:      CRYPTO_PATTERNS.test(rowTicker) ? "#f59e0b" : "var(--text2)",
                textAlign:  "right",
                paddingRight: 6,
                overflow:   "hidden",
                whiteSpace: "nowrap",
              }}>
                {rowTicker.length > 7 ? rowTicker.slice(0, 6) + "…" : rowTicker}
              </div>

              {/* Cells */}
              {tickers.map((colTicker, j) => {
                const val = matrix[i]?.[j] ?? 0;
                const bg  = corrColor(val);
                const tc  = corrTextColor(val);
                return (
                  <div
                    key={j}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ a: rowTicker, b: colTicker, val, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width:        cellSize,
                      height:       cellSize,
                      flexShrink:   0,
                      background:   bg,
                      borderRadius: 3,
                      marginRight:  2,
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      cursor:       "crosshair",
                      transition:   "opacity 0.1s",
                    }}
                  >
                    <span style={{
                      fontSize:   cellSize > 46 ? 11 : 9,
                      fontWeight: Math.abs(val) > 0.70 ? 700 : 400,
                      color:      tc,
                      fontFamily: "'Space Mono', monospace",
                    }}>
                      {val === 1 ? "—" : val.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hover tooltip */}
        {tooltip && tooltip.a !== tooltip.b && (
          <div style={{
            position:     "fixed",
            left:         tooltip.x + 10,
            top:          tooltip.y - 36,
            background:   "var(--bg1)",
            border:       "1px solid var(--border)",
            borderRadius: 6,
            padding:      "5px 10px",
            fontSize:     12,
            pointerEvents: "none",
            zIndex:        100,
            whiteSpace:   "nowrap",
            boxShadow:    "0 4px 12px rgba(0,0,0,0.4)",
          }}>
            <span style={{ fontWeight: 700 }}>{tooltip.a}</span>
            <span style={{ color: "var(--text2)", margin: "0 4px" }}>↔</span>
            <span style={{ fontWeight: 700 }}>{tooltip.b}</span>
            <span style={{ marginLeft: 10, color: corrTextColor(tooltip.val), fontWeight: 600 }}>
              {tooltip.val.toFixed(3)}
            </span>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11, color: "var(--text2)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", letterSpacing: 1, fontSize: 10 }}>KEY:</span>
          <span><span style={{ color: "#ef4444" }}>■</span> &gt;0.70 Tail-risk</span>
          <span><span style={{ color: "#f59e0b" }}>■</span> 0.40–0.70 Moderate</span>
          <span><span style={{ color: "#22c55e" }}>■</span> 0.10–0.40 Low</span>
          <span><span style={{ color: "rgba(100,100,100,0.5)" }}>■</span> &lt;0.10 Uncorrelated</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Crypto</span>
        </div>
      </div>

      {/* Tail risk pairs */}
      {tailRiskPairs.length > 0 && (
        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
            TAIL-RISK LINKED PAIRS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tailRiskPairs.map((p, i) => (
              <div key={i} style={{
                background:   "rgba(239,68,68,0.12)",
                border:       "1px solid rgba(239,68,68,0.30)",
                borderRadius: 6,
                padding:      "5px 10px",
                fontSize:     12,
                color:        "#ef4444",
                fontWeight:   600,
              }}>
                {p.a} ↔ {p.b} <span style={{ fontWeight: 400 }}>({(p.corr * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text2)" }}>
            These positions tend to fall together during market stress — your AI stack is nearly perfectly correlated. Consider reducing combined exposure.
          </div>
        </div>
      )}

      {/* Crypto-equity correlations */}
      {cryptoPairs.length > 0 && (
        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
            CRYPTO ↔ EQUITY CORRELATION
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cryptoPairs.map((p, i) => (
              <div key={i} style={{
                background:   "var(--bg1)",
                borderRadius: 6,
                padding:      "5px 10px",
                fontSize:     12,
                display:      "flex",
                gap:          8,
              }}>
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>₿</span>
                <span style={{ fontWeight: 600 }}>{p.ticker}</span>
                <span style={{ color: corrTextColor(p.btcCorr) }}>{p.btcCorr.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
