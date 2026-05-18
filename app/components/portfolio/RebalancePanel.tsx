"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { RebalanceResponse } from "@/app/api/portfolio/rebalance/route";

interface Props {
  data: RebalanceResponse;
}

const SECTOR_COLORS = [
  "#d4a843", "#60a5fa", "#34d399", "#f87171", "#a78bfa",
  "#fb923c", "#38bdf8", "#4ade80", "#f472b6", "#facc15",
];

export function RebalancePanel({ data }: Props) {
  const sectorEntries = Object.entries(data.sectors).sort((a, b) => b[1].weight - a[1].weight);
  const chartData = sectorEntries.map(([sector, info]) => ({
    sector:     sector.length > 14 ? sector.slice(0, 13) + "…" : sector,
    weight:     info.weight,
    fullSector: sector,
  }));

  const sectorAlerts     = data.alerts.filter(a => a.type === "CONCENTRATION");
  const singleStockAlerts = data.alerts.filter(a => a.type === "SINGLE_STOCK_CONCENTRATION");
  const netTaxEur        = Math.max(0, data.totalTaxEur - data.taxLossOffsetEur);

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          SECTOR REBALANCE OPTIMIZER
        </span>
        <span style={{ fontSize: 12, color: "var(--text2)" }}>
          Portfolio: €{data.totalValueEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Single-stock concentration alerts */}
      {singleStockAlerts.length > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
          {singleStockAlerts.map((alert, i) => (
            <div key={i} style={{
              background:   "rgba(168,85,247,0.10)",
              border:       "1px solid rgba(168,85,247,0.35)",
              borderRadius: 6,
              padding:      "8px 12px",
              fontSize:     13,
              color:        "var(--text1)",
            }}>
              <span style={{ color: "#a855f7", fontWeight: 700 }}>◆ Single-Stock Risk: </span>
              {alert.suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Sector concentration alerts */}
      {sectorAlerts.length > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
          {sectorAlerts.map((alert, i) => (
            <div key={i} style={{
              background:   "rgba(239,68,68,0.10)",
              border:       "1px solid rgba(239,68,68,0.35)",
              borderRadius: 6,
              padding:      "8px 12px",
              fontSize:     13,
              color:        "var(--text1)",
            }}>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>⚠ Concentration Risk: </span>
              {alert.suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Sector bar chart */}
      {chartData.length > 0 && (
        <div style={{ padding: "16px 16px 8px" }}>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="sector" tick={{ fontSize: 10, fill: "var(--text2)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text2)" }} unit="%" />
              <Tooltip
                contentStyle={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Weight"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullSector ?? ""}
              />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.sector}
                    fill={entry.weight > 60 ? "#ef4444" : SECTOR_COLORS[index % SECTOR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trim targets with tax impact */}
      {data.trimTargets.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
            TRIM TARGETS
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "var(--text2)", fontSize: 11 }}>
                  <th style={{ textAlign: "left",  padding: "4px 8px 6px 0" }}>Ticker</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px" }}>Gain</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px" }}>Gross €</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px" }}>Tax (28%)</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px 0" }}>Net €</th>
                </tr>
              </thead>
              <tbody>
                {data.trimTargets.map(t => (
                  <tr key={t.ticker} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "6px 8px 6px 0", fontWeight: 700 }}>{t.ticker}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#22c55e", fontWeight: 600 }}>+{t.gainPct.toFixed(1)}%</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>€{t.gainEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#ef4444" }}>−€{t.taxEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: "6px 0 6px 8px", textAlign: "right", fontWeight: 600 }}>€{t.netGainEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {netTaxEur > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text2)", display: "flex", justifyContent: "space-between" }}>
                <span>Est. tax after loss offset</span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>−€{netTaxEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution path */}
      {data.executionPath.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
            EXECUTION PATH
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.executionPath.map((step, i) => (
              <li key={i} style={{ fontSize: 13, color: "var(--text1)", lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Tax-loss harvesting */}
      {data.taxLoss.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
            TAX-LOSS HARVESTING OPPORTUNITIES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.taxLoss.map(t => (
              <div key={t.ticker} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 700, minWidth: 60 }}>{t.ticker}</span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>−€{t.lossEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })} (−{t.lossPct.toFixed(1)}%)</span>
              </div>
            ))}
            {data.taxLossOffsetEur > 0 && (
              <div style={{ marginTop: 4, fontSize: 12, color: "#22c55e" }}>
                Total harvestable offset: €{data.taxLossOffsetEur.toLocaleString("en-IE", { maximumFractionDigits: 0 })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
