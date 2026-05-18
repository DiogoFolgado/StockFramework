"use client";

import { useState } from "react";
import SectionsPage            from "../sections/page";
import HistoryPage             from "../history/page";
import { RiskDashboard }       from "@/components/portfolio/RiskDashboard";
import { SuggestionsPanel }    from "@/components/portfolio/SuggestionsPanel";

type Tab = "sections" | "history" | "risk" | "suggestions";

const TABS: { label: string; value: Tab }[] = [
  { label: "▤ My Sections",   value: "sections"    },
  { label: "⏱ History",       value: "history"     },
  { label: "⚠ Risk Dashboard", value: "risk"       },
  { label: "✦ Suggestions",   value: "suggestions" },
];

export default function PortfolioPage() {
  const [tab, setTab] = useState<Tab>("sections");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px 48px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>
          PORTFOLIO
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Portfolio</h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            style={{
              padding:    "8px 18px",
              borderRadius: 8,
              fontSize:   13,
              cursor:     "pointer",
              border:     tab === t.value ? "1px solid var(--gold)"  : "1px solid var(--border)",
              background: tab === t.value ? "rgba(212,168,67,0.08)"  : "var(--bg2)",
              color:      tab === t.value ? "var(--gold)"            : "var(--text2)",
              fontWeight: tab === t.value ? 600                      : 400,
              transition: "all .15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "sections"    && <SectionsPage    />}
      {tab === "history"     && <HistoryPage     />}
      {tab === "risk"        && <RiskDashboard   />}
      {tab === "suggestions" && <SuggestionsPanel />}
    </div>
  );
}
