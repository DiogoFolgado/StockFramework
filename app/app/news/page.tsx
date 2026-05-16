"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TabNav }        from "@/components/ui/TabNav";
import { EmptyState }    from "@/components/ui/EmptyState";
import { NewsCard }      from "@/components/news/NewsCard";
import { IPOTable }      from "@/components/news/IPOTable";
import { EarningsTable } from "@/components/news/EarningsTable";

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
  date:             string;
  symbol:           string;
  hour:             string;
  epsEstimate?:     number;
  revenueEstimate?: number;
}

const TABS = [
  { label: "📰 Market News",  value: "news" },
  { label: "🚀 IPO Calendar", value: "ipo"  },
  { label: "📅 Earnings",     value: "earn" },
];

const CATEGORIES = [
  { value: "general", label: "General",  fetchCat: "general",  filter: null as RegExp | null },
  { value: "ai",      label: "AI",       fetchCat: "general",  filter: /\b(AI|artificial intelligence|machine learning|LLM|GPT|neural|OpenAI|Anthropic|deep learning|chatbot)\b/i as RegExp },
  { value: "crypto",  label: "Crypto",   fetchCat: "crypto",   filter: null as RegExp | null },
  { value: "space",   label: "Space",    fetchCat: "general",  filter: /\b(space|SpaceX|NASA|rocket|satellite|orbit|launch|asteroid|moon|Mars)\b/i as RegExp },
];

const REGIONS = [
  { value: "all", label: "All",    flag: "",   filter: null as RegExp | null },
  { value: "us",  label: "USA",    flag: "🇺🇸", filter: /\b(US|U\.S\.|American|Federal Reserve|Fed |Wall Street|S&P|Nasdaq|NYSE|Washington|Congress)\b/i as RegExp },
  { value: "cn",  label: "China",  flag: "🇨🇳", filter: /\b(China|Chinese|Beijing|Shanghai|Shenzhen|CCP|PBOC|Alibaba|Tencent|Baidu|Hong Kong)\b/i as RegExp },
  { value: "eu",  label: "Europe", flag: "🇪🇺", filter: /\b(Europe|European|ECB|EU |Eurozone|UK|Britain|Germany|France|Frankfurt|London|FTSE)\b/i as RegExp },
];

const TOPICS = [
  { value: "all",   label: "All",          filter: null as RegExp | null },
  { value: "trump", label: "Donald Trump", filter: /trump/i as RegExp },
  { value: "musk",  label: "Elon Musk",    filter: /musk|tesla|spacex|x\.com|twitter/i as RegExp },
];

function proxy(path: string) {
  return `/api/proxy/finnhub?path=${encodeURIComponent(path)}`;
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--bg4)" : "var(--bg3)",
        border: `1px solid ${active ? "var(--gold)" : "var(--border2)"}`,
        color: active ? "var(--gold)" : "var(--text2)",
        borderRadius: 20, padding: "4px 12px", fontSize: 11,
        fontFamily: "'Space Mono',monospace", cursor: "pointer",
        transition: "all 120ms", flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

export default function NewsPage() {
  const [tab,      setTab]      = useState("news");
  const [news,     setNews]     = useState<NewsItem[]>([]);
  const [ipos,     setIpos]     = useState<IPOItem[]>([]);
  const [earn,     setEarn]     = useState<EarningsItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [category, setCategory] = useState("general");
  const [region,   setRegion]   = useState("all");
  const [topic,    setTopic]    = useState("all");

  const loadNews = useCallback(async (cat: string) => {
    setLoading(true); setError(null);
    const fetchCat = CATEGORIES.find(c => c.value === cat)?.fetchCat ?? "general";
    try {
      const res  = await fetch(proxy(`/news?category=${fetchCat}&minId=0`));
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Finnhub error ${res.status}`); return; }
      setNews(Array.isArray(data) ? data.slice(0, 80) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load news");
    } finally { setLoading(false); }
  }, []);

  const loadIPO = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const from = new Date().toISOString().split("T")[0];
      const to   = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res  = await fetch(proxy(`/calendar/ipo?from=${from}&to=${to}`));
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Finnhub error ${res.status}`); return; }
      setIpos(data.ipoCalendar ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load IPO calendar");
    } finally { setLoading(false); }
  }, []);

  const loadEarnings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const from = new Date().toISOString().split("T")[0];
      const to   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const res  = await fetch(proxy(`/calendar/earnings?from=${from}&to=${to}`));
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Finnhub error ${res.status}`); return; }
      setEarn((data.earningsCalendar ?? []).slice(0, 60));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load earnings");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "news") loadNews(category);
    else if (tab === "ipo") loadIPO();
    else loadEarnings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Re-fetch when category's fetchCat changes (e.g. general ↔ crypto)
  const prevFetchCat = CATEGORIES.find(c => c.value === category)?.fetchCat;
  useEffect(() => {
    if (tab === "news") loadNews(category);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevFetchCat]);

  const filteredNews = useMemo(() => {
    let result = news;
    const catDef = CATEGORIES.find(c => c.value === category);
    if (catDef?.filter) result = result.filter(n => catDef.filter!.test(n.headline + " " + n.summary));
    const regDef = REGIONS.find(r => r.value === region);
    if (regDef?.filter) result = result.filter(n => regDef.filter!.test(n.headline + " " + n.source + " " + n.summary));
    const topDef = TOPICS.find(t => t.value === topic);
    if (topDef?.filter) result = result.filter(n => topDef.filter!.test(n.headline + " " + n.summary));
    return result;
  }, [news, category, region, topic]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
          MARKET INTELLIGENCE
        </div>
        <TabNav
          tabs={TABS}
          active={tab}
          onChange={v => { setTab(v); setCategory("general"); setRegion("all"); setTopic("all"); }}
        />
      </div>

      {/* Filter pills — news tab only */}
      {tab === "news" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <Pill key={c.value} active={category === c.value} label={c.label} onClick={() => setCategory(c.value)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {REGIONS.map(r => (
              <Pill key={r.value} active={region === r.value} label={`${r.flag} ${r.label}`.trim()} onClick={() => setRegion(r.value)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TOPICS.map(t => (
              <Pill key={t.value} active={topic === t.value} label={t.label} onClick={() => setTopic(t.value)} />
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
          Loading…
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(224,85,85,.08)", border: "1px solid rgba(224,85,85,.3)",
          borderRadius: "var(--radius-sm)", padding: "13px 16px",
          color: "#f09090", fontSize: 12, fontFamily: "'Space Mono', monospace",
          lineHeight: 1.6, marginBottom: 16,
        }}>
          ⚠ {error}
        </div>
      )}

      {!loading && !error && tab === "news" && (
        filteredNews.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredNews.map((n) => <NewsCard key={n.id} item={n} />)}
            </div>
          : <EmptyState message="No news matches these filters." />
      )}

      {!loading && !error && tab === "ipo"  && <IPOTable ipos={ipos} />}
      {!loading && !error && tab === "earn" && <EarningsTable earnings={earn} />}
    </div>
  );
}
