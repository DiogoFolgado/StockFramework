"use client";

import { useState, useEffect, useCallback } from "react";

interface HistoryRecord {
  id:          string;
  ticker:      string;
  companyName: string;
  score:       number;
  signal:      string;
  sector:      string;
  analyzedAt:  string;
}

const SIG_COLOR: Record<string, string> = {
  "STRONG BUY":  "#4cbb8a",
  "BUY":         "#7de8b0",
  "NEUTRAL":     "#d4a843",
  "SELL":        "#e87d3e",
  "STRONG SELL": "#e85d5d",
};

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/history?page=${p}&limit=20`);
      const data = await res.json();
      setRecords(data.records ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>
          ANALYSIS HISTORY
        </div>
        <div style={{ color: "var(--text2)", fontSize: 14 }}>{total} analyses recorded</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading…</div>
      ) : records.length === 0 ? (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: 40, textAlign: "center", color: "var(--text3)",
        }}>
          No analyses yet. Run your first analysis on the Home tab.
        </div>
      ) : (
        <>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                  {["Ticker", "Company", "Score", "Signal", "Sector", "Date"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left", color: "var(--text3)",
                      fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const c = SIG_COLOR[r.signal] ?? "var(--text)";
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg4)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>
                        {r.ticker}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{r.companyName}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "'Space Mono', monospace", color: c, fontSize: 14, fontWeight: 700 }}>
                        {r.score.toFixed(1)}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 5, background: c + "22", color: c,
                          fontSize: 11, fontFamily: "'Space Mono', monospace", border: `1px solid ${c}44`,
                        }}>
                          {r.signal}
                        </span>
                      </td>
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

          {pages > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                style={{
                  background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)",
                  borderRadius: "var(--radius)", padding: "6px 14px", fontSize: 12, cursor: page <= 1 ? "not-allowed" : "pointer",
                }}>← Prev</button>
              <span style={{ padding: "6px 14px", color: "var(--text3)", fontSize: 12 }}>
                Page {page} of {pages}
              </span>
              <button onClick={() => load(page + 1)} disabled={page >= pages}
                style={{
                  background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text2)",
                  borderRadius: "var(--radius)", padding: "6px 14px", fontSize: 12, cursor: page >= pages ? "not-allowed" : "pointer",
                }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
