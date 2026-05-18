"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { FxResponse } from "@/app/api/portfolio/fx/route";

interface Props {
  data: FxResponse;
}

export function FxHedgingPanel({ data }: Props) {
  const totalEur    = data.usdExposureEur + data.eurExposure;
  const usdPct      = data.usdWeight;
  const eurPct      = totalEur > 0 ? 100 - usdPct : 0;

  const pieData = [
    { name: "USD Positions", value: Math.round(usdPct * 10) / 10 },
    { name: "EUR Positions", value: Math.round(eurPct * 10) / 10 },
  ];

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          CURRENCY HEDGING TRACKER
        </span>
      </div>

      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {/* Pie chart */}
        <div style={{ minWidth: 180, flex: "0 0 180px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px 8px" }}>
          <ResponsiveContainer width={160} height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" strokeWidth={0}>
                <Cell fill="#60a5fa" />
                <Cell fill="#d4a843" />
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text2)" }}>
            <span><span style={{ color: "#60a5fa" }}>■</span> USD {usdPct.toFixed(1)}%</span>
            <span><span style={{ color: "#d4a843" }}>■</span> EUR {eurPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--bg1)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>USD Exposure</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                €{data.usdExposureEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div style={{ background: "var(--bg1)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 4 }}>Est. FX Drag/mo</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: data.fxDragPct && data.fxDragPct > 0 ? "#ef4444" : "#22c55e" }}>
                {data.fxDragPct !== null
                  ? `${data.fxDragPct > 0 ? "-" : "+"}${Math.abs(data.fxDragPct).toFixed(2)}%`
                  : "—"}
              </div>
            </div>
          </div>

          {/* Top USD positions */}
          {data.topUsdPositions.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 6, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
                TOP USD POSITIONS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.topUsdPositions.map(p => (
                  <div key={p.ticker} style={{
                    background:   "var(--bg1)",
                    borderRadius: 6,
                    padding:      "4px 10px",
                    fontSize:     12,
                    display:      "flex",
                    gap:          6,
                  }}>
                    <span style={{ fontWeight: 600 }}>{p.ticker}</span>
                    <span style={{ color: "#60a5fa" }}>{p.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hedge suggestion */}
          {data.hedgeSuggestion && (
            <div style={{
              background:   "rgba(96,165,250,0.10)",
              border:       "1px solid rgba(96,165,250,0.30)",
              borderRadius: 7,
              padding:      "9px 12px",
              fontSize:     13,
              color:        "var(--text1)",
            }}>
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>FX Alert: </span>
              {data.hedgeSuggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
