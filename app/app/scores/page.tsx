"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface HistoryRecord {
  id:          string;
  ticker:      string;
  companyName: string;
  score:       number;
  signal:      string;
  sector:      string;
  createdAt:   string;
}

function sigColor(signal: string) {
  if (signal === "STRONG BUY")  return "var(--green)";
  if (signal === "BUY")         return "#6fcf97";
  if (signal === "NEUTRAL")     return "var(--gold)";
  if (signal === "SELL")        return "#e8935d";
  if (signal === "STRONG SELL") return "var(--red)";
  return "var(--text3)";
}

function scoreBar(score: number) {
  const pct  = (score / 10) * 100;
  const color = score >= 7.2 ? "var(--green)" : score >= 5.5 ? "var(--gold)" : score >= 4.0 ? "#e8935d" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: "var(--bg4)", borderRadius: 2, overflow: "hidden", minWidth: 60 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width .3s" }} />
      </div>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color, minWidth: 28 }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function ScoresPage() {
  const [records,    setRecords]    = useState<HistoryRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [sector,     setSector]     = useState("ALL");
  const [minScore,   setMinScore]   = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all records (API already deduplicates by ticker + sorts by score desc)
      const res  = await fetch("/api/history?page=1&limit=2000");
      if (!res.ok) return;
      const data = await res.json();
      setRecords(data.records ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sectors = ["ALL", ...Array.from(new Set(records.map(r => r.sector).filter(Boolean))).sort()];

  const filtered = records
    .filter(r => sector === "ALL" || r.sector === sector)
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)", letterSpacing: 3, marginBottom: 6 }}>
          SCAN SCORES
        </div>
        <h1 style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, fontWeight: 700, margin: 0 }}>
          Stock Score Rankings
        </h1>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text3)", letterSpacing: 2, marginTop: 6 }}>
          LATEST SCORE PER STOCK · RANKED BY SCORE
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 5 }}>SECTOR</div>
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", color: "var(--text)", padding: "7px 12px", fontFamily: "'Space Mono',monospace", fontSize: 12, outline: "none", cursor: "pointer" }}
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 5 }}>
            MIN SCORE — {minScore.toFixed(1)}
          </div>
          <input
            type="range" min={0} max={9} step={0.5}
            value={minScore}
            onChange={e => setMinScore(parseFloat(e.target.value))}
            style={{ accentColor: "var(--gold)", cursor: "pointer", width: 140 }}
          />
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text3)" }}>
          {filtered.length} stock{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
          Loading scores…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
          No stocks match the current filters.
        </div>
      ) : (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2rem 1fr 1fr 1fr 180px 80px", gap: 0, borderBottom: "1px solid var(--border2)", padding: "8px 16px" }}>
            {["#", "TICKER", "COMPANY", "SECTOR", "SCORE", ""].map(h => (
              <div key={h} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2 }}>{h}</div>
            ))}
          </div>
          {filtered.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "grid", gridTemplateColumns: "2rem 1fr 1fr 1fr 180px 80px",
                gap: 0, padding: "11px 16px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background .1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)" }}>{i + 1}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{r.ticker}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{r.companyName || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{r.sector || "—"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {scoreBar(r.score)}
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: sigColor(r.signal), letterSpacing: 1 }}>{r.signal}</span>
              </div>
              <Link
                href={`/?ticker=${r.ticker}`}
                style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1,
                  color: "var(--gold)", border: "1px solid var(--gold)", borderRadius: 5,
                  padding: "4px 8px", textDecoration: "none", whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                ANALYSE →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
