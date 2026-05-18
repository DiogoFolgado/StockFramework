"use client";

import { useState, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import { PILLARS, CRYPTO_PILLARS } from "@/lib/scoring/engine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PillarResult {
  score: number;
  verdict: string;
  insights: string[];
  deltas?: Array<{ label: string; delta: number }>;
}
interface AnalysisResult {
  ticker: string;
  companyName: string;
  sector: string;
  composite: number;
  signal: string;
  scores: Record<string, PillarResult>;
  isCrypto?: boolean;
  pillars?: typeof PILLARS | typeof CRYPTO_PILLARS;
  quote: { c?: number; pc?: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SIGNAL_COLORS: Record<string, string> = {
  "STRONG BUY":  "#4cbb8a",
  "BUY":         "#8fd46a",
  "NEUTRAL":     "#d4a843",
  "SELL":        "#e07c3c",
  "STRONG SELL": "#e05252",
};

const RADAR_COLORS = ["#4d9de0", "#d4a843"];

function sigBadgeStyle(sig: string) {
  const color = SIGNAL_COLORS[sig] ?? "var(--text)";
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    background: color + "22",
    border: `1px solid ${color}`,
    color,
  } as React.CSSProperties;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3 }}>
        <div style={{ height: 5, width: `${score * 10}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color, minWidth: 28, textAlign: "right" }}>{score.toFixed(1)}</span>
    </div>
  );
}

// ── Ticker Input ───────────────────────────────────────────────────────────────

function TickerInput({
  placeholder,
  color,
  onAnalyse,
  loading,
  result,
  error,
}: {
  placeholder: string;
  color: string;
  onAnalyse: (ticker: string) => void;
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}) {
  const [val, setVal] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim()) onAnalyse(val.trim().toUpperCase());
  };

  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value.toUpperCase())}
          placeholder={placeholder}
          style={{
            flex: 1, background: "var(--bg3)", border: `1px solid ${color}44`,
            borderRadius: "var(--radius)", color: "var(--text)", padding: "9px 14px",
            fontFamily: "'Space Mono', monospace", fontSize: 13, outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !val.trim()}
          style={{
            background: color, color: "#07070f", border: "none",
            borderRadius: "var(--radius)", padding: "9px 18px",
            fontFamily: "'Space Mono', monospace", fontSize: 12,
            fontWeight: 700, cursor: loading ? "wait" : "pointer",
            opacity: !val.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "…" : "Analyse"}
        </button>
      </form>
      {error && (
        <div style={{ fontSize: 12, color: "var(--red)", padding: "6px 10px", background: "var(--red)11", borderRadius: 4, marginBottom: 8 }}>
          {error}
        </div>
      )}
      {result && (
        <div style={{ background: "var(--bg2)", border: `1px solid ${color}44`, borderRadius: "var(--radius)", padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, color }}>{result.ticker}</span>
            <span style={sigBadgeStyle(result.signal)}>{result.signal}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 10 }}>{result.companyName} · {result.sector}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color, marginBottom: 12 }}>
            {result.composite.toFixed(1)}<span style={{ fontSize: 13, color: "var(--text3)" }}>/10</span>
          </div>
          {(result.pillars ?? PILLARS).map(pl => {
            const s = result.scores[pl.id];
            if (!s) return null;
            return (
              <div key={pl.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'Space Mono', monospace" }}>{pl.icon} {pl.label}</span>
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>{pl.wLabel}</span>
                </div>
                <ScoreBar score={s.score} color={pl.color} />
                <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{s.verdict}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  const [leftResult,  setLeftResult]  = useState<AnalysisResult | null>(null);
  const [rightResult, setRightResult] = useState<AnalysisResult | null>(null);
  const [leftLoading,  setLeftLoading]  = useState(false);
  const [rightLoading, setRightLoading] = useState(false);
  const [leftError,  setLeftError]  = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);

  const analyse = useCallback(async (
    ticker: string,
    setResult: (r: AnalysisResult | null) => void,
    setLoading: (v: boolean) => void,
    setError: (e: string | null) => void,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Build radar data from whichever pillars are available
  const radarData = (() => {
    if (!leftResult && !rightResult) return [];
    const pillars = (leftResult?.pillars ?? rightResult?.pillars ?? PILLARS) as typeof PILLARS;
    return pillars.map(pl => ({
      subject: pl.label,
      [leftResult?.ticker ?? "Left"]:  leftResult?.scores[pl.id]?.score  ?? 0,
      [rightResult?.ticker ?? "Right"]: rightResult?.scores[pl.id]?.score ?? 0,
    }));
  })();

  const bothLoaded = leftResult && rightResult;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 6 }}>
          ⇌ HEAD-TO-HEAD COMPARISON
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Compare Stocks Across All Four Pillars
        </h1>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 6 }}>
          Enter two tickers to see a side-by-side radar chart comparison using the proprietary scoring model.
        </p>
      </div>

      {/* Two inputs side-by-side */}
      <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
        <TickerInput
          placeholder="Ticker A (e.g. AAPL)"
          color={RADAR_COLORS[0]}
          onAnalyse={t => analyse(t, setLeftResult, setLeftLoading, setLeftError)}
          loading={leftLoading}
          result={leftResult}
          error={leftError}
        />
        <div style={{ display: "flex", alignItems: "center", fontSize: 20, color: "var(--text3)", paddingTop: leftResult ? 0 : 12 }}>⇌</div>
        <TickerInput
          placeholder="Ticker B (e.g. MSFT)"
          color={RADAR_COLORS[1]}
          onAnalyse={t => analyse(t, setRightResult, setRightLoading, setRightError)}
          loading={rightLoading}
          result={rightResult}
          error={rightError}
        />
      </div>

      {/* Radar chart — shown once at least one result exists */}
      {radarData.length > 0 && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px 20px", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 16 }}>
            ◎ FOUR-PILLAR RADAR
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "var(--text2)", fontFamily: "'Space Mono', monospace" }}
              />
              <PolarRadiusAxis
                angle={90} domain={[0, 10]} tick={{ fontSize: 9, fill: "var(--text3)" }}
                tickCount={6}
              />
              {leftResult && (
                <Radar
                  name={leftResult.ticker}
                  dataKey={leftResult.ticker}
                  stroke={RADAR_COLORS[0]}
                  fill={RADAR_COLORS[0]}
                  fillOpacity={0.20}
                  strokeWidth={2}
                />
              )}
              {rightResult && (
                <Radar
                  name={rightResult.ticker}
                  dataKey={rightResult.ticker}
                  stroke={RADAR_COLORS[1]}
                  fill={RADAR_COLORS[1]}
                  fillOpacity={0.20}
                  strokeWidth={2}
                />
              )}
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'Space Mono', monospace" }} />
              <Tooltip
                contentStyle={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                formatter={(v: number, name: string) => [`${v.toFixed(1)}/10`, name]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Head-to-head verdict */}
      {bothLoaded && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 14 }}>
            ◈ VERDICT
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
            {/* Left */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: RADAR_COLORS[0] }}>
                {leftResult.composite.toFixed(1)}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{leftResult.ticker}</div>
              <span style={sigBadgeStyle(leftResult.signal)}>{leftResult.signal}</span>
            </div>
            {/* VS */}
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: "var(--text3)", textAlign: "center" }}>vs</div>
            {/* Right */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: RADAR_COLORS[1] }}>
                {rightResult.composite.toFixed(1)}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{rightResult.ticker}</div>
              <span style={sigBadgeStyle(rightResult.signal)}>{rightResult.signal}</span>
            </div>
          </div>

          {/* Pillar-by-pillar comparison table */}
          <div style={{ marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--text3)", letterSpacing: 2, marginBottom: 12 }}>
              PILLAR BREAKDOWN
            </div>
            {(leftResult.pillars ?? PILLARS as unknown as typeof PILLARS).map((pl) => {
              const ls = leftResult.scores[pl.id];
              const rs = rightResult.scores[pl.id];
              if (!ls || !rs) return null;
              const winner = ls.score > rs.score ? "left" : rs.score > ls.score ? "right" : "tie";
              return (
                <div key={pl.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 8, marginBottom: 10, alignItems: "center" }}>
                  <div>
                    <ScoreBar score={ls.score} color={RADAR_COLORS[0]} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: pl.color, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{pl.icon} {pl.label}</div>
                    <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 2 }}>{pl.wLabel}</div>
                    {winner !== "tie" && (
                      <div style={{ fontSize: 10, color: winner === "left" ? RADAR_COLORS[0] : RADAR_COLORS[1], marginTop: 4 }}>
                        {winner === "left" ? "◀ wins" : "wins ▶"}
                      </div>
                    )}
                  </div>
                  <div>
                    <ScoreBar score={rs.score} color={RADAR_COLORS[1]} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composite delta */}
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14, textAlign: "center" }}>
            {(() => {
              const delta = leftResult.composite - rightResult.composite;
              const winner = delta > 0 ? leftResult.ticker : delta < 0 ? rightResult.ticker : null;
              const winnerColor = delta > 0 ? RADAR_COLORS[0] : RADAR_COLORS[1];
              if (!winner) return <span style={{ color: "var(--text3)", fontSize: 13 }}>Composite score tied</span>;
              return (
                <span style={{ fontSize: 13, color: winnerColor }}>
                  <strong>{winner}</strong> leads by{" "}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{Math.abs(delta).toFixed(2)}</span> points composite
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!leftResult && !rightResult && !leftLoading && !rightLoading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)", fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⇌</div>
          Enter two tickers above to compare them head-to-head across all four scoring pillars.
        </div>
      )}
    </div>
  );
}
