"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id:       number;
  headline: string;
  source:   string;
  url:      string;
  datetime: number;
  summary:  string;
  image:    string;
}

interface IPOItem {
  date:   string;
  name:   string;
  symbol: string;
  price:  string;
  status: string;
}

interface EarningsItem {
  date:            string;
  symbol:          string;
  hour:            string;
  epsEstimate?:    number;
  revenueEstimate?: number;
}

const TABS = ["Market News", "IPO Calendar", "Earnings"] as const;
type Tab = typeof TABS[number];

function newsAge(ts: number): string {
  const diff = Date.now() - ts * 1000;
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(str: string): string {
  const days = Math.ceil((new Date(str).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 7)  return `${days}d — soon`;
  if (days <= 30) return `${days}d`;
  return str;
}

export default function NewsPage() {
  const [tab, setTab]     = useState<Tab>("Market News");
  const [news, setNews]   = useState<NewsItem[]>([]);
  const [ipos, setIpos]   = useState<IPOItem[]>([]);
  const [earn, setEarn]   = useState<EarningsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNews() {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/proxy/finnhub?path=/news?category=general%26minId=0");
      const data = await res.json();
      setNews(Array.isArray(data) ? data.slice(0, 30) : []);
    } catch { setError("Failed to load news"); }
    finally { setLoading(false); }
  }

  async function loadIPO() {
    setLoading(true); setError(null);
    try {
      const from = new Date().toISOString().split("T")[0];
      const to   = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res  = await fetch(`/api/proxy/finnhub?path=/calendar/ipo?from=${from}%26to=${to}`);
      const data = await res.json();
      setIpos(data.ipoCalendar ?? []);
    } catch { setError("Failed to load IPO calendar"); }
    finally { setLoading(false); }
  }

  async function loadEarnings() {
    setLoading(true); setError(null);
    try {
      const from = new Date().toISOString().split("T")[0];
      const to   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res  = await fetch(`/api/proxy/finnhub?path=/calendar/earnings?from=${from}%26to=${to}`);
      const data = await res.json();
      setEarn((data.earningsCalendar ?? []).slice(0, 60));
    } catch { setError("Failed to load earnings"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (tab === "Market News") loadNews();
    else if (tab === "IPO Calendar") loadIPO();
    else loadEarnings();
  }, [tab]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
          MARKET INTELLIGENCE
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              background:   tab === t ? "var(--bg4)" : "transparent",
              color:        tab === t ? "var(--gold)" : "var(--text2)",
              border:       `1px solid ${tab === t ? "var(--border2)" : "transparent"}`,
              borderRadius: "var(--radius)", padding: "6px 16px", fontSize: 13, cursor: "pointer",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading…</div>}
      {error   && <div style={{ color: "var(--red)", padding: 20 }}>⚠ {error}</div>}

      {!loading && !error && tab === "Market News" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {news.map((n) => (
            <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
              padding: "14px 18px", display: "flex", gap: 14, textDecoration: "none", color: "inherit",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              {n.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.image} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>{n.headline}</div>
                <div style={{ color: "var(--text2)", fontSize: 12, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {n.summary}
                </div>
                <div style={{ color: "var(--text3)", fontSize: 11, fontFamily: "'Space Mono', monospace" }}>
                  {n.source} · {newsAge(n.datetime)}
                </div>
              </div>
            </a>
          ))}
          {news.length === 0 && <div style={{ color: "var(--text3)", textAlign: "center", padding: 40 }}>No news available.</div>}
        </div>
      )}

      {!loading && !error && tab === "IPO Calendar" && (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Company", "Symbol", "Price", "Status"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", color: "var(--text3)",
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                  }}>{h}</th>
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
                      padding: "2px 9px", borderRadius: 5, fontSize: 11, fontFamily: "'Space Mono', monospace",
                      background: "var(--bg4)", color: "var(--text2)", border: "1px solid var(--border2)",
                    }}>{ipo.status}</span>
                  </td>
                </tr>
              ))}
              {ipos.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>No IPOs in the next 60 days.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === "Earnings" && (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Ticker", "Time", "EPS Est.", "Rev. Est."].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left", color: "var(--text3)",
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {earn.map((e, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13, color: "var(--gold)" }}>
                    {e.date}
                  </td>
                  <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", color: "var(--blue)", fontSize: 13 }}>
                    {e.symbol}
                  </td>
                  <td style={{ padding: "9px 14px", color: "var(--text3)", fontSize: 12 }}>
                    {e.hour === "bmo" ? "Before Open" : e.hour === "amc" ? "After Close" : e.hour}
                  </td>
                  <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                    {e.epsEstimate != null ? `$${e.epsEstimate.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "9px 14px", fontFamily: "'Space Mono', monospace", fontSize: 13 }}>
                    {e.revenueEstimate != null ? `$${(e.revenueEstimate / 1e9).toFixed(2)}B` : "—"}
                  </td>
                </tr>
              ))}
              {earn.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>No earnings in the next 30 days.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
