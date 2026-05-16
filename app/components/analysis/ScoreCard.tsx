import { signalColor } from "@/lib/utils/colors";

interface ScoreCardProps {
  score:  number;
  signal: string;
}

export function ScoreCard({ score, signal }: ScoreCardProps) {
  const color = signalColor(signal);

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
      padding: "18px 24px", marginBottom: 16,
      display: "flex", alignItems: "center", gap: 20,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'Space Mono', monospace", color }}>
          {score.toFixed(1)}
        </div>
        <div style={{ color: "var(--text3)", fontSize: 11 }}>/ 10.0</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${score * 10}%`,
            background: `linear-gradient(90deg, var(--blue), ${color})`,
            borderRadius: 4, transition: "width 1s ease",
          }} />
        </div>
        <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 6 }}>Composite Score (0–10)</div>
      </div>
    </div>
  );
}
