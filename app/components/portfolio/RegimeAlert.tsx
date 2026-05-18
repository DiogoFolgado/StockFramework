"use client";

import type { RegimeResult } from "@/app/api/portfolio/scores/route";

interface Props {
  regime: RegimeResult;
}

const CONFIG = {
  HIGH:     { bg: "rgba(239,68,68,0.12)",  border: "#ef4444", dot: "#ef4444",  label: "HIGH ENTROPY",     icon: "⚠",  action: "Tactical exits or hedges recommended. Review hotspot positions." },
  ELEVATED: { bg: "rgba(245,158,11,0.12)", border: "#f59e0b", dot: "#f59e0b",  label: "ELEVATED ENTROPY", icon: "⚡", action: "Monitor closely. Volatility above normal — consider partial hedges." },
  NORMAL:   { bg: "rgba(34,197,94,0.10)",  border: "#22c55e", dot: "#22c55e",  label: "NORMAL REGIME",    icon: "✓",  action: "Portfolio volatility is within expected range." },
};

export function RegimeAlert({ regime }: Props) {
  const cfg = CONFIG[regime.level];

  return (
    <div style={{
      background:   cfg.bg,
      border:       `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding:      "14px 18px",
      display:      "flex",
      alignItems:   "flex-start",
      gap:          14,
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{cfg.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{
            fontFamily:  "'Space Mono', monospace",
            fontSize:    11,
            letterSpacing: 2,
            color:       cfg.border,
            fontWeight:  700,
          }}>
            VOLATILITY REGIME — {cfg.label}
          </span>
          <span style={{
            background:  cfg.border,
            color:       "#000",
            fontSize:    11,
            fontWeight:  700,
            padding:     "1px 7px",
            borderRadius: 20,
          }}>
            avg entropy {regime.avgEntropy.toFixed(1)}/10
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text1)", marginBottom: regime.hotspots.length > 0 ? 8 : 0 }}>
          {cfg.action}
        </div>
        {regime.hotspots.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>Hotspots:</span>
            {regime.hotspots.map(t => (
              <span key={t} style={{
                background:  "rgba(239,68,68,0.15)",
                color:       "#ef4444",
                fontSize:    11,
                fontWeight:  600,
                padding:     "2px 8px",
                borderRadius: 4,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
