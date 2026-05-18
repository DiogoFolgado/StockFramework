"use client";

import { useState, useEffect, useCallback } from "react";
import { RegimeAlert }       from "./RegimeAlert";
import { PillarScoreTable }  from "./PillarScoreTable";
import { RebalancePanel }    from "./RebalancePanel";
import { SentimentPanel }    from "./SentimentPanel";
import { FxHedgingPanel }    from "./FxHedgingPanel";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { EntropyChart }      from "./EntropyChart";
import { ScenarioTester }    from "./ScenarioTester";
import { DCAOptimizer }      from "./DCAOptimizer";

import type { ScoresResponse }           from "@/app/api/portfolio/scores/route";
import type { RebalanceResponse }        from "@/app/api/portfolio/rebalance/route";
import type { FxResponse }              from "@/app/api/portfolio/fx/route";
import type { CorrelationResponse }      from "@/app/api/portfolio/correlation/route";
import type { EntropyDataPoint }         from "@/app/api/portfolio/entropy/route";

interface SentimentEntry {
  score:           number;
  summary:         string;
  thesisShift:     boolean;
  newsSampleCount: number;
  analyzedAt:      string;
}

interface RiskData {
  scores:      ScoresResponse | null;
  rebalance:   RebalanceResponse | null;
  fx:          FxResponse | null;
  correlation: CorrelationResponse | null;
}

function Skeleton() {
  return (
    <div style={{
      background:   "var(--bg2)",
      borderRadius: 10,
      border:       "1px solid var(--border)",
      height:       120,
      marginBottom: 20,
      animation:    "pulse 1.5s ease-in-out infinite",
    }} />
  );
}

export function RiskDashboard() {
  const [data, setData]                   = useState<RiskData>({ scores: null, rebalance: null, fx: null, correlation: null });
  const [entropyHistory, setEntropyHistory] = useState<EntropyDataPoint[]>([]);
  const [sentiment, setSentiment]         = useState<Record<string, SentimentEntry>>({});
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [scoresRes, rebalanceRes, fxRes, correlationRes, entropyRes] = await Promise.allSettled([
        fetch("/api/portfolio/scores").then(r => r.ok ? r.json() : null),
        fetch("/api/portfolio/rebalance").then(r => r.ok ? r.json() : null),
        fetch("/api/portfolio/fx").then(r => r.ok ? r.json() : null),
        fetch("/api/portfolio/correlation").then(r => r.ok ? r.json() : null),
        fetch("/api/portfolio/entropy").then(r => r.ok ? r.json() : null),
      ]);

      const scores      = scoresRes.status      === "fulfilled" ? scoresRes.value      : null;
      const rebalance   = rebalanceRes.status   === "fulfilled" ? rebalanceRes.value   : null;
      const fx          = fxRes.status          === "fulfilled" ? fxRes.value          : null;
      const correlation = correlationRes.status === "fulfilled" ? correlationRes.value : null;
      const entropy     = entropyRes.status     === "fulfilled" ? entropyRes.value     : null;

      setData({ scores, rebalance, fx, correlation });
      if (entropy?.history) setEntropyHistory(entropy.history);

      // Persist today's entropy snapshot in the background
      if (scores?.regime) {
        fetch("/api/portfolio/entropy", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            avgEntropy: scores.regime.avgEntropy,
            regime:     scores.regime.level,
            hotspots:   scores.regime.hotspots,
          }),
        }).then(async r => {
          if (r.ok) {
            // Re-fetch updated history to include today
            const updated = await fetch("/api/portfolio/entropy").then(res => res.ok ? res.json() : null);
            if (updated?.history) setEntropyHistory(updated.history);
          }
        }).catch(() => { /* non-fatal */ });
      }
    } catch {
      setError("Failed to load risk data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSentiment = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/portfolio/sentiment", { method: "POST" });
      if (res.ok) {
        const body = await res.json() as { sentiment: Record<string, SentimentEntry> };
        setSentiment(body.sentiment ?? {});
      }
    } catch { /* non-fatal */ }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return (
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#ef4444", fontSize: 14 }}>
        {error}
        <button
          onClick={loadAll}
          style={{ marginLeft: 12, padding: "4px 12px", borderRadius: 6, border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 13 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const hasNoData = !data.scores && !data.rebalance && !data.fx && !data.correlation;
  if (hasNoData) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
        Add holdings to your portfolio sections to see risk intelligence.
      </div>
    );
  }

  const allTickers = data.scores ? Object.keys(data.scores.scores) : [];
  const correlationTickers = data.correlation?.tickers ?? [];
  const mergedTickers = [...new Set([...correlationTickers, ...allTickers])];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          {mergedTickers.length} holdings monitored
        </div>
        <button
          onClick={loadAll}
          style={{
            padding:      "6px 14px",
            borderRadius: 6,
            border:       "1px solid var(--border)",
            background:   "var(--bg2)",
            color:        "var(--text2)",
            fontSize:     12,
            cursor:       "pointer",
          }}
        >
          ↻ Refresh All
        </button>
      </div>

      {/* Volatility regime banner */}
      {data.scores?.regime && <RegimeAlert regime={data.scores.regime} />}

      {/* Entropy trend chart */}
      <EntropyChart history={entropyHistory} />

      {/* Four-pillar score table */}
      {data.scores && mergedTickers.length > 0 && (
        <PillarScoreTable scores={data.scores.scores} tickers={mergedTickers} />
      )}

      {/* Sector rebalance */}
      {data.rebalance && <RebalancePanel data={data.rebalance} />}

      {/* Scenario stress tester */}
      {data.rebalance && Object.keys(data.rebalance.sectors).length > 0 && (
        <ScenarioTester rebalance={data.rebalance} />
      )}

      {/* DCA optimizer */}
      <DCAOptimizer />

      {/* Semantic sentiment */}
      <SentimentPanel
        sentiment={sentiment}
        onRefresh={refreshSentiment}
        refreshing={refreshing}
      />

      {/* FX hedging */}
      {data.fx && <FxHedgingPanel data={data.fx} />}

      {/* Correlation heatmap */}
      {data.correlation && <CorrelationMatrix data={data.correlation} />}
    </div>
  );
}
