export default function HowItWorksPage() {
  const pillars = [
    {
      icon: "◈", name: "Fundamental", weight: "30%", color: "#d4a843",
      desc: "Is the business healthy and growing? Looks at financials — P/E, revenue growth, gross margins, ROE — the same metrics a long-term investor studies before buying.",
      signals: ["P/E ratio — sector-adjusted bands", "PEG ratio (P/E ÷ EPS growth)", "Forward P/E vs trailing discount", "Revenue growth YoY", "Gross margin & ROE", "Debt/Equity, Current Ratio, FCF/share", "Dividend yield (sector-contextual)", "Absolute EPS profitability check"],
    },
    {
      icon: "◎", name: "Technical", weight: "35% — highest", color: "#4d9de0",
      desc: "What is the price doing right now? Reads price behaviour — 52-week range position, moving averages, MACD, Bollinger Bands, and sustained volume. Strongest short-to-medium-term predictor per research.",
      signals: ["52W range position & proximity to highs", "SMA50/200 cross with separation score", "MACD(12,26,9) trend confirmation", "Bollinger Bands — %B position and squeeze", "RSI momentum (50–75 range focus)", "Sustained 5-day volume vs 3M ADTV"],
    },
    {
      icon: "◉", name: "Entropy", weight: "10%", color: "#9b72cf",
      desc: "How unpredictable and risky is this stock? Measures disorder and volatility. Starts high and subtracts for risk signals. Detects when realised volatility diverges from beta.",
      signals: ["Beta (market sensitivity)", "52W range width", "Sector complexity", "Intraday price range", "Realised annualised volatility (50-day min)", "Beta vs realised vol divergence"],
    },
    {
      icon: "◐", name: "Semantic", weight: "25%", color: "#4cbb8a",
      desc: "What does Wall Street think? Captures analyst recommendations, consensus drift over 1–3 months, price targets, and sector narratives. Detects post-IPO lockup expiry windows.",
      signals: ["Analyst buy/hold/sell consensus", "1-month and 3-month consensus drift", "Price target vs current price", "Analyst conviction (low/high spread)", "Sector tailwinds/headwinds", "IPO age with lockup-expiry window"],
    },
  ];

  const signals = [
    { range: "8.5–10", name: "STRONG BUY",  desc: "All pillars firing. Highest conviction entry." },
    { range: "7.2–8.4", name: "BUY",         desc: "Strong evidence. Risk-reward skews positive." },
    { range: "5.5–7.1", name: "NEUTRAL",     desc: "Mixed signals. Wait for a clearer catalyst." },
    { range: "4.0–5.4", name: "SELL",         desc: "Weak evidence. Reduce or avoid." },
    { range: "0–3.9",   name: "STRONG SELL", desc: "Multiple pillars negative. High caution." },
  ];

  const sigColor: Record<string, string> = {
    "STRONG BUY": "#4cbb8a", "BUY": "#7de8b0", "NEUTRAL": "#d4a843",
    "SELL": "#e87d3e", "STRONG SELL": "#e85d5d",
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
          HOW IT WORKS
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>The Four-Pillar Framework</div>
        <div style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.7, maxWidth: 680 }}>
          A plain-English guide to how we score every stock — what each pillar measures, why it matters,
          and how the final signal is calculated. Composite = 30% Fundamental + 35% Technical + 10% Entropy + 25% Semantic.
        </div>
      </div>

      {/* Pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: 14, marginBottom: 36 }}>
        {pillars.map((pl) => (
          <div key={pl.name} style={{
            background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
            padding: 22, borderLeft: `3px solid ${pl.color}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 9, background: pl.color + "20",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{pl.icon}</div>
              <div>
                <div style={{ color: pl.color, fontWeight: 600, fontSize: 15 }}>
                  {pl.name}
                  <span style={{
                    marginLeft: 8, fontFamily: "'Space Mono', monospace", fontSize: 9,
                    padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border2)", color: "var(--text3)",
                  }}>{pl.weight}</span>
                </div>
              </div>
            </div>
            <div style={{ color: "var(--text2)", fontSize: 13, lineHeight: 1.75, marginBottom: 12 }}>{pl.desc}</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {pl.signals.map((s) => (
                <li key={s} style={{ fontSize: 12, color: "var(--text)", paddingLeft: 12, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: pl.color }}>·</span>{s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Signal thresholds */}
      <div style={{ marginBottom: 8, color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3 }}>
        SIGNAL THRESHOLDS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
        {signals.map((s) => {
          const c = sigColor[s.name];
          return (
            <div key={s.name} style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
              padding: "12px 18px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "var(--text3)", width: 60 }}>
                {s.range}
              </div>
              <div style={{
                padding: "3px 12px", borderRadius: 5, background: c + "22", color: c,
                fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
                border: `1px solid ${c}44`, width: 110, textAlign: "center",
              }}>{s.name}</div>
              <div style={{ color: "var(--text2)", fontSize: 13 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
