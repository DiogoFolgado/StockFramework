"use client";

interface Position {
  id:             string;
  ticker:         string;
  companyName:    string;
  purchasePrice?: number;
  quantity?:      number;
  currency:       string;
}

interface PositionTableProps {
  positions: Position[];
  sectionId: string;
  onRemove:  (posId: string, secId: string) => void;
}

export function PositionTable({ positions, sectionId, onRemove }: PositionTableProps) {
  if (positions.length === 0) return null;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "var(--bg3)" }}>
          {["Ticker", "Company", "Price", "Qty", "Currency", ""].map((h) => (
            <th key={h} style={{ padding: "7px 14px", textAlign: "left", color: "var(--text3)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {positions.map((pos) => (
          <tr key={pos.id} style={{ borderTop: "1px solid var(--border)" }}>
            <td style={{ padding: "8px 14px", fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>{pos.ticker}</td>
            <td style={{ padding: "8px 14px", fontSize: 13 }}>{pos.companyName}</td>
            <td style={{ padding: "8px 14px", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
              {pos.purchasePrice != null ? `$${pos.purchasePrice.toFixed(2)}` : "—"}
            </td>
            <td style={{ padding: "8px 14px", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
              {pos.quantity ?? "—"}
            </td>
            <td style={{ padding: "8px 14px", color: "var(--text3)", fontSize: 12 }}>{pos.currency}</td>
            <td style={{ padding: "8px 14px" }}>
              <button
                onClick={() => onRemove(pos.id, sectionId)}
                style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 14, cursor: "pointer" }}
              >
                ✕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
