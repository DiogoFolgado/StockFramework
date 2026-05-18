"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { EntropyDataPoint } from "@/app/api/portfolio/entropy/route";

interface Props {
  history: EntropyDataPoint[];
}

function regimeColor(regime: string): string {
  if (regime === "HIGH")     return "#ef4444";
  if (regime === "ELEVATED") return "#f59e0b";
  return "#22c55e";
}

function formatDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-IE", { month: "short", day: "numeric" });
}

interface TooltipPayloadItem {
  value: number;
  payload: EntropyDataPoint;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = regimeColor(d.regime);
  return (
    <div style={{
      background:   "var(--bg1)",
      border:       "1px solid var(--border)",
      borderRadius: 6,
      padding:      "8px 12px",
      fontSize:     12,
      minWidth:     140,
    }}>
      <div style={{ color: "var(--text2)", marginBottom: 4 }}>{formatDate(d.date)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span>Entropy</span>
        <span style={{ fontWeight: 700 }}>{d.avgEntropy.toFixed(1)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <span>Regime</span>
        <span style={{ color, fontWeight: 700 }}>{d.regime}</span>
      </div>
      {d.hotspots.length > 0 && (
        <div style={{ marginTop: 4, color: "#ef4444", fontSize: 11 }}>
          Hotspots: {d.hotspots.join(", ")}
        </div>
      )}
    </div>
  );
}

export function EntropyChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <div style={{
        background:   "var(--bg2)",
        borderRadius: 10,
        border:       "1px solid var(--border)",
        padding:      "20px 16px",
        marginBottom: 20,
        textAlign:    "center",
        color:        "var(--text2)",
        fontSize:     13,
      }}>
        Entropy history will appear here after your first Risk Dashboard load. Check back tomorrow to see a trend.
      </div>
    );
  }

  const chartData = history.map(d => ({
    ...d,
    label: formatDate(d.date),
  }));

  const latest = history[history.length - 1];
  const earliest = history[0];
  const trend = history.length >= 2
    ? latest.avgEntropy - history[history.length - 2].avgEntropy
    : 0;

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          ENTROPY TRACKING
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12 }}>
          {trend !== 0 && (
            <span style={{ color: trend < 0 ? "#ef4444" : "#22c55e" }}>
              {trend < 0 ? "▼" : "▲"} {Math.abs(trend).toFixed(1)} today
            </span>
          )}
          <span style={{ color: "var(--text2)" }}>{history.length}d history</span>
        </div>
      </div>

      <div style={{ padding: "16px 16px 8px" }}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="entropyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#d4a843" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d4a843" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Regime bands */}
            <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "HIGH", position: "insideTopLeft", fontSize: 9, fill: "#ef4444" }} />
            <ReferenceLine y={6.0} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: "ELEVATED", position: "insideTopLeft", fontSize: 9, fill: "#f59e0b" }} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--text2)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 10, fill: "var(--text2)" }}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avgEntropy"
              stroke="#d4a843"
              strokeWidth={2}
              fill="url(#entropyGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#d4a843" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / regime guide */}
      <div style={{ padding: "8px 16px 14px", display: "flex", gap: 16, fontSize: 11, color: "var(--text2)", flexWrap: "wrap" }}>
        <span><span style={{ color: "#ef4444" }}>—</span> &lt;4.5 HIGH risk</span>
        <span><span style={{ color: "#f59e0b" }}>—</span> 4.5–6.0 ELEVATED</span>
        <span><span style={{ color: "#22c55e" }}>—</span> &gt;6.0 NORMAL</span>
        {latest && (
          <span style={{ marginLeft: "auto", color: regimeColor(latest.regime), fontWeight: 600 }}>
            Now: {latest.avgEntropy.toFixed(1)} ({latest.regime})
          </span>
        )}
        {earliest && history.length > 1 && (
          <span style={{ color: "var(--text2)" }}>
            {formatDate(earliest.date)} → {formatDate(latest.date)}
          </span>
        )}
      </div>
    </div>
  );
}
