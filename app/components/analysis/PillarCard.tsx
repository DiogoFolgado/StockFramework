import { PILLAR_COLORS } from "@/lib/utils/colors";

interface PillarResult {
  score:    number;
  insights: string[];
  verdict:  string;
}

interface Pillar {
  id:     string;
  icon:   string;
  label:  string;
  wLabel: string;
}

interface PillarCardProps {
  pillar: Pillar;
  result: PillarResult;
}

export function PillarCard({ pillar, result }: PillarCardProps) {
  const color = PILLAR_COLORS[pillar.id] ?? "var(--text)";
  const circ  = 2 * Math.PI * 20;

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="20" fill="none" stroke="#1a1a35" strokeWidth="4" />
          <circle
            cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(result.score / 10) * circ} ${circ}`}
            strokeLinecap="round" transform="rotate(-90 26 26)"
          />
          <text x="26" y="31" textAnchor="middle" fill={color}
            style={{ font: "700 11px 'Space Mono', monospace" }}>
            {result.score}
          </text>
        </svg>
        <div>
          <div style={{ color, fontWeight: 600, fontSize: 13 }}>{pillar.icon} {pillar.label}</div>
          <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 2 }}>WEIGHT {pillar.wLabel}</div>
        </div>
      </div>
      <div style={{ color: "var(--text2)", fontSize: 12, marginBottom: 8 }}>{result.verdict}</div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
        {result.insights.map((ins, i) => (
          <li key={i} style={{ fontSize: 12, color: "var(--text)", paddingLeft: 12, position: "relative", lineHeight: 1.5 }}>
            <span style={{ position: "absolute", left: 0, color }}>·</span>
            {ins}
          </li>
        ))}
      </ul>
    </div>
  );
}
