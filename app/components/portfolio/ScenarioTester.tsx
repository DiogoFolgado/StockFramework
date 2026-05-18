"use client";

import { useState } from "react";
import type { RebalanceResponse }  from "@/app/api/portfolio/rebalance/route";
import type { ScenarioResponse }   from "@/app/api/portfolio/scenario/route";

interface Props {
  rebalance: RebalanceResponse;
}

export function ScenarioTester({ rebalance }: Props) {
  const sectors = Object.keys(rebalance.sectors).sort();

  const [sector,   setSector]   = useState<string>(sectors[0] ?? "");
  const [shock,    setShock]    = useState<number>(-20);
  const [result,   setResult]   = useState<ScenarioResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function runScenario() {
    if (!sector) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/portfolio/scenario", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sector, shockPct: shock }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json() as ScenarioResponse;
      setResult(data);
    } catch {
      setError("Scenario calculation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const shockColor = shock < 0 ? "#ef4444" : "#22c55e";
  const fmt = (n: number) => n.toLocaleString("en-IE", { maximumFractionDigits: 0 });

  return (
    <div style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--gold)" }}>
          SCENARIO STRESS TESTER
        </span>
      </div>

      {/* Controls */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text2)", marginBottom: 5, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
            SECTOR
          </label>
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            style={{
              width:        "100%",
              background:   "var(--bg1)",
              border:       "1px solid var(--border)",
              borderRadius: 6,
              padding:      "7px 10px",
              fontSize:     13,
              color:        "var(--text1)",
              cursor:       "pointer",
            }}
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 11, color: "var(--text2)", marginBottom: 5, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
            SHOCK: <span style={{ color: shockColor, fontWeight: 700 }}>{shock > 0 ? "+" : ""}{shock}%</span>
          </label>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={shock}
            onChange={e => setShock(Number(e.target.value))}
            style={{ width: "100%", cursor: "pointer", accentColor: shockColor }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text2)", marginTop: 2 }}>
            <span>−50%</span>
            <span>0</span>
            <span>+50%</span>
          </div>
        </div>

        <button
          onClick={runScenario}
          disabled={loading || !sector}
          style={{
            padding:      "9px 20px",
            borderRadius: 6,
            border:       "none",
            background:   loading ? "var(--border)" : "var(--gold)",
            color:        loading ? "var(--text2)" : "#1a1a1a",
            fontSize:     13,
            fontWeight:   700,
            cursor:       loading ? "not-allowed" : "pointer",
            whiteSpace:   "nowrap",
          }}
        >
          {loading ? "Running…" : "Run Scenario"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", color: "#ef4444", fontSize: 13 }}>{error}</div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Summary card */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: shock < 0 ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text1)", marginBottom: 6 }}>
              If <span style={{ color: "var(--gold)" }}>{result.sector}</span> {shock < 0 ? "falls" : "rises"}{" "}
              <span style={{ color: shockColor, fontWeight: 700 }}>{Math.abs(shock)}%</span>:
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 2 }}>Portfolio Impact</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: shockColor }}>
                  {result.totalImpactEur < 0 ? "−" : "+"}€{fmt(Math.abs(result.totalImpactEur))}
                </div>
                <div style={{ fontSize: 12, color: shockColor }}>{result.totalImpactPct > 0 ? "+" : ""}{result.totalImpactPct}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 2 }}>New Portfolio Value</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text1)" }}>€{fmt(result.newPortfolioEur)}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>from €{fmt(result.totalPortfolioEur)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginBottom: 2 }}>Exposed Value</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text1)" }}>€{fmt(result.affectedValueEur)}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>
                  {result.totalPortfolioEur > 0
                    ? `${((result.affectedValueEur / result.totalPortfolioEur) * 100).toFixed(1)}% of portfolio`
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Per-position table */}
          <div style={{ padding: "10px 16px 14px", overflowX: "auto" }}>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, color: "var(--text2)", marginBottom: 8 }}>
              POSITION BREAKDOWN
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "var(--text2)", fontSize: 11 }}>
                  <th style={{ textAlign: "left",  padding: "4px 0 6px" }}>Ticker</th>
                  <th style={{ textAlign: "left",  padding: "4px 8px 6px" }}>Sector</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px" }}>Current (€)</th>
                  <th style={{ textAlign: "right", padding: "4px 8px 6px" }}>Impact (€)</th>
                  <th style={{ textAlign: "right", padding: "4px 0 6px" }}>New Value (€)</th>
                </tr>
              </thead>
              <tbody>
                {result.positions.map(p => (
                  <tr key={p.ticker} style={{
                    borderTop:  "1px solid var(--border)",
                    opacity:    p.affected ? 1 : 0.45,
                    background: p.affected ? "transparent" : undefined,
                  }}>
                    <td style={{ padding: "6px 0", fontWeight: 700 }}>
                      {p.ticker}
                      {p.affected && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: shockColor, fontWeight: 400 }}>affected</span>
                      )}
                    </td>
                    <td style={{ padding: "6px 8px", color: "var(--text2)", fontSize: 12 }}>{p.sector}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>€{fmt(p.valueEur)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: p.affected ? shockColor : "var(--text2)", fontWeight: p.affected ? 600 : 400 }}>
                      {p.affected ? (p.impactEur < 0 ? "−€" : "+€") + fmt(Math.abs(p.impactEur)) : "—"}
                    </td>
                    <td style={{ padding: "6px 0", textAlign: "right", fontWeight: p.affected ? 600 : 400 }}>€{fmt(p.newValueEur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!result && !loading && (
        <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
          Select a sector, set the shock magnitude, and run the scenario to see your portfolio impact.
        </div>
      )}
    </div>
  );
}
