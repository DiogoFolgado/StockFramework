"use client";

import { Badge } from "@/components/ui/Badge";
import { SIGNAL_COLORS } from "@/lib/utils/colors";

interface HistoryRecord {
  id:          string;
  ticker:      string;
  companyName: string;
  score:       number;
  signal:      string;
  sector:      string;
  analyzedAt:  string;
}

export function HistoryTable({ records }: { records: HistoryRecord[] }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
            {["Ticker", "Company", "Score", "Signal", "Sector", "Date"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text3)", fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const c = SIGNAL_COLORS[r.signal] ?? "var(--text)";
            return (
              <tr
                key={r.id}
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg4)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>{r.ticker}</td>
                <td style={{ padding: "10px 14px", fontSize: 13 }}>{r.companyName}</td>
                <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", color: c, fontSize: 14, fontWeight: 700 }}>
                  {r.score.toFixed(1)}
                </td>
                <td style={{ padding: "10px 14px" }}><Badge signal={r.signal} /></td>
                <td style={{ padding: "10px 14px", color: "var(--text2)", fontSize: 12 }}>{r.sector}</td>
                <td style={{ padding: "10px 14px", color: "var(--text3)", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                  {new Date(r.analyzedAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
