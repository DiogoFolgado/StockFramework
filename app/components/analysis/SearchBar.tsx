"use client";

import { useState, useRef, useEffect } from "react";

interface SearchResult {
  ticker:   string;
  name:     string;
  exchange: string;
  type:     string;
}

interface SearchBarProps {
  onAnalyse: (ticker: string) => void;
  disabled?: boolean;
}

export function SearchBar({ onAnalyse, disabled }: SearchBarProps) {
  const [query,       setQuery]       = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [showDrop,    setShowDrop]    = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const timer                         = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query || query.length < 1) { setSuggestions([]); setShowDrop(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const { results } = await res.json();
        setSuggestions(results ?? []);
        setHighlighted(-1);
        setShowDrop(true);
      } catch { setSuggestions([]); }
    }, 280);
  }, [query]);

  function submit(overrideTicker?: string) {
    const ticker = overrideTicker ?? selected ?? query.toUpperCase();
    if (ticker) { onAnalyse(ticker); setQuery(""); setSelected(null); setSuggestions([]); setShowDrop(false); setHighlighted(-1); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDrop || suggestions.length === 0) {
      if (e.key === "Enter") submit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0) {
        const s = suggestions[highlighted];
        setQuery(s.name);
        setSelected(s.ticker);
        setSuggestions([]);
        setShowDrop(false);
        submit(s.ticker);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setShowDrop(false);
      setHighlighted(-1);
    }
  }

  function pickSuggestion(s: SearchResult) {
    setQuery(s.name);
    setSelected(s.ticker);
    setSuggestions([]);
    setShowDrop(false);
    setHighlighted(-1);
    submit(s.ticker);
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
        STOCK ANALYSIS
      </div>
      <div style={{ position: "relative", maxWidth: 480 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            placeholder="Ticker or company name…"
            disabled={disabled}
            style={{
              flex: 1, background: "var(--bg2)", border: "1px solid var(--border2)",
              borderRadius: "var(--radius)", color: "var(--text)", padding: "10px 14px",
              fontSize: 15, fontFamily: "'Space Mono', monospace", outline: "none",
            }}
          />
          <button
            onClick={() => submit()}
            disabled={disabled}
            style={{
              background: "var(--gold)", color: "#000", border: "none",
              borderRadius: "var(--radius)", padding: "10px 20px",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Analyse
          </button>
        </div>

        {showDrop && suggestions.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
            background: "var(--bg3)", border: "1px solid var(--border2)",
            borderRadius: "var(--radius)", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}>
            {suggestions.map((s, i) => (
              <div
                key={s.ticker}
                onMouseDown={() => pickSuggestion(s)}
                onMouseEnter={() => setHighlighted(i)}
                onMouseLeave={() => setHighlighted(-1)}
                style={{
                  padding: "9px 14px", cursor: "pointer", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                  background: highlighted === i ? "var(--bg4)" : "transparent",
                  transition: "background 80ms",
                }}
              >
                <div>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>{s.ticker}</span>
                  <span style={{ marginLeft: 10, color: "var(--text2)", fontSize: 12 }}>{s.name}</span>
                </div>
                <span style={{ color: "var(--text3)", fontSize: 11 }}>{s.exchange}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
