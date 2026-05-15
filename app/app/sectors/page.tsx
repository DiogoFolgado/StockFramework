"use client";

import { useState, useCallback, useRef } from "react";
import { SECTORS, RISING_SECTORS } from "@/lib/sectors/data";

type Tab = "daily" | "rising";

interface StockPerf {
  ticker: string;
  name: string;
  price: number;
  chgPct: number;
}

interface SectorPerf {
  stocks: StockPerf[];
  avg: number | null;
}

interface ScanResult {
  ticker: string;
  comp: number;
  signal: string;
  name: string;
  price: number;
  chgPct: number | null;
  pillars: { fundamental: number; technical: number; entropy: number; semantic: number };
  verdicts: { technical: string; semantic: string };
  metrics: { pe: number | null; beta: number | null; industry: string | null };
}

interface ScanState {
  running: boolean;
  checked: number;
  total: number;
  above7: ScanResult[];
  done: boolean;
}

function sigClass(sig: string) {
  if (sig.includes("STRONG BUY")) return "signal-sb";
  if (sig.includes("BUY")) return "signal-b";
  if (sig.includes("STRONG SELL")) return "signal-ss";
  if (sig.includes("SELL")) return "signal-s";
  return "signal-n";
}

function SectorDailyCard({ sector }: { sector: typeof SECTORS[0] }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SectorPerf | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const expand = useCallback(async () => {
    const next = !open;
    setOpen(next);
    if (!next || fetched.current) return;
    fetched.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sectors/performance?sectorId=${sector.id}`);
      if (!res.ok) throw new Error("Fetch failed");
      setData(await res.json());
    } catch {
      setError("Failed to load — market may be closed");
    } finally {
      setLoading(false);
    }
  }, [open, sector.id]);

  const maxAbs = data?.stocks.length
    ? Math.max(...data.stocks.map((s) => Math.abs(s.chgPct)), 0.01)
    : 1;

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
      marginBottom: 8, overflow: "hidden",
    }}>
      <div
        onClick={expand}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          cursor: "pointer", borderLeft: `3px solid ${sector.color}`,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, flexShrink: 0,
          background: `${sector.color}18`, border: `1px solid ${sector.color}33`,
        }}>
          {sector.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{sector.name}</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sector.desc}</div>
        </div>
        {data?.avg != null && (
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700,
            color: data.avg >= 0 ? "var(--green)" : "var(--red)", flexShrink: 0,
          }}>
            {data.avg >= 0 ? "+" : ""}{data.avg.toFixed(2)}%
          </div>
        )}
        <span style={{ color: "var(--text3)", fontSize: 12, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {loading && (
            <div style={{ padding: "16px", display: "flex", gap: 8, alignItems: "center", color: "var(--text3)", fontSize: 13 }}>
              <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>◌</span>
              Fetching live prices…
            </div>
          )}
          {error && (
            <div style={{ padding: 16, color: "var(--red)", fontSize: 13 }}>{error}</div>
          )}
          {data && (
            <div>
              {data.stocks.map((stock, i) => {
                const isPos = stock.chgPct >= 0;
                const barW = Math.max(1, Math.round((Math.abs(stock.chgPct) / maxAbs) * 60));
                const halfW = 64;
                const barLeft = isPos ? halfW : halfW - barW;
                return (
                  <div key={stock.ticker} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border3)",
                    fontSize: 13,
                  }}>
                    <div style={{
                      width: 20, textAlign: "center", fontFamily: "'Space Mono', monospace",
                      fontSize: 10, color: i === 0 ? "var(--green)" : i === data.stocks.length - 1 ? "var(--red)" : "var(--text3)",
                    }}>
                      {i + 1}
                    </div>
                    <div style={{
                      width: 54, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                      color: i === 0 ? sector.color : "var(--text)", flexShrink: 0,
                    }}>
                      {stock.ticker}
                    </div>
                    <div style={{ flex: 1, color: "var(--text2)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {stock.name}
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "var(--text)", flexShrink: 0, minWidth: 64, textAlign: "right" }}>
                      ${stock.price.toFixed(2)}
                    </div>
                    <div style={{ position: "relative", width: halfW * 2, height: 6, flexShrink: 0 }}>
                      <div style={{
                        position: "absolute", top: 2, height: 2, width: 1,
                        background: "var(--border)", left: halfW,
                      }} />
                      <div style={{
                        position: "absolute", top: 0, height: 6, borderRadius: 3,
                        width: barW, left: barLeft,
                        background: isPos ? "var(--green)" : "var(--red)", opacity: 0.85,
                      }} />
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
                      color: isPos ? "var(--green)" : "var(--red)", flexShrink: 0, minWidth: 58, textAlign: "right",
                    }}>
                      {isPos ? "+" : ""}{stock.chgPct.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectorRisingCard({ sector }: { sector: typeof RISING_SECTORS[0] }) {
  const [scan, setScan] = useState<ScanState | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startScan = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const state: ScanState = { running: true, checked: 0, total: 60, above7: [], done: false };
    setScan({ ...state });

    try {
      const res = await fetch(`/api/sectors/scan?sectorId=${sector.id}`, { signal: ac.signal });
      if (!res.ok || !res.body) { setScan((s) => s ? { ...s, running: false, done: true } : s); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const dataLine = line.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          try {
            const ev = JSON.parse(dataLine.slice(6));
            if (ev.type === "start") {
              setScan((s) => s ? { ...s, total: ev.total } : s);
            } else if (ev.type === "tick") {
              if (!ev.skipped && ev.comp >= 7.0) {
                setScan((s) => {
                  if (!s) return s;
                  const exists = s.above7.some((r) => r.ticker === ev.ticker);
                  if (exists) return { ...s, checked: ev.checked };
                  const updated = [...s.above7, ev as ScanResult].sort((a, b) => b.comp - a.comp);
                  return { ...s, checked: ev.checked, above7: updated };
                });
              } else {
                setScan((s) => s ? { ...s, checked: ev.checked } : s);
              }
            } else if (ev.type === "done") {
              setScan((s) => s ? { ...s, running: false, done: true } : s);
            }
          } catch { /* malformed SSE line */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setScan((s) => s ? { ...s, running: false, done: true } : s);
      }
    }
  }, [sector.id]);

  const stopScan = useCallback(() => {
    abortRef.current?.abort();
    setScan((s) => s ? { ...s, running: false, done: true } : s);
  }, []);

  const scoreColor = (c: number) =>
    c >= 8.5 ? "var(--green)" : c >= 8.0 ? "#a8d84e" : c >= 7.5 ? "var(--gold)" : "var(--text2)";

  return (
    <div style={{
      background: "var(--bg2)", border: `1px solid var(--border)`,
      borderLeft: `3px solid ${sector.color}`,
      borderRadius: "var(--radius)", marginBottom: 8, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, flexShrink: 0,
          background: `${sector.color}18`, border: `1px solid ${sector.color}33`,
        }}>
          {sector.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{sector.name}</div>
          {scan && !scan.done && scan.running ? (
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
              {scan.checked} / {scan.total} checked · {scan.above7.length} scoring ≥ 7.0
            </div>
          ) : scan?.done ? (
            <div style={{ fontSize: 11, marginTop: 2, color: scan.above7.length > 0 ? "var(--green)" : "var(--text3)" }}>
              {scan.above7.length > 0 ? `✓ ${scan.above7.length} found ≥ 7.0` : "None scored ≥ 7.0"}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
              {sector.candidates.length} candidates · scores ≥ 7.0 surfaced
            </div>
          )}
        </div>
        {scan?.running ? (
          <button onClick={stopScan} style={{
            padding: "6px 14px", borderRadius: 6, border: "1px solid var(--red)",
            background: "transparent", color: "var(--red)", fontSize: 12, cursor: "pointer",
          }}>Stop</button>
        ) : (
          <button onClick={startScan} style={{
            padding: "6px 14px", borderRadius: 6, border: `1px solid ${sector.color}`,
            background: "transparent", color: sector.color, fontSize: 12, cursor: "pointer",
          }}>
            {scan?.done ? "Re-scan" : "Scan"}
          </button>
        )}
      </div>

      {scan?.running && (
        <div style={{ padding: "0 16px 10px" }}>
          <div style={{ height: 3, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, background: sector.color, transition: "width 0.3s",
              width: `${Math.round((scan.checked / scan.total) * 100)}%`,
            }} />
          </div>
        </div>
      )}

      {scan && scan.above7.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <div style={{
            padding: "8px 16px", display: "flex", justifyContent: "space-between",
            fontSize: 10, fontFamily: "'Space Mono', monospace", color: "var(--text3)",
            borderBottom: "1px solid var(--border3)",
          }}>
            <span>{scan.above7.length} results ≥ 7.0</span>
            <span>top {Math.min(scan.above7.length, 10)} shown</span>
          </div>
          {scan.above7.slice(0, 10).map((r) => (
            <div key={r.ticker} style={{
              padding: "12px 16px", borderTop: "1px solid var(--border3)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: sector.color }}>
                      {r.ticker}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>{r.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span className={`signal-badge ${sigClass(r.signal)}`} style={{ fontSize: 10 }}>{r.signal}</span>
                    {r.chgPct != null && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
                        color: r.chgPct >= 0 ? "var(--green)" : "var(--red)",
                      }}>
                        {r.chgPct >= 0 ? "+" : ""}{r.chgPct.toFixed(2)}% today
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: scoreColor(r.comp) }}>
                    {r.comp.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>/ 10.0</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {[
                  { label: "FND", val: r.pillars.fundamental, color: "#d4a843" },
                  { label: "TEC", val: r.pillars.technical, color: "#4d9de0" },
                  { label: "ENT", val: r.pillars.entropy, color: "#9b72cf" },
                  { label: "SEM", val: r.pillars.semantic, color: "#4cbb8a" },
                ].map((p) => (
                  <span key={p.label} style={{
                    padding: "2px 8px", borderRadius: 4,
                    border: `1px solid ${p.color}30`,
                    color: p.color, fontSize: 11,
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {p.label} {p.val.toFixed(1)}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                {r.price > 0 && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>PRICE</div>
                    <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>${r.price.toFixed(2)}</div>
                  </div>
                )}
                {r.metrics.pe != null && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>P/E</div>
                    <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{r.metrics.pe.toFixed(1)}x</div>
                  </div>
                )}
                {r.metrics.beta != null && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>BETA</div>
                    <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{r.metrics.beta.toFixed(2)}</div>
                  </div>
                )}
                {r.metrics.industry && (
                  <div>
                    <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>INDUSTRY</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{r.metrics.industry}</div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11.5, color: "var(--text2)", lineHeight: 1.6 }}>
                {r.verdicts.semantic} · {r.verdicts.technical}
              </div>
            </div>
          ))}
        </div>
      )}

      {scan?.done && scan.above7.length === 0 && (
        <div style={{
          borderTop: "1px solid var(--border)", padding: "20px 16px",
          textAlign: "center", color: "var(--text3)", fontSize: 13,
        }}>
          No stocks scored 7.0 or above in this scan.
          <div style={{ fontSize: 11, marginTop: 4 }}>Try again during market hours for fresh data.</div>
        </div>
      )}
    </div>
  );
}

export default function SectorsPage() {
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <div>
      <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>
        SECTOR OVERVIEW
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["daily", "rising"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              border: tab === t ? "1px solid var(--gold)" : "1px solid var(--border)",
              background: tab === t ? "var(--gold)18" : "var(--bg2)",
              color: tab === t ? "var(--gold)" : "var(--text2)",
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t === "daily" ? "📈 Daily Relative" : "⭐ Rising Stars"}
          </button>
        ))}
      </div>

      {tab === "daily" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            Click a sector to see live daily performance across its key stocks.
          </div>
          {SECTORS.map((sector) => (
            <SectorDailyCard key={sector.id} sector={sector} />
          ))}
        </div>
      )}

      {tab === "rising" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            Scan mid-cap candidates through the four-pillar engine. Results show stocks scoring ≥ 7.0 — run during market hours for best results.
          </div>
          {RISING_SECTORS.map((sector) => (
            <SectorRisingCard key={sector.id} sector={sector} />
          ))}
        </div>
      )}
    </div>
  );
}
