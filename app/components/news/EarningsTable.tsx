interface EarningsItem {
  date:             string;
  symbol:           string;
  hour:             string;
  epsEstimate?:     number;
  revenueEstimate?: number;
}

function fmtHour(h: string): string {
  if (h === "bmo") return "Before Open";
  if (h === "amc") return "After Close";
  return h;
}

export function EarningsTable({ earnings }: { earnings: EarningsItem[] }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
            {["Date", "Ticker", "Time", "EPS Est.", "Rev. Est."].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text3)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {earnings.map((e, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--gold)" }}>{e.date}</td>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", color: "var(--blue)", fontSize: 13 }}>{e.symbol}</td>
              <td style={{ padding: "9px 14px", color: "var(--text3)", fontSize: 12 }}>{fmtHour(e.hour)}</td>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                {e.epsEstimate != null ? `$${e.epsEstimate.toFixed(2)}` : "—"}
              </td>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                {e.revenueEstimate != null ? `$${(e.revenueEstimate / 1e9).toFixed(2)}B` : "—"}
              </td>
            </tr>
          ))}
          {earnings.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>
                No earnings in the next 30 days.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
