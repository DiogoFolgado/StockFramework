"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SECTORS, RISING_SECTORS } from "@/lib/sectors/data";
import { StockRow }      from "@/components/sectors/StockRow";
import { ScanResultItem } from "@/components/sectors/ScanResultItem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Tab = "daily" | "rising";

interface StockPerf {
  ticker:  string;
  name:    string;
  price:   number;
  chgPct:  number;
}

interface SectorPerf {
  stocks: StockPerf[];
  avg:    number | null;
}

interface ScanResult {
  ticker:   string;
  comp:     number;
  signal:   string;
  name:     string;
  price:    number;
  chgPct:   number | null;
  pillars:  { fundamental: number; technical: number; entropy: number; semantic: number };
  verdicts: { technical: string; semantic: string };
  metrics:  { pe: number | null; beta: number | null; industry: string | null };
}

interface ScanState {
  running: boolean;
  checked: number;
  total:   number;
  above7:  ScanResult[];
  done:    boolean;
}

interface ScanCache {
  scannedAt: string;
  above7:    ScanResult[];
  checked:   number;
  total:     number;
}

const CACHE_KEY = (id: string) => `sf_rising_v1_${id}`;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadCache(sectorId: string): ScanCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(sectorId));
    if (!raw) return null;
    const c = JSON.parse(raw) as ScanCache;
    if (!c.scannedAt) return null;
    return c;
  } catch { return null; }
}

function saveCache(sectorId: string, cache: ScanCache) {
  try { localStorage.setItem(CACHE_KEY(sectorId), JSON.stringify(cache)); } catch { /* ignore quota */ }
}

function formatAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days  = Math.floor(ms / 86_400_000);
  if (mins  <  1) return "just now";
  if (hours <  1) return `${mins}m ago`;
  if (days  <  1) return `${hours}h ago`;
  if (days  === 1) return "yesterday";
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Sector Daily Card ─────────────────────────────────────────────────────────
function SectorDailyCard({ sector }: { sector: typeof SECTORS[0] }) {
  const [open, setOpen]       = useState(false);
  const [data, setData]       = useState<SectorPerf | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const fetched               = useRef(false);

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
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 8, overflow: "hidden" }}>
      <div
        onClick={expand}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", borderLeft: `3px solid ${sector.color}` }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, background: `${sector.color}18`, border: `1px solid ${sector.color}33` }}>
          {sector.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{sector.name}</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{sector.desc}</div>
        </div>
        {data?.avg != null && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: data.avg >= 0 ? "var(--green)" : "var(--red)", flexShrink: 0 }}>
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
          {error  && <div style={{ padding: 16, color: "var(--red)", fontSize: 13 }}>{error}</div>}
          {data   && data.stocks.map((stock, i) => (
            <StockRow key={stock.ticker} stock={stock} index={i} total={data.stocks.length} maxAbs={maxAbs} sectorColor={sector.color} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sector Rising Card ────────────────────────────────────────────────────────
function SectorRisingCard({ sector }: { sector: typeof RISING_SECTORS[0] }) {
  const [scan, setScan]           = useState<ScanState | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const cache = loadCache(sector.id);
    if (!cache) return;
    setLastScanned(cache.scannedAt);
    const age = Date.now() - new Date(cache.scannedAt).getTime();
    if (age < CACHE_TTL_MS) {
      setScan({ running: false, checked: cache.checked, total: cache.total, above7: cache.above7, done: true });
    }
  }, [sector.id]);

  const startScan = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setScan({ running: true, checked: 0, total: sector.candidates.length, above7: [], done: false });

    const collectedAbove7: ScanResult[] = [];
    let finalChecked = 0, finalTotal = sector.candidates.length;

    try {
      const res = await fetch(`/api/sectors/scan?sectorId=${sector.id}`, { signal: ac.signal });
      if (!res.ok || !res.body) { setScan((s) => s ? { ...s, running: false, done: true } : s); return; }

      const reader  = res.body.getReader();
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
              finalTotal = ev.total;
              setScan((s) => s ? { ...s, total: ev.total } : s);
            } else if (ev.type === "tick") {
              finalChecked = ev.checked;
              if (!ev.skipped && ev.comp >= 7.0) {
                setScan((s) => {
                  if (!s) return s;
                  const exists = s.above7.some((r) => r.ticker === ev.ticker);
                  if (exists) return { ...s, checked: ev.checked };
                  const updated = [...s.above7, ev as ScanResult].sort((a, b) => b.comp - a.comp);
                  collectedAbove7.length = 0;
                  collectedAbove7.push(...updated);
                  return { ...s, checked: ev.checked, above7: updated };
                });
              } else {
                setScan((s) => s ? { ...s, checked: ev.checked } : s);
              }
            } else if (ev.type === "done") {
              const now = new Date().toISOString();
              setLastScanned(now);
              saveCache(sector.id, { scannedAt: now, above7: collectedAbove7, checked: finalChecked, total: finalTotal });
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
  }, [sector.id, sector.candidates.length]);

  const stopScan = useCallback(() => {
    abortRef.current?.abort();
    setScan((s) => s ? { ...s, running: false, done: true } : s);
  }, []);

  const isCached = scan?.done && lastScanned && !scan.running;
  const cacheAge = lastScanned ? Date.now() - new Date(lastScanned).getTime() : Infinity;
  const isStale  = cacheAge >= CACHE_TTL_MS;

  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderLeft: `3px solid ${sector.color}`, borderRadius: "var(--radius)", marginBottom: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, background: `${sector.color}18`, border: `1px solid ${sector.color}33` }}>
          {sector.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{sector.name}</div>
          {scan && !scan.done && scan.running ? (
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, fontFamily: "'Space Mono', monospace" }}>
              {scan.checked} / {scan.total} checked · {scan.above7.length} scoring ≥ 7.0
            </div>
          ) : scan?.done ? (
            <div style={{ fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ color: scan.above7.length > 0 ? "var(--green)" : "var(--text3)" }}>
                {scan.above7.length > 0 ? `✓ ${scan.above7.length} found ≥ 7.0` : "None scored ≥ 7.0"}
              </span>
              {lastScanned && (
                <span style={{ color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 10 }}>
                  · last scan {formatAge(lastScanned)}
                  {isStale && <span style={{ color: "var(--red)", marginLeft: 4 }}>· stale</span>}
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
              {sector.candidates.length} candidates · scores ≥ 7.0 surfaced
              {lastScanned && (
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, marginLeft: 6 }}>
                  · last scan {formatAge(lastScanned)}
                  {isStale && <span style={{ color: "var(--red)", marginLeft: 4 }}>· stale</span>}
                </span>
              )}
            </div>
          )}
        </div>
        {scan?.running ? (
          <button onClick={stopScan} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--red)", background: "transparent", color: "var(--red)", fontSize: 12, cursor: "pointer" }}>
            Stop
          </button>
        ) : (
          <button onClick={startScan} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${sector.color}`, background: "transparent", color: sector.color, fontSize: 12, cursor: "pointer" }}>
            {scan?.done ? (isStale ? "Re-scan (stale)" : "Re-scan") : "Scan"}
          </button>
        )}
      </div>

      {/* Last-scanned timestamp bar */}
      {lastScanned && !scan?.running && (
        <div style={{ padding: "4px 16px 6px", borderTop: "1px solid var(--border)", background: "var(--bg3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 1 }}>
            LAST SCANNED
          </span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: isStale ? "var(--red)" : "var(--text2)" }}>
            {formatDate(lastScanned)} {isStale ? "· refresh recommended" : "· cached"}
          </span>
        </div>
      )}

      {scan?.running && (
        <div style={{ padding: "0 16px 10px" }}>
          <div style={{ height: 3, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: sector.color, transition: "width 0.3s", width: `${Math.round((scan.checked / scan.total) * 100)}%` }} />
          </div>
        </div>
      )}

      {scan && scan.above7.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <div style={{ padding: "8px 16px", display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "'Space Mono', monospace", color: "var(--text3)", borderBottom: "1px solid var(--border3)" }}>
            <span>{scan.above7.length} results ≥ 7.0</span>
            <span>top {Math.min(scan.above7.length, 10)} shown</span>
          </div>
          {scan.above7.slice(0, 10).map((r) => (
            <ScanResultItem key={r.ticker} result={r} sectorColor={sector.color} />
          ))}
        </div>
      )}

      {scan?.done && scan.above7.length === 0 && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "20px 16px", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>
          No stocks scored 7.0 or above in this scan.
          <div style={{ fontSize: 11, marginTop: 4 }}>Try again during market hours for fresh data.</div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { label: "📈 Daily Relative", value: "daily"  },
  { label: "⭐ Rising Stars",   value: "rising" },
];

export default function SectorsPage() {
  const [tab, setTab] = useState<Tab>("daily");

  return (
    <div>
      <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>
        SECTOR OVERVIEW
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value as Tab)}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
              border:      tab === t.value ? "1px solid var(--gold)"   : "1px solid var(--border)",
              background:  tab === t.value ? "var(--gold)18"           : "var(--bg2)",
              color:       tab === t.value ? "var(--gold)"             : "var(--text2)",
              fontWeight:  tab === t.value ? 600                       : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "daily" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            Click a sector to see live daily performance across its key stocks.
          </div>
          {SECTORS.map((sector) => <SectorDailyCard key={sector.id} sector={sector} />)}
        </div>
      )}

      {tab === "rising" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
            Scan candidates through the four-pillar engine. Results show stocks scoring ≥ 7.0 — cached for 7 days, re-scan anytime.
          </div>
          {RISING_SECTORS.map((sector) => <SectorRisingCard key={sector.id} sector={sector} />)}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
