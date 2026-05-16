"use client";

import { useState, useEffect, useCallback } from "react";

interface Snapshot {
  date:         string;
  avgChangePct: number;
  pnlEur:       number;
}

interface SectionEntry {
  id:        string;
  name:      string;
  icon:      string;
  color:     string;
  snapshots: Snapshot[];
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
function fmtEur(n: number) {
  return `${n >= 0 ? "+" : ""}€${Math.abs(n).toFixed(2)}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function SectionHistoryCard({ sec }: { sec: SectionEntry }) {
  const cumPct  = sec.snapshots.reduce((s, r) => s + r.avgChangePct, 0);
  const cumEur  = sec.snapshots.reduce((s, r) => s + r.pnlEur, 0);
  const todayStr = today();

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 18px", borderBottom: "1px solid var(--border)",
        borderLeft: `4px solid ${sec.color}`,
      }}>
        <span style={{ fontSize: 20 }}>{sec.icon}</span>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{sec.name}</div>
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)",
          letterSpacing: 2, background: "var(--bg4)", padding: "3px 8px", borderRadius: 4,
        }}>
          {sec.snapshots.length} day{sec.snapshots.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ padding: "4px 0" }}>
        {sec.snapshots.map(snap => {
          const isToday = snap.date === todayStr;
          const pos     = snap.avgChangePct >= 0;
          return (
            <div
              key={snap.date}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 18px", borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)", minWidth: 82 }}>
                {snap.date}
              </span>
              {isToday && (
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--gold)",
                  border: "1px solid var(--gold)", borderRadius: 3, padding: "1px 5px", letterSpacing: 1,
                }}>
                  TODAY
                </span>
              )}
              <span style={{
                marginLeft: "auto", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700,
                color: pos ? "var(--green)" : "var(--red)",
              }}>
                {fmtPct(snap.avgChangePct)}
              </span>
              {snap.pnlEur !== 0 && (
                <span style={{
                  fontFamily: "'Space Mono',monospace", fontSize: 11,
                  color: snap.pnlEur >= 0 ? "var(--green)" : "var(--red)",
                  minWidth: 90, textAlign: "right",
                }}>
                  {fmtEur(snap.pnlEur)}
                </span>
              )}
            </div>
          );
        })}

        {/* Cumulative row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 18px", background: "var(--bg3)",
        }}>
          <span style={{
            fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)",
            letterSpacing: 2, minWidth: 82,
          }}>
            CUMULATIVE
          </span>
          <span style={{
            marginLeft: "auto", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700,
            color: cumPct >= 0 ? "var(--green)" : "var(--red)",
          }}>
            {fmtPct(cumPct)}
          </span>
          {cumEur !== 0 && (
            <span style={{
              fontFamily: "'Space Mono',monospace", fontSize: 11,
              color: cumEur >= 0 ? "var(--green)" : "var(--red)",
              minWidth: 90, textAlign: "right",
            }}>
              {fmtEur(cumEur)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CashHistoryCard({ cashEur, cashUsd }: { cashEur: number; cashUsd: number }) {
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 18px", borderBottom: "1px solid var(--border)",
        borderLeft: "4px solid var(--gold)",
      }}>
        <span style={{ fontSize: 20 }}>💰</span>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>Cash</div>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text3)" }}>
          balance
        </span>
      </div>
      <div style={{ padding: "12px 18px", display: "flex", gap: 24 }}>
        <div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 4 }}>USD</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700 }}>${cashUsd.toFixed(2)}</div>
        </div>
        {cashEur > 0 && (
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 4 }}>EUR</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700 }}>€{cashEur.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cashEur,  setCashEur]  = useState(0);
  const [cashUsd,  setCashUsd]  = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sections/history");
      const data = await res.json();
      setSections(data.sections ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sf_cash_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCashEur(parsed.eur ?? 0);
        setCashUsd(parsed.usd ?? 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>
            SECTION HISTORY
          </div>
          <div style={{ color: "var(--text3)", fontSize: 12 }}>
            Daily avg % change recorded for each of your sections. Cumulative is the simple sum of all recorded trading days.
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            background: "none", border: "1px solid var(--border2)", borderRadius: 6,
            color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 11,
            padding: "6px 14px", cursor: loading ? "not-allowed" : "pointer", flexShrink: 0, marginLeft: 16,
          }}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      <div style={{ height: 20 }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(cashUsd > 0 || cashEur > 0) && (
            <CashHistoryCard cashEur={cashEur} cashUsd={cashUsd} />
          )}

          {sections.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 12,
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            }}>
              No history yet — visit the Home tab to record today&apos;s data.
            </div>
          ) : (
            sections.map(sec => <SectionHistoryCard key={sec.id} sec={sec} />)
          )}
        </div>
      )}
    </div>
  );
}
