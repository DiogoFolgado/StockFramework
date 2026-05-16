"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";

interface Position {
  id:            string;
  ticker:        string;
  companyName:   string;
  purchasePrice?: number;
  quantity?:     number;
  currency:      string;
}

interface Section {
  id:        string;
  name:      string;
  icon:      string;
  color:     string;
  positions: Position[];
}

interface QuoteEntry {
  price:     number;
  prevClose: number;
  changePct: number;
  change:    number;
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function StatBox({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 20px", flex: "1 1 0", minWidth: 80 }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, color: color ?? "var(--text)" }}>{value}</div>
    </div>
  );
}

export default function SectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [section,   setSection]   = useState<Section | null>(null);
  const [quotes,    setQuotes]    = useState<Record<string, QuoteEntry>>({});
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const fetchQuotes = useCallback(async (positions: Position[]) => {
    if (positions.length === 0) return;
    const tickers = [...new Set(positions.map(p => p.ticker))].join(",");
    const res  = await fetch(`/api/portfolio/quotes?tickers=${tickers}`);
    const data = await res.json();
    setQuotes(data.quotes ?? {});
    setLastFetch(new Date());
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/sections/${id}`);
      if (!res.ok) { setError("Section not found"); return; }
      const data = await res.json();
      setSection(data.section);
      await fetchQuotes(data.section.positions);
    } catch { setError("Failed to load section"); }
    finally   { setLoading(false); }
  }, [id, fetchQuotes]);

  const refresh = useCallback(async () => {
    if (!section) return;
    await fetchQuotes(section.positions);
  }, [section, fetchQuotes]);

  useEffect(() => { load(); }, [load]);

  async function removePosition(posId: string) {
    await fetch(`/api/positions/${posId}`, { method: "DELETE" });
    setSection(prev => prev ? { ...prev, positions: prev.positions.filter(p => p.id !== posId) } : prev);
  }

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80, color: "var(--text2)", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
      Loading…
    </div>
  );
  if (error || !section) return (
    <div style={{ textAlign: "center", padding: 80, color: "var(--red)", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
      {error ?? "Section not found"}
    </div>
  );

  // Enrich positions with quotes, sort by changePct desc (gainers first)
  const enriched = section.positions
    .map(p => ({ ...p, q: quotes[p.ticker] ?? null }))
    .sort((a, b) => {
      const pa = a.q?.changePct ?? -Infinity;
      const pb = b.q?.changePct ?? -Infinity;
      return pb - pa;
    });

  const quoted     = enriched.filter(p => p.q);
  const gainers    = quoted.filter(p => (p.q?.changePct ?? 0) >= 0).length;
  const losers     = quoted.filter(p => (p.q?.changePct ?? 0) < 0).length;
  const avgChange  = quoted.length > 0 ? quoted.reduce((s, p) => s + (p.q?.changePct ?? 0), 0) / quoted.length : 0;
  const best       = quoted.reduce<typeof enriched[0] | null>((b, p) => !b || (p.q?.changePct ?? -Infinity) > (b.q?.changePct ?? -Infinity) ? p : b, null);
  const worst      = quoted.reduce<typeof enriched[0] | null>((w, p) => !w || (p.q?.changePct ?? Infinity) < (w.q?.changePct ?? Infinity) ? p : w, null);
  const maxAbs     = Math.max(...quoted.map(p => Math.abs(p.q?.changePct ?? 0)), 0.01);

  const timeStr = lastFetch
    ? lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: `${section.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
        }}>
          {section.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{section.name}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)" }}>
            {section.positions.length} stock{section.positions.length !== 1 ? "s" : ""} · {timeStr}
          </div>
        </div>
        <button
          onClick={refresh}
          style={{
            background: "none", border: "1px solid var(--border2)", borderRadius: 6,
            color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 11,
            padding: "6px 12px", cursor: "pointer",
          }}
        >
          ↺ Refresh
        </button>
        <Link
          href="/sections"
          style={{
            background: "none", border: "1px solid var(--border2)", borderRadius: 6,
            color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 11,
            padding: "6px 12px", textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </div>

      {/* Stats bar */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        display: "flex", flexWrap: "wrap", marginBottom: 16, overflow: "hidden",
      }}>
        <StatBox label="STOCKS" value={section.positions.length} />
        <div style={{ width: 1, background: "var(--border)" }} />
        <StatBox
          label="BEST TODAY"
          value={best ? `${best.ticker} ${fmtPct(best.q?.changePct ?? 0)}` : "—"}
          color="var(--green)"
        />
        <div style={{ width: 1, background: "var(--border)" }} />
        <StatBox
          label="WORST TODAY"
          value={worst ? `${worst.ticker} ${fmtPct(worst.q?.changePct ?? 0)}` : "—"}
          color="var(--red)"
        />
        <div style={{ width: 1, background: "var(--border)" }} />
        <StatBox
          label="AVG CHANGE"
          value={quoted.length > 0 ? fmtPct(avgChange) : "—"}
          color={avgChange >= 0 ? "var(--green)" : "var(--red)"}
        />
        <div style={{ width: 1, background: "var(--border)" }} />
        <StatBox label="GAINERS" value={gainers} color="var(--green)" />
        <div style={{ width: 1, background: "var(--border)" }} />
        <StatBox label="LOSERS" value={losers} color="var(--red)" />
      </div>

      {/* Ranked table */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        overflow: "hidden", marginBottom: 16,
      }}>
        <div style={{
          padding: "10px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2 }}>
            DAILY RELATIVE PERFORMANCE — RANKED
          </span>
        </div>

        {enriched.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>No positions in this section.</div>
        ) : (
          enriched.map((p, i) => {
            const pct     = p.q?.changePct ?? null;
            const barW    = pct !== null ? Math.abs(pct) / maxAbs * 100 : 0;
            const pos     = (pct ?? 0) >= 0;
            return (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 18px", borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)", width: 20, textAlign: "right", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: "var(--gold)", width: 56, flexShrink: 0 }}>
                  {p.ticker}
                </span>
                <span style={{ fontSize: 13, color: "var(--text2)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.companyName}
                </span>
                {p.q && (
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "var(--text)", width: 72, textAlign: "right", flexShrink: 0 }}>
                    ${p.q.price.toFixed(2)}
                  </span>
                )}
                {/* Bar */}
                <div style={{ width: 160, height: 6, background: "var(--bg4)", borderRadius: 3, flexShrink: 0, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${barW}%`,
                    background: pos ? "var(--green)" : "var(--red)",
                    transition: "width 400ms",
                  }} />
                </div>
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700,
                  color: pct === null ? "var(--text3)" : pos ? "var(--green)" : "var(--red)",
                  width: 68, textAlign: "right", flexShrink: 0,
                }}>
                  {pct !== null ? fmtPct(pct) : "—"}
                </span>
                <button
                  onClick={() => removePosition(p.id)}
                  title="Remove position"
                  style={{
                    background: "none", border: "1px solid var(--border2)", borderRadius: 4,
                    color: "var(--text3)", cursor: "pointer", padding: "3px 8px", fontSize: 12, flexShrink: 0,
                  }}
                >
                  −
                </button>
                <Link
                  href={`/?ticker=${p.ticker}`}
                  style={{
                    background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 4,
                    color: "var(--text2)", fontFamily: "'Space Mono',monospace", fontSize: 10,
                    padding: "4px 10px", textDecoration: "none", flexShrink: 0,
                    transition: "color 150ms, border-color 150ms",
                  }}
                >
                  Analyse →
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Visual comparison */}
      {quoted.length > 0 && (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2 }}>
              VISUAL COMPARISON — TODAY&apos;S % CHANGE
            </span>
          </div>
          <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {enriched.filter(p => p.q).map(p => {
              const pct  = p.q!.changePct;
              const barW = Math.abs(pct) / maxAbs * 70; // max 70% of container width
              const pos  = pct >= 0;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--gold)", width: 56, flexShrink: 0 }}>
                    {p.ticker}
                  </span>
                  <div style={{ flex: 1, height: 18, background: "var(--bg4)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      width: `${barW}%`, background: pos ? "var(--green)" : "var(--red)",
                      opacity: 0.7, borderRadius: 3, transition: "width 400ms",
                    }} />
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700,
                    color: pos ? "var(--green)" : "var(--red)", width: 68, textAlign: "right", flexShrink: 0,
                  }}>
                    {fmtPct(pct)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
