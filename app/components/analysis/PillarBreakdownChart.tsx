"use client";

import {
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { ScoreDelta } from "@/lib/scoring/engine";

interface Props {
  deltas: ScoreDelta[];
  base: number;
  pillarColor: string;
  finalScore: number;
}

interface WaterfallEntry {
  label: string;
  invisible: number;
  value: number;
  type: "base" | "positive" | "negative" | "final";
}

function buildWaterfallData(base: number, deltas: ScoreDelta[], finalScore: number): WaterfallEntry[] {
  const data: WaterfallEntry[] = [];
  let running = 0;

  // Base bar
  data.push({ label: "Base", invisible: 0, value: base, type: "base" });
  running = base;

  // Only show deltas with meaningful magnitude, sorted by absolute impact
  const significant = [...deltas]
    .filter(d => Math.abs(d.delta) >= 0.05)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10);

  // Restore original order after sorting (so waterfall reads left-to-right in original evaluation order)
  const ordered = deltas.filter(d => significant.some(s => s.label === d.label && s.delta === d.delta));

  for (const delta of ordered) {
    if (delta.delta > 0) {
      data.push({ label: delta.label, invisible: running, value: delta.delta, type: "positive" });
    } else {
      const newRunning = running + delta.delta;
      data.push({ label: delta.label, invisible: Math.max(0, newRunning), value: Math.abs(delta.delta), type: "negative" });
    }
    running = Math.min(10, Math.max(0, running + delta.delta));
  }

  // Final score bar
  data.push({ label: "Score", invisible: 0, value: finalScore, type: "final" });

  return data;
}

export function PillarBreakdownChart({ deltas, base, pillarColor, finalScore }: Props) {
  const data = buildWaterfallData(base, deltas, finalScore);
  const height = Math.max(180, data.length * 26 + 40);

  const cellColor = (entry: WaterfallEntry) => {
    if (entry.type === "base" || entry.type === "final") return pillarColor;
    if (entry.type === "positive") return "#4cbb8a";
    return "#e05252";
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Signal breakdown
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 44, bottom: 4, left: 108 }}
          barSize={10}
        >
          <XAxis
            type="number"
            domain={[0, 10]}
            tickCount={6}
            tick={{ fontSize: 10, fill: "var(--text3)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={104}
            tick={{ fontSize: 10, fill: "var(--text2)" }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={base} stroke="var(--text3)" strokeDasharray="4 2" strokeWidth={1} />
          <Bar dataKey="invisible" stackId="wf" fill="transparent" legendType="none" />
          <Bar dataKey="value" stackId="wf" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={cellColor(entry)} opacity={entry.type === "final" ? 1 : 0.85} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: number, _: unknown, index: number) => {
                const entry = data[index];
                if (!entry) return "";
                if (entry.type === "base" || entry.type === "final") return v.toFixed(1);
                const raw = entry.type === "negative" ? -v : v;
                return (raw > 0 ? "+" : "") + raw.toFixed(2);
              }}
              style={{ fontSize: 10, fill: "var(--text3)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 10, color: "var(--text3)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#4cbb8a", display: "inline-block" }} />
          Positive signal
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#e05252", display: "inline-block" }} />
          Negative signal
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: pillarColor, display: "inline-block" }} />
          Base / final
        </span>
      </div>
    </div>
  );
}
