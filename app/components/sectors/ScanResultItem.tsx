import { Badge } from "@/components/ui/Badge";
import { scoreColor } from "@/lib/utils/colors";

interface ScanResult {
  ticker:   string;
  comp:     number;
  signal:   string;
  name:     string;
  price:    number;
  chgPct:   number | null;
  pillars:  { fundamental: number; technical: number; entropy: number; semantic: number };
  verdicts: { technical: string; semantic: string };
  metrics:  { pe: number | null; beta: number | null; industry: string | null };
}

interface ScanResultItemProps {
  result:      ScanResult;
  sectorColor: string;
}

const PILLAR_CHIPS = [
  { label: "FND", key: "fundamental" as const, color: "#d4a843" },
  { label: "TEC", key: "technical"   as const, color: "#4d9de0" },
  { label: "ENT", key: "entropy"     as const, color: "#9b72cf" },
  { label: "SEM", key: "semantic"    as const, color: "#4cbb8a" },
];

export function ScanResultItem({ result: r, sectorColor }: ScanResultItemProps) {
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border3)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: sectorColor }}>
              {r.ticker}
            </span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>{r.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Badge signal={r.signal} size="sm" />
            {r.chgPct != null && (
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700,
                color: r.chgPct >= 0 ? "var(--green)" : "var(--red)",
              }}>
                {r.chgPct >= 0 ? "+" : ""}{r.chgPct.toFixed(2)}% today
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: scoreColor(r.comp) }}>
            {r.comp.toFixed(1)}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)" }}>/ 10.0</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {PILLAR_CHIPS.map((p) => (
          <span key={p.label} style={{
            padding: "2px 8px", borderRadius: 4,
            border: `1px solid ${p.color}30`,
            color: p.color, fontSize: 11,
            fontFamily: "'Space Mono', monospace",
          }}>
            {p.label} {r.pillars[p.key].toFixed(1)}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        {r.price > 0 && (
          <Metric label="PRICE" value={`$${r.price.toFixed(2)}`} mono />
        )}
        {r.metrics.pe != null && (
          <Metric label="P/E" value={`${r.metrics.pe.toFixed(1)}x`} mono />
        )}
        {r.metrics.beta != null && (
          <Metric label="BETA" value={r.metrics.beta.toFixed(2)} mono />
        )}
        {r.metrics.industry && (
          <Metric label="INDUSTRY" value={r.metrics.industry} />
        )}
      </div>

      <div style={{ fontSize: 11.5, color: "var(--text2)", lineHeight: 1.6 }}>
        {r.verdicts.semantic} · {r.verdicts.technical}
      </div>
    </div>
  );
}

function Metric({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: mono ? 12 : 11, fontFamily: mono ? "'Space Mono', monospace" : undefined, color: mono ? undefined : "var(--text2)" }}>
        {value}
      </div>
    </div>
  );
}
