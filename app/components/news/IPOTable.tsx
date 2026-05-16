import { fmtDate } from "@/lib/utils/formatters";

interface IPOItem {
  date:   string;
  name:   string;
  symbol: string;
  price:  string;
  status: string;
}

export function IPOTable({ ipos }: { ipos: IPOItem[] }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
            {["Date", "Company", "Symbol", "Price", "Status"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--text3)", fontFamily: "'Space Mono', monospace", fontSize: 10 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ipos.map((ipo, i) => (
            <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--gold)" }}>
                {fmtDate(ipo.date)}
              </td>
              <td style={{ padding: "9px 14px", fontSize: 13 }}>{ipo.name}</td>
              <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", color: "var(--blue)", fontSize: 13 }}>
                {ipo.symbol}
              </td>
              <td style={{ padding: "9px 14px", fontSize: 13 }}>{ipo.price}</td>
              <td style={{ padding: "9px 14px" }}>
                <span style={{
                  padding: "2px 9px", borderRadius: 5, fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                  background: "var(--bg4)", color: "var(--text2)", border: "1px solid var(--border2)",
                }}>
                  {ipo.status}
                </span>
              </td>
            </tr>
          ))}
          {ipos.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>
                No IPOs in the next 60 days.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
