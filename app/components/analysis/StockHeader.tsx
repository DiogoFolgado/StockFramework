import { Badge } from "@/components/ui/Badge";

interface Quote {
  c?:  number;
  pc?: number;
}

interface StockHeaderProps {
  ticker:      string;
  companyName: string;
  sector:      string;
  signal:      string;
  quote:       Quote;
}

export function StockHeader({ ticker, companyName, sector, signal, quote }: StockHeaderProps) {
  const chg = quote.c && quote.pc ? (quote.c - quote.pc) / quote.pc : null;

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
      padding: "20px 24px", marginBottom: 16,
      display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
    }}>
      <div>
        <div style={{ fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 22, fontWeight: 700 }}>
          {ticker}
        </div>
        <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 2 }}>{companyName}</div>
        <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{sector}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
          ${quote.c?.toFixed(2) ?? "—"}
        </div>
        {chg != null && (
          <div style={{ color: chg >= 0 ? "var(--green)" : "var(--red)", fontSize: 14 }}>
            {chg >= 0 ? "▲ +" : "▼ "}{(chg * 100).toFixed(2)}% today
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <Badge signal={signal} />
        </div>
      </div>
    </div>
  );
}
