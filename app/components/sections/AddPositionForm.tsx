"use client";

import { useState, useRef, useEffect } from "react";

interface SearchResult {
  ticker:   string;
  name:     string;
  exchange: string;
}

interface AddPositionFormProps {
  sectionId: string;
  onAdded:   () => void;
  onCancel:  () => void;
}

export function AddPositionForm({ sectionId, onAdded, onCancel }: AddPositionFormProps) {
  const [tickerQuery,  setTickerQuery]  = useState("");
  const [suggestions,  setSuggestions]  = useState<SearchResult[]>([]);
  const [showDrop,     setShowDrop]     = useState(false);
  const [highlighted,  setHighlighted]  = useState(-1);
  const [selectedTick, setSelectedTick] = useState<string | null>(null);
  const [companyName,  setCompanyName]  = useState("");
  const [price,        setPrice]        = useState("");
  const [qty,          setQty]          = useState("");
  const [currency,     setCurrency]     = useState<"USD" | "EUR">("USD");
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!tickerQuery || tickerQuery.length < 1) { setSuggestions([]); setShowDrop(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(tickerQuery)}`);
        const { results } = await res.json();
        setSuggestions(results ?? []);
        setHighlighted(-1);
        setShowDrop(true);
      } catch { setSuggestions([]); }
    }, 280);
  }, [tickerQuery]);

  function pickSuggestion(s: SearchResult) {
    setSelectedTick(s.ticker);
    setTickerQuery(s.ticker);
    setCompanyName(s.name);
    setSuggestions([]);
    setShowDrop(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); pickSuggestion(suggestions[highlighted]); }
    else if (e.key === "Escape") { setShowDrop(false); setHighlighted(-1); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ticker = selectedTick ?? tickerQuery.toUpperCase().trim();
    if (!ticker) { setError("Enter a ticker or company name"); return; }
    setBusy(true); setError(null);
    try {
      const body: Record<string, unknown> = {
        sectionId,
        ticker,
        companyName: companyName || ticker,
        currency,
      };
      if (price && parseFloat(price) > 0)  body.purchasePrice = parseFloat(price);
      if (qty   && parseFloat(qty)   > 0)  body.quantity      = parseFloat(qty);

      const res = await fetch("/api/positions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to add"); return; }
      onAdded();
    } catch { setError("Network error"); }
    finally { setBusy(false); }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 6,
    color: "var(--text)", padding: "7px 10px", fontFamily: "'Space Mono',monospace",
    fontSize: 12, outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text3)",
    letterSpacing: 2, marginBottom: 4,
  };

  return (
    <form onSubmit={submit} style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", background: "var(--bg3)" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>

        {/* Ticker with autocomplete */}
        <div style={{ position: "relative", flex: "0 0 140px" }}>
          <div style={labelStyle}>TICKER</div>
          <input
            value={tickerQuery}
            onChange={e => { setTickerQuery(e.target.value); setSelectedTick(null); setCompanyName(""); }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            placeholder="AAPL / Apple…"
            style={{ ...inputStyle, width: "100%" }}
            autoComplete="off"
          />
          {showDrop && suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 2px)", left: 0, width: 280, zIndex: 300,
              background: "var(--bg2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius)", overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,.5)",
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={s.ticker}
                  onMouseDown={() => pickSuggestion(s)}
                  onMouseEnter={() => setHighlighted(i)}
                  onMouseLeave={() => setHighlighted(-1)}
                  style={{
                    padding: "8px 12px", cursor: "pointer", display: "flex",
                    justifyContent: "space-between", borderBottom: "1px solid var(--border)",
                    background: highlighted === i ? "var(--bg4)" : "transparent",
                    transition: "background 80ms",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--gold)", fontSize: 12 }}>{s.ticker}</span>
                    <span style={{ marginLeft: 8, color: "var(--text2)", fontSize: 11 }}>{s.name}</span>
                  </div>
                  <span style={{ color: "var(--text3)", fontSize: 10 }}>{s.exchange}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase price */}
        <div style={{ flex: "0 0 100px" }}>
          <div style={labelStyle}>BUY PRICE</div>
          <input
            type="number" min="0" step="0.01" value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="optional"
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>

        {/* Quantity */}
        <div style={{ flex: "0 0 80px" }}>
          <div style={labelStyle}>QTY</div>
          <input
            type="number" min="0" step="any" value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="optional"
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>

        {/* Currency */}
        <div style={{ flex: "0 0 80px" }}>
          <div style={labelStyle}>CURRENCY</div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as "USD" | "EUR")}
            style={{ ...inputStyle, width: "100%", cursor: "pointer" }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button type="submit" disabled={busy} style={{
            padding: "7px 14px", background: "var(--gold)", color: "#07070f", border: "none",
            borderRadius: 6, fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}>
            {busy ? "Adding…" : "Add"}
          </button>
          <button type="button" onClick={onCancel} style={{
            padding: "7px 10px", background: "none", border: "1px solid var(--border2)",
            borderRadius: 6, fontFamily: "'Space Mono',monospace", fontSize: 11,
            color: "var(--text3)", cursor: "pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>

      {error && <div style={{ marginTop: 8, color: "var(--red)", fontSize: 11, fontFamily: "'Space Mono',monospace" }}>{error}</div>}
    </form>
  );
}
