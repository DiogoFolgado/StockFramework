"use client";

import { useState } from "react";
import SectorsPage from "../sectors/page";
import ScoresPage from "../scores/page";

type Tab = "sectors" | "scores";

const TABS: { label: string; value: Tab }[] = [
  { label: "📈 Sectors",      value: "sectors" },
  { label: "◎ Score Rankings", value: "scores"  },
];

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>("sectors");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 48px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>
          MARKETS
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Market Analysis</h1>
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
      {tab === "sectors" && <SectorsPage />}
      {tab === "scores"  && <ScoresPage  />}
    </div>
  );
}
