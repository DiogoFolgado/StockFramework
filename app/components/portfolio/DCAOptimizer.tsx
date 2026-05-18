"use client";

import { useState, useEffect, useCallback } from "react";
import type { DCAResponse, DCAPosition } from "@/app/api/portfolio/dca/route";

function fmt(n: number) {
  return n.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

function WeightBar({ current, target }: { current: number; target: number }) {
  const max = Math.max(target, current, 5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          left:     0,
          top:      0,
          height:   "100%",
          width:    `${Math.min((current / max) * 100, 100)}%`,
          background: "#f59e0b",
          borderRadius: 3,
          transition: "width 0.3s ease",
        }} />
        {target > 0 && (
          <div style={{
            position: "absolute",
            left:     `${Math.min((target / max) * 100, 100)}%`,
            top:      -1,
            height:   8,
            width:    2,
            background: "#22c55e",
          }} />
        )}
      </div>
      <span style={{ fontSize: 10, color: "var(--text2)", whiteSpace: "nowrap" }}>
        {current.toFixed(1)}% → {target > 0 ? `${target}%` : "exit"}
      </span>
    </div>
  );
}

function PositionCard({ pos }: { pos: DCAPosition }) {
  const isConsolidate = pos.action === "CONSOLIDATE";
  const accent = isConsolidate ? "#ef4444" : "#22c55e";
  const label  = isConsolidate ? "EXIT" : "DCA";

  return (
    <div style={{
      background:   "var(--bg1)",
      borderRadius: 8,
      border:       `1px solid ${isConsolidate ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.20)"}`,
      padding:      "12px 14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{pos.ticker}</span>
          <span style={{
            marginLeft:  8,
            fontSize:    10,
            fontWeight:  700,
            color:       accent,
            background:  `${accent}18`,
            border:      `1px solid ${accent}40`,
            borderRadius: 3,
            padding:     "1px 6px",
          }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 13, color: "var(--text2)" }}>
          €{fmt(pos.currentValueEur)}
        </span>
      </div>

      <WeightBar current={pos.currentWeightPct} target={pos.targetWeightPct} />

      {!isConsolidate && (
        <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 12 }}>
          <div>
            <span style={{ color: "var(--text2)" }}>Monthly buy </span>
            <span style={{ color: "#22c55e", fontWeight: 700 }}>€{fmt(pos.monthlyDcaEur)}</span>
          </div>
          <div>
            <span style={{ color: "var(--text2)" }}>Gap to fill </span>
            <span style={{ fontWeight: 600 }}>€{fmt(pos.gapEur)}</span>
          </div>
          <div>
            <span style={{ color: "var(--text2)" }}>Target </span>
            <span style={{ fontWeight: 600 }}>€{fmt(pos.targetValueEur)}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 6, fontSize: 12, color: "var(--text2)", lineHeight: 1.4 }}>
        {pos.reason}
      </div>
    </div>
  );
}

export function DCAOptimizer() {
  const [data,    setData]    = useState<DCAResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/dca");
      if (!res.ok) throw new Error("Failed");
      const body = await res.json() as DCAResponse;
      setData(body);
    } catch {
      setError("Failed to load DCA analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const nothingToShow = data && data.consolidate.length === 0 && data.scaleUp.length === 0;

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          DCA OPTIMIZER
        </span>
        {data && (
          <span style={{ fontSize: 12, color: "var(--text2)" }}>
            Portfolio: €{fmt(data.totalPortfolioEur)}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: "center", color: "var(--text2)", fontSize: 13 }}>Analysing positions…</div>
      )}

      {error && (
        <div style={{ padding: 16, color: "#ef4444", fontSize: 13 }}>
          {error}{" "}
          <button onClick={load} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
        </div>
      )}

      {nothingToShow && (
        <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
          All positions are well-sized. No DCA recommendations at this time.
        </div>
      )}

      {data && data.monthlyCashNeeded > 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "rgba(34,197,94,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text2)" }}>Total monthly cash to deploy</span>
          <span style={{ fontWeight: 700, color: "#22c55e", fontSize: 15 }}>€{fmt(data.monthlyCashNeeded)} / month</span>
        </div>
      )}

      {data && data.consolidate.length > 0 && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "#ef4444", marginBottom: 10 }}>
            CONSOLIDATE ({data.consolidate.length} position{data.consolidate.length > 1 ? "s" : ""} &lt;0.5%)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.consolidate.map(p => <PositionCard key={p.ticker} pos={p} />)}
          </div>
        </div>
      )}

      {data && data.scaleUp.length > 0 && (
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "#22c55e", marginBottom: 10 }}>
            SCALE UP VIA DCA ({data.scaleUp.length} micro-position{data.scaleUp.length > 1 ? "s" : ""} &lt;2%)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.scaleUp.map(p => <PositionCard key={p.ticker} pos={p} />)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--text2)" }}>
            Green bar = target weight (5%). Orange bar = current weight. DCA over 6 months to reduce timing risk.
          </div>
        </div>
      )}
    </div>
  );
}
