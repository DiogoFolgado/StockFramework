interface StockPerf {
  ticker:  string;
  name:    string;
  price:   number;
  chgPct:  number;
}

interface StockRowProps {
  stock:       StockPerf;
  index:       number;
  total:       number;
  maxAbs:      number;
  sectorColor: string;
}

export function StockRow({ stock, index, total, maxAbs, sectorColor }: StockRowProps) {
  const isPos  = stock.chgPct >= 0;
  const barW   = Math.max(1, Math.round((Math.abs(stock.chgPct) / maxAbs) * 60));
  const halfW  = 64;
  const barLeft = isPos ? halfW : halfW - barW;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 16px",
      borderTop: index === 0 ? "none" : "1px solid var(--border3)",
      fontSize: 13,
    }}>
      <div style={{
        width: 20, textAlign: "center",
        fontFamily: "'Space Mono', monospace", fontSize: 10,
        color: index === 0 ? "var(--green)" : index === total - 1 ? "var(--red)" : "var(--text3)",
      }}>
        {index + 1}
      </div>
      <div style={{
        width: 54, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
        color: index === 0 ? sectorColor : "var(--text)", flexShrink: 0,
      }}>
        {stock.ticker}
      </div>
      <div style={{ flex: 1, color: "var(--text2)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {stock.name}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "var(--text)", flexShrink: 0, minWidth: 64, textAlign: "right" }}>
        ${stock.price.toFixed(2)}
      </div>
      <div style={{ position: "relative", width: halfW * 2, height: 6, flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, height: 2, width: 1, background: "var(--border)", left: halfW }} />
        <div style={{
          position: "absolute", top: 0, height: 6, borderRadius: 3,
          width: barW, left: barLeft,
          background: isPos ? "var(--green)" : "var(--red)", opacity: 0.85,
        }} />
      </div>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
        color: isPos ? "var(--green)" : "var(--red)", flexShrink: 0, minWidth: 58, textAlign: "right",
      }}>
        {isPos ? "+" : ""}{stock.chgPct.toFixed(2)}%
      </div>
    </div>
  );
}
