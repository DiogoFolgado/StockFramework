"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { PILLARS } from "@/lib/scoring/engine";
import { SearchBar }      from "@/components/analysis/SearchBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorBanner }    from "@/components/ui/ErrorBanner";

// ── Shared types ──────────────────────────────────────────────────────────────
interface PillarResult { score: number; insights: string[]; verdict: string; }
interface Metrics {
  peBasicExclExtraTTM?: number; epsTTM?: number; peForwardAnnual?: number;
  "52WeekHigh"?: number; "52WeekLow"?: number; "3MonthADTV"?: number;
  beta?: number; dividendYieldIndicatedAnnual?: number; targetPriceMean?: number;
  targetPriceLow?: number; targetPriceHigh?: number;
}
interface AnalysisResult {
  ticker: string; companyName: string; sector: string;
  composite: number; signal: string;
  quote:   { c?: number; pc?: number; o?: number; h?: number; l?: number };
  profile: { name?: string; finnhubIndustry?: string; sector?: string; marketCapitalization?: number };
  metrics: Metrics;
  scores:  Record<string, PillarResult>;
}
interface Position {
  id: string; ticker: string; companyName: string;
  purchasePrice?: number; quantity?: number; currency: string;
}
interface Section  { id: string; name: string; icon: string; color: string; positions: Position[]; }
interface QuoteEntry { price: number; prevClose: number; change: number; changePct: number; currency: string; }

// ── Analysis helpers ──────────────────────────────────────────────────────────
function fmtBig(n?: number) {
  if (!n) return "—";
  if (n >= 1000) return "$" + (n / 1000).toFixed(2) + "T";
  if (n >= 1)    return "$" + n.toFixed(1)           + "B";
  return "$" + (n * 1000).toFixed(0) + "M";
}
function fmtVol(n?: number) {
  if (!n) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return String(n);
}
const fmtP = (n: number, d = 2) => n.toFixed(d);

function riskLevel(s: number) {
  if (s >= 7) return { label: "LOW",       color: "var(--green)" };
  if (s >= 5) return { label: "MODERATE",  color: "var(--gold)"  };
  if (s >= 3) return { label: "HIGH",      color: "#e8935d"      };
  return             { label: "VERY HIGH", color: "var(--red)"   };
}
function sigClass(sig: string) {
  return sig === "STRONG BUY" ? "sig-sb" : sig === "BUY" ? "sig-b" :
         sig === "NEUTRAL"    ? "sig-n"  : sig === "SELL" ? "sig-s" : "sig-ss";
}
function horizon(scores: Record<string, PillarResult>) {
  const f = scores.fundamental?.score ?? 0, t = scores.technical?.score ?? 0;
  if (f >= 7.5 && t >= 7) return "Medium-to-long term (months–years)";
  if (t >= 7)              return "Medium term (weeks–months)";
  if (f >= 7.5)            return "Long term (months–years)";
  return "Reassess — wait for clearer signal";
}
function bandNote(comp: number) {
  const thresholds = [
    { min: 8.5, label: "STRONG BUY" }, { min: 7.2, label: "BUY" },
    { min: 5.5, label: "NEUTRAL"    }, { min: 4.0, label: "SELL" },
    { min: 0,   label: "STRONG SELL" },
  ];
  const ti = thresholds.findIndex(t => comp >= t.min);
  if (ti === 0) return `+${(comp - 8.5).toFixed(1)} into STRONG BUY`;
  return `${(thresholds[ti - 1].min - comp).toFixed(1)} from ${thresholds[ti - 1].label}`;
}
function posExps(sig: string): Record<string, string> {
  const e: Record<string, Record<string, string>> = {
    "STRONG BUY":  { fundamental:"Exceptional financials justify ownership — fast revenue growth, wide margins, strong free cash flow.", technical:"Price near highs with positive momentum. Buyers clearly in control, trend is your friend.", entropy:"Even in a strong buy, the risk level means sizing positions to survive short-term volatility.", semantic:"Analyst consensus overwhelmingly positive. Most analysts rate Buy with meaningful upside to targets." },
    "BUY":         { fundamental:"Solid fundamentals support the long-term case. Not perfect everywhere, but constructive overall.", technical:"Price action bullish. Stock well-positioned in its range and showing positive trend momentum.", entropy:"Risk manageable. Normal position sizes appropriate; stay alert to macro events.", semantic:"Broadly positive analyst views with more bulls than bears. Price targets suggest upside exists." },
    "NEUTRAL":     { fundamental:"Financials mixed — some metrics strong, others raise questions. Not in trouble, but not compelling.", technical:"Price in middle of range with no clear direction. Neither buyers nor sellers in control.", entropy:"Risk moderate. No clear edge in either direction from a volatility perspective.", semantic:"Analyst views divided. No strong consensus; wait for a catalyst to resolve the uncertainty." },
    "SELL":        { fundamental:"Fundamentals weakening — revenue slowing or contracting, margins under pressure.", technical:"Price action negative — downtrend, lower in range, bearish momentum. Resistance above.", entropy:"Elevated risk in a bearish trend. Losses can compound quickly.", semantic:"Analyst sentiment cautious or negative. Material portion of analysts have cautious ratings." },
    "STRONG SELL": { fundamental:"Financial picture deteriorating. Cash burn, falling revenues, or balance sheet stress.", technical:"Clearly bearish — near lows, strong downtrend, no bottom signals forming.", entropy:"Maximal risk. High beta plus bearish trend amplifies losses.", semantic:"Bears dominate. Most analysts cautious or negative. No near-term turnaround catalyst." },
  };
  return e[sig] ?? e["NEUTRAL"];
}
function posSummary(sig: string, ticker: string, comp: number) {
  const m: Record<string, string> = {
    "STRONG BUY":  `${ticker} scores ${comp.toFixed(1)}/10 — STRONG BUY. Multiple pillars simultaneously strong.`,
    "BUY":         `${ticker} scores ${comp.toFixed(1)}/10 — BUY. Weight of evidence tilts clearly positive.`,
    "NEUTRAL":     `${ticker} scores ${comp.toFixed(1)}/10 — NEUTRAL. Signals genuinely mixed. Watch for a catalyst.`,
    "SELL":        `${ticker} scores ${comp.toFixed(1)}/10 — SELL. Fundamentals, technicals, and/or sentiment pointing the wrong way.`,
    "STRONG SELL": `${ticker} scores ${comp.toFixed(1)}/10 — STRONG SELL. Weight of evidence across all four pillars negative.`,
  };
  return m[sig] ?? "";
}
function synthText(r: AnalysisResult) {
  const { ticker, scores, composite: comp, signal: sig, profile: p, metrics: m, quote: q } = r;
  const sector = p.finnhubIndustry ?? p.sector ?? "its sector";
  const f = scores.fundamental?.score ?? 0, t = scores.technical?.score ?? 0;
  const e = scores.entropy?.score ?? 0,     s = scores.semantic?.score ?? 0;
  const fS = f >= 7.5 ? "exceptional fundamentals" : f >= 6 ? "solid fundamentals" : "mixed fundamentals";
  const tS = t >= 7.5 ? "a strong technical setup"  : t >= 6 ? "constructive technicals" : "a weakening technical picture";
  const eS = e >= 6.5 ? "manageable volatility" : e >= 5 ? "moderate uncertainty" : "elevated risk";
  const sS = s >= 7.5 ? "overwhelmingly bullish analyst consensus" : s >= 6 ? "broadly positive sentiment" : "mixed analyst views";
  let semDetail = "";
  const tm = m.targetPriceMean, cur = q.c;
  if (tm && cur) {
    const up = ((tm - cur) / cur * 100).toFixed(1);
    semDetail = ` — analyst mean target $${tm.toFixed(2)} (${Number(up) > 0 ? "+" : ""}${up}% upside)`;
  }
  let txt = `${ticker} presents ${fS} and ${tS}, operating in ${sector}. Entropy flags ${eS}. ${sS.charAt(0).toUpperCase() + sS.slice(1)}${semDetail} rounds out the picture. `;
  if (sig === "STRONG BUY" || sig === "BUY") txt += `Composite ${comp.toFixed(1)}/10 suggests risk-reward skews to the upside.`;
  else if (sig === "NEUTRAL") txt += `Composite ${comp.toFixed(1)}/10 warrants a neutral stance.`;
  else txt += `Composite ${comp.toFixed(1)}/10 signals caution.`;
  return txt;
}

const PILLAR_COLORS: Record<string, string> = {
  fundamental:"#d4a843", technical:"#4d9de0", entropy:"#9b72cf", semantic:"#4cbb8a",
};
const PILLAR_ICONS: Record<string, string> = {
  fundamental:"◈", technical:"◎", entropy:"◉", semantic:"◐",
};

// ── Portfolio helpers ─────────────────────────────────────────────────────────
function fmtEur(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function fmtPct(n: number, d = 2) { return (n >= 0 ? "+" : "") + n.toFixed(d) + "%"; }
function pos(n: number) { return n >= 0; }

function computeSection(sec: Section, quotes: Record<string, QuoteEntry>, usdToEur: number) {
  let dailyPnl = 0, buyPnl = 0, curValue = 0, costBasis = 0;
  for (const p of sec.positions) {
    const q = quotes[p.ticker], qty = p.quantity ?? 0;
    const fx = p.currency === "EUR" ? 1 : usdToEur;
    if (!q || qty === 0) continue;
    const cv = qty * q.price * fx, pv = qty * q.prevClose * fx;
    dailyPnl += cv - pv; curValue += cv;
    if (p.purchasePrice) { const cost = qty * p.purchasePrice * fx; buyPnl += cv - cost; costBasis += cost; }
  }
  const prevValue = curValue - dailyPnl;
  return {
    dailyPnl, dailyPct: prevValue !== 0 ? (dailyPnl / prevValue) * 100 : 0,
    buyPnl,   buyPct:   costBasis  !== 0 ? (buyPnl  / costBasis)  * 100 : 0,
    curValue, hasBuyData: costBasis > 0,
  };
}

function computeSectionSimpleAvg(sec: Section, quotes: Record<string, QuoteEntry>): number | null {
  const quoted = sec.positions.filter(p => quotes[p.ticker]);
  if (quoted.length === 0) return null;
  return quoted.reduce((sum, p) => sum + (quotes[p.ticker].changePct ?? 0), 0) / quoted.length;
}

// ── Section Dashboard Card ────────────────────────────────────────────────────
function SectionDashCard({ sec, quotes, usdToEur, onDelete }: {
  sec: Section; quotes: Record<string, QuoteEntry>; usdToEur: number; onDelete: (id: string) => void;
}) {
  const { dailyPnl, dailyPct, buyPnl, buyPct, hasBuyData, curValue } = computeSection(sec, quotes, usdToEur);
  const simpleAvg  = curValue === 0 ? computeSectionSimpleAvg(sec, quotes) : null;
  const displayPct = simpleAvg !== null ? simpleAvg : dailyPct;
  const hasPos = sec.positions.length > 0;
  const chips  = sec.positions.slice(0, 5);
  const extra  = sec.positions.length - chips.length;

  return (
    <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:sec.color }} />
      <div style={{ padding:"18px 20px 14px", paddingTop:21 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
          <div style={{ width:38, height:38, borderRadius:9, flexShrink:0, background:`${sec.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
            {sec.icon}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:15 }}>{sec.name}</div>
            <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'Space Mono',monospace" }}>
              {sec.positions.length} stock{sec.positions.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <Link href={`/sections/${sec.id}`} style={{ background:"none", border:"1px solid var(--border2)", borderRadius:5, padding:"3px 10px", fontSize:10, fontFamily:"'Space Mono',monospace", color:"var(--text2)", textDecoration:"none" }}>
              View →
            </Link>
            <button onClick={() => { if (confirm(`Delete "${sec.name}"?`)) onDelete(sec.id); }}
              style={{ background:"none", border:"1px solid rgba(224,85,85,.3)", borderRadius:5, padding:"3px 8px", fontSize:10, fontFamily:"'Space Mono',monospace", color:"#f09090", cursor:"pointer" }}>
              ✕
            </button>
          </div>
        </div>

        {hasPos ? (
          <>
            <div style={{ marginBottom:8 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:4 }}>
                AVG TODAY{simpleAvg !== null ? " (UNWEIGHTED)" : ""}
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:22, fontWeight:700, color:pos(displayPct) ? "var(--green)" : "var(--red)" }}>{fmtPct(displayPct)}</span>
                {simpleAvg === null && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, fontWeight:700, color:pos(dailyPnl) ? "var(--green)" : "var(--red)" }}>{pos(dailyPnl) ? "+" : ""}{fmtEur(dailyPnl)} €</span>}
              </div>
            </div>
            {hasBuyData && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:4 }}>SINCE BUY</div>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, color:pos(buyPnl) ? "var(--green)" : "var(--red)" }}>
                  {pos(buyPnl) ? "+" : ""}{fmtEur(buyPnl)} ({fmtPct(buyPct)})
                </span>
              </div>
            )}
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {chips.map(p => {
                const q = quotes[p.ticker];
                return (
                  <span key={p.id} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, padding:"2px 7px", borderRadius:4, background:"var(--bg4)", border:"1px solid var(--border)", color:"var(--text2)", display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ color:"var(--text)", fontWeight:700 }}>{p.ticker}</span>
                    <span style={{ color:"var(--text3)", fontSize:9, maxWidth:70, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.companyName}</span>
                    {q && <span style={{ color:q.changePct >= 0 ? "var(--green)" : "var(--red)", fontSize:9 }}>{q.changePct >= 0 ? "+" : ""}{q.changePct.toFixed(1)}%</span>}
                  </span>
                );
              })}
              {extra > 0 && <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, padding:"2px 7px", borderRadius:4, background:"var(--bg4)", border:"1px solid var(--border)", color:"var(--text3)" }}>+{extra}</span>}
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"16px 0 8px", color:"var(--text3)", fontSize:12, fontFamily:"'Space Mono',monospace" }}>
            — AVG TODAY —
            <div style={{ marginTop:8, fontSize:11 }}>No stocks yet — <Link href="/sections" style={{ color:"var(--gold)", textDecoration:"none" }}>click to add</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cash Card ─────────────────────────────────────────────────────────────────
function CashCard({ cashEur, cashUsd, onChange, hidden, onToggleHidden }: { cashEur:number; cashUsd:number; onChange:(e:number,u:number)=>void; hidden:boolean; onToggleHidden:()=>void }) {
  const [editing, setEditing] = useState(false);
  const [dE, setDE] = useState(String(cashEur));
  const [dU, setDU] = useState(String(cashUsd));

  function save() { onChange(parseFloat(dE) || 0, parseFloat(dU) || 0); setEditing(false); }

  return (
    <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"12px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, flexShrink:0 }}>CASH</span>
      {editing ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, flexWrap:"wrap" }}>
          {(["EUR","USD"] as const).map((cur, i) => (
            <div key={cur} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text3)" }}>{cur}</span>
              <input type="number" value={i === 0 ? dE : dU} onChange={e => i === 0 ? setDE(e.target.value) : setDU(e.target.value)}
                style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:5, color:"var(--text)", padding:"5px 9px", fontFamily:"'Space Mono',monospace", fontSize:13, outline:"none", width:130 }} />
            </div>
          ))}
          <button onClick={save} style={{ padding:"5px 12px", background:"var(--gold)", color:"#07070f", border:"none", borderRadius:5, fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, cursor:"pointer" }}>Save</button>
          <button onClick={() => setEditing(false)} style={{ padding:"5px 9px", background:"none", border:"1px solid var(--border2)", borderRadius:5, fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text3)", cursor:"pointer" }}>Cancel</button>
        </div>
      ) : (
        <>
          {hidden ? (
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:13, color:"var(--text3)" }}>••••••</span>
          ) : (
            <>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", marginRight:-8 }}>EUR</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:700 }}>{fmtEur(cashEur)}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:13, color:"var(--text3)" }}>|</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", marginRight:-8 }}>USD</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:15, fontWeight:700 }}>{fmtEur(cashUsd)}</span>
            </>
          )}
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button onClick={() => { setDE(String(cashEur)); setDU(String(cashUsd)); setEditing(true); }}
              style={{ background:"none", border:"1px solid var(--border2)", borderRadius:5, padding:"3px 10px", fontSize:10, fontFamily:"'Space Mono',monospace", color:"var(--text3)", cursor:"pointer" }}>Edit</button>
            <button onClick={onToggleHidden}
              style={{ background:"none", border:"1px solid var(--border2)", borderRadius:5, padding:"3px 8px", fontSize:12, color:"var(--text3)", cursor:"pointer" }}>{hidden ? "👁" : "🙈"}</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Icon picker options ───────────────────────────────────────────────────────
const SECTION_ICONS = [
  "📊","📈","📉","💰","💵","💹","🏦","💎","🔥","⭐",
  "🤖","💻","📱","🌐","🔬","🧬","💊","🏥","⚡","🌱",
  "🛒","🛍️","🚀","🛡️","✈️","🏠","🏗️","⛽","🔋","💡",
  "🌍","🌊","🧪","🎯","🏆","💫","🔮","🎲","🧠","👁️",
  "🦾","🔑","🗝️","📡","🛸","🧩","🎮","🎬","🎵","🏋️",
];

// ── Create Section Form ───────────────────────────────────────────────────────
function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm]         = useState({ name:"", icon:"📊", color:"#d4a843" });
  const [busy, setBusy]         = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!form.name.trim()) return; setBusy(true);
    const res = await fetch("/api/sections", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(form) });
    setBusy(false); if (res.ok) { setForm({ name:"", icon:"📊", color:"#d4a843" }); setPickerOpen(false); onCreated(); }
  }

  return (
    <form onSubmit={submit} style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"16px 20px", marginBottom:16 }}>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>NAME</div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Tech, Biotech…"
            style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:6, color:"var(--text)", padding:"7px 11px", fontFamily:"'Space Grotesk',sans-serif", fontSize:13, outline:"none", width:180 }} />
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>ICON</div>
          <button type="button" onClick={() => setPickerOpen(o => !o)}
            style={{ width:44, height:34, fontSize:18, background:"var(--bg3)", border:`1px solid ${pickerOpen ? "var(--gold)" : "var(--border2)"}`, borderRadius:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {form.icon}
          </button>
          {pickerOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:400, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:10, padding:10, display:"grid", gridTemplateColumns:"repeat(10, 32px)", gap:4, boxShadow:"0 12px 36px rgba(0,0,0,.6)", width:370 }}>
              {SECTION_ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => { setForm(f => ({ ...f, icon })); setPickerOpen(false); }}
                  style={{ width:32, height:32, fontSize:17, background: form.icon === icon ? "var(--bg4)" : "none", border: form.icon === icon ? "1px solid var(--gold)" : "1px solid transparent", borderRadius:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg4)")}
                  onMouseLeave={e => (e.currentTarget.style.background = form.icon === icon ? "var(--bg4)" : "none")}>
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>COLOR</div>
          <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color:e.target.value }))}
            style={{ width:44, height:34, borderRadius:6, border:"1px solid var(--border2)", background:"none", cursor:"pointer", padding:2 }} />
        </div>
        <button type="submit" disabled={busy}
          style={{ padding:"8px 18px", background:"linear-gradient(135deg,var(--gold),#f0c870)", color:"#07070f", border:"none", borderRadius:7, fontWeight:700, fontSize:13, cursor:busy?"not-allowed":"pointer", fontFamily:"'Space Grotesk',sans-serif" }}>
          {busy ? "Creating…" : "Create Section"}
        </button>
      </div>
    </form>
  );
}

// ── Analysis Result Panel ─────────────────────────────────────────────────────
function AnalysisPanel({ r, onClose }: { r: AnalysisResult; onClose: () => void }) {
  const cur = r.quote.c, pc = r.quote.pc;
  const chg = cur != null && pc != null ? cur - pc : null;
  const chgPct = chg != null && pc ? (chg / pc * 100) : null;
  const chgPos = chg != null && chg >= 0;
  const chgColor = chgPos ? "var(--green)" : "var(--red)";
  const chgStr = chg != null ? `${chgPos ? "+" : ""}${chg.toFixed(2)} (${chgPos ? "+" : ""}${chgPct?.toFixed(2)}%)` : "";
  const h52 = r.metrics["52WeekHigh"], l52 = r.metrics["52WeekLow"];
  let sparkPct = 0.5;
  if (cur && h52 && l52 && h52 > l52) sparkPct = Math.min(1, Math.max(0, (cur - l52) / (h52 - l52)));
  const sx = sparkPct * 520 + 20;
  const entropyScore = r.scores.entropy?.score ?? 5;
  const risk = riskLevel(entropyScore);
  const comp = r.composite, sig = r.signal, bn = bandNote(comp);
  const pExp = posExps(sig);
  const beta = r.metrics.beta;
  const watchRisk = beta && beta > 1.8 ? `High beta (${beta.toFixed(1)}x)` : entropyScore < 5 ? "Binary risk events" : "Valuation re-rating & macro";
  const tm = r.metrics.targetPriceMean;
  const catalyst = tm && cur ? `Target $${tm.toFixed(2)} (${((tm - cur) / cur * 100) > 0 ? "+" : ""}${((tm - cur) / cur * 100).toFixed(1)}% upside)` : "Earnings & guidance catalyst";

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--text3)" }}>⏱ {new Date().toLocaleString()} · {r.ticker}</div>
        <button onClick={onClose} style={{ background:"none", border:"1px solid var(--border2)", borderRadius:6, color:"var(--text2)", fontSize:11, fontFamily:"'Space Mono',monospace", padding:"4px 10px", cursor:"pointer" }}>✕ Close</button>
      </div>

      {/* HERO */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", marginBottom:14, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 80% at 10% 50%,rgba(212,168,67,.05),transparent)", pointerEvents:"none" }} />
        <div style={{ padding:"22px 26px 18px", display:"flex", alignItems:"flex-start", flexWrap:"wrap", gap:0 }}>
          <div style={{ flex:"0 0 auto", marginRight:28, minWidth:150 }}>
            <div style={{ fontSize:38, fontWeight:700, fontFamily:"'Space Mono',monospace", color:"var(--gold)", letterSpacing:3, lineHeight:1 }}>{r.ticker}</div>
            <div style={{ fontSize:12, color:"var(--text2)", marginTop:5 }}>{r.profile.name ?? r.companyName}</div>
          </div>
          <div style={{ display:"flex", flex:1, flexWrap:"wrap", borderLeft:"1px solid var(--border2)", paddingLeft:24 }}>
            {[
              { label:"PRICE",          node:<><div style={{ fontSize:26, fontWeight:700, fontFamily:"'Space Mono',monospace", lineHeight:1 }}>${cur?.toFixed(2) ?? "—"}</div><div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", marginTop:3, color:chgColor }}>{chgStr}</div></> },
              { label:"COMPOSITE SCORE",node:<><div style={{ fontSize:34, fontWeight:700, fontFamily:"'Space Mono',monospace", lineHeight:1, color:comp >= 7.5 ? "var(--gold2,#f7b731)" : comp >= 5.5 ? "var(--gold)" : "var(--red)" }}>{comp.toFixed(1)}</div><div style={{ fontSize:9, fontFamily:"'Space Mono',monospace", marginTop:5, color:"var(--text3)" }}>OUT OF 10.0</div><div style={{ fontSize:8, fontFamily:"'Space Mono',monospace", marginTop:2, color:"var(--text3)", opacity:.7 }}>{bn}</div></> },
              { label:"SIGNAL",         node:<span className={`signal-badge ${sigClass(sig)}`}>{sig}</span> },
              { label:"RISK LEVEL",     node:<div style={{ fontSize:20, fontWeight:700, fontFamily:"'Space Mono',monospace", lineHeight:1, color:risk.color }}>{risk.label}</div> },
              { label:"MARKET CAP",     node:<div style={{ fontSize:18, fontWeight:700, fontFamily:"'Space Mono',monospace", lineHeight:1 }}>{fmtBig(r.profile.marketCapitalization)}</div> },
            ].map(({ label, node }) => (
              <div key={label} style={{ padding:"6px 24px 6px 0", minWidth:110 }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>{label}</div>
                {node}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:1, background:"var(--border2)", margin:"0 26px" }} />
        <div style={{ padding:"12px 26px", display:"flex", flexWrap:"wrap", gap:"0 0" }}>
          {[
            { label:"P/E (TTM)",  val:r.metrics.peBasicExclExtraTTM ? fmtP(r.metrics.peBasicExclExtraTTM,1)+"x" : "—" },
            { label:"EPS (TTM)",  val:r.metrics.epsTTM ? "$"+fmtP(r.metrics.epsTTM,2) : "—" },
            { label:"52W HIGH",   val:h52 ? "$"+fmtP(h52,2) : "—" },
            { label:"52W LOW",    val:l52 ? "$"+fmtP(l52,2) : "—" },
            { label:"AVG VOL",    val:fmtVol(r.metrics["3MonthADTV"] ? r.metrics["3MonthADTV"]! * 1e6 : undefined) },
            { label:"BETA",       val:beta ? fmtP(beta,2) : "—" },
            { label:"DIV YIELD",  val:r.metrics.dividendYieldIndicatedAnnual ? fmtP(r.metrics.dividendYieldIndicatedAnnual,2)+"%" : "None" },
            { label:"FWD P/E",    val:r.metrics.peForwardAnnual ? fmtP(r.metrics.peForwardAnnual,1)+"x" : "—" },
          ].map(({ label, val }) => (
            <div key={label} style={{ padding:"4px 20px 4px 0", minWidth:90 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:1.5, marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:13, fontWeight:600, fontFamily:"'Space Mono',monospace" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* POSITION ANALYSIS */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:14 }}>
        <div style={{ padding:"16px 24px 14px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>POSITION ANALYSIS</div>
          <div style={{ fontSize:17, fontWeight:600, display:"flex", alignItems:"center", gap:10 }}>
            <span className={`signal-badge ${sigClass(sig)}`}>{sig}</span>
            <span>Why {r.ticker} is {sig}</span>
          </div>
        </div>
        <div style={{ padding:"18px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
          {["fundamental","technical","entropy","semantic"].map(id => {
            const s = r.scores[id]; const color = PILLAR_COLORS[id];
            return (
              <div key={id} style={{ background:"var(--bg3)", borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontSize:16, marginBottom:6 }}>{PILLAR_ICONS[id]}</div>
                <div style={{ fontSize:13, fontWeight:600, color, marginBottom:4 }}>{id.toUpperCase()} · {s?.score.toFixed(1)}/10</div>
                <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.7, marginBottom:10 }}>{pExp[id]}</div>
                <div style={{ height:4, background:"var(--border)", borderRadius:2 }}>
                  <div style={{ height:4, width:`${(s?.score ?? 0)*10}%`, background:color, borderRadius:2 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding:"0 24px 18px" }}>
          <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.8, borderTop:"1px solid var(--border)", paddingTop:14, margin:0 }}>
            {posSummary(sig, r.ticker, comp)}
          </p>
        </div>
      </div>

      {/* 52W SPARKLINE */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"16px 20px", marginBottom:14 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:9 }}>PRICE POSITION · 52-WEEK RANGE</div>
        <svg viewBox="0 0 560 70" width="100%" height="70">
          <defs><linearGradient id="sg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#e05555"/><stop offset="50%" stopColor="#d4a843"/><stop offset="100%" stopColor="#4cbb8a"/></linearGradient></defs>
          <rect x="0" y="24" width="560" height="7" rx="3.5" fill="#1a1a35"/>
          <rect x="0" y="24" width={sx} height="7" rx="3.5" fill="url(#sg2)"/>
          <circle cx={sx} cy="27" r="5" fill="var(--gold)" stroke="#07070f" strokeWidth="2"/>
          <text x={sx} y="14" textAnchor="middle" fill="#d4a843" fontSize="10" fontFamily="Space Mono,monospace" fontWeight="700">${cur?.toFixed(2) ?? ""}</text>
          <text x="0" y="54" fill="#5a5a80" fontSize="10" fontFamily="Space Mono,monospace">{l52 ? "$"+l52.toFixed(2) : "—"}</text>
          <text x="560" y="54" textAnchor="end" fill="#5a5a80" fontSize="10" fontFamily="Space Mono,monospace">{h52 ? "$"+h52.toFixed(2) : "—"}</text>
          <text x={sx} y="66" textAnchor="middle" fill="#5a5a80" fontSize="9" fontFamily="Space Mono,monospace">{(sparkPct*100).toFixed(0)}% of range</text>
        </svg>
      </div>

      {/* FOUR PILLAR CARDS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))", gap:11, marginBottom:14 }}>
        {PILLARS.map(pl => {
          const s = r.scores[pl.id]; if (!s) return null;
          return (
            <div key={pl.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:16, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:pl.color }} />
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:8 }}>{pl.icon} {pl.label} · {pl.wLabel}</div>
              <div style={{ fontSize:13, fontWeight:600, color:pl.color, marginBottom:4 }}>{s.verdict}</div>
              <ul style={{ margin:"0 0 10px 14px", padding:0, fontSize:12, color:"var(--text2)", lineHeight:1.8 }}>
                {s.insights.map((ins,i) => <li key={i}>{ins}</li>)}
              </ul>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", marginBottom:4 }}>SCORE</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text2)", marginBottom:5 }}>{s.score}/10</div>
              <div style={{ height:4, background:"var(--border)", borderRadius:2 }}>
                <div style={{ height:4, width:`${s.score*10}%`, background:pl.color, borderRadius:2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* INVESTMENT THESIS */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"20px 24px", marginBottom:14 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:9 }}>◈ INVESTMENT THESIS SYNTHESIS</div>
        <p style={{ fontSize:13, color:"var(--text2)", lineHeight:1.85, margin:0 }}>{synthText(r)}</p>
      </div>

      {/* FOOTER CHIPS */}
      <div style={{ display:"flex", gap:9, flexWrap:"wrap", marginBottom:18 }}>
        {[
          { label:"TIME HORIZON", val:horizon(r.scores) },
          { label:"KEY CATALYST", val:catalyst },
          { label:"WATCH RISK",   val:watchRisk },
          { label:"SECTOR",       val:r.profile.finnhubIndustry ?? r.sector ?? "—" },
        ].map(({ label, val }) => (
          <div key={label} style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:8, padding:"10px 16px", flex:"1 1 180px" }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:"center", fontSize:10, color:"var(--text3)", fontFamily:"'Space Mono',monospace", paddingBottom:12 }}>
        Research &amp; education only · Not financial advice · Framework: Cohen et al. (2025) · Ricchiuti &amp; Sperlí (2025)
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const CASH_KEY = "sf_cash_v1";

export default function HomePage() {
  // Analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [result,          setResult]          = useState<AnalysisResult | null>(null);
  const [analysisError,   setAnalysisError]   = useState<string | null>(null);

  // Portfolio state
  const [sections,  setSections]  = useState<Section[]>([]);
  const [quotes,    setQuotes]    = useState<Record<string, QuoteEntry>>({});
  const [usdToEur,  setUsdToEur]  = useState(0.92);
  const [portLoading, setPortLoading] = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [cashEur,   setCashEur]   = useState(0);
  const [cashUsd,   setCashUsd]   = useState(0);
  const [cashHidden, setCashHidden] = useState(false);
  const quotesFetched = useRef(false);

  // Load cash from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CASH_KEY);
      if (raw) { const c = JSON.parse(raw); setCashEur(c.eur ?? 0); setCashUsd(c.usd ?? 0); }
    } catch { /* ignore */ }
  }, []);

  function saveCash(eur: number, usd: number) {
    setCashEur(eur); setCashUsd(usd);
    localStorage.setItem(CASH_KEY, JSON.stringify({ eur, usd }));
  }

  const loadSections = useCallback(async () => {
    setPortLoading(true);
    try {
      const res  = await fetch("/api/sections");
      const data = await res.json();
      const secs: Section[] = data.sections ?? [];
      setSections(secs);
      return secs;
    } finally { setPortLoading(false); }
  }, []);

  const loadQuotes = useCallback(async (secs: Section[]) => {
    const tickers = [...new Set(secs.flatMap(s => s.positions.map(p => p.ticker)))];
    if (tickers.length === 0) return;
    const allSymbols = [...tickers, "EURUSD=X"].join(",");
    try {
      const res  = await fetch(`/api/portfolio/quotes?tickers=${encodeURIComponent(allSymbols)}`);
      const data = await res.json();
      const q: Record<string, QuoteEntry> = data.quotes ?? {};
      const fx = q["EURUSD=X"];
      const fx2eur = fx?.price > 0 ? 1 / fx.price : 0.92;
      if (fx?.price > 0) setUsdToEur(fx2eur);
      delete q["EURUSD=X"];
      setQuotes(q);

      // Auto-save daily section snapshots (fire-and-forget)
      const entries = secs.flatMap(sec => {
        const { dailyPct, dailyPnl, curValue } = computeSection(sec, q, fx2eur);
        const pct = curValue > 0 ? dailyPct : computeSectionSimpleAvg(sec, q);
        return pct !== null ? [{ sectionId: sec.id, avgChangePct: pct, pnlEur: dailyPnl }] : [];
      });
      if (entries.length > 0) {
        fetch("/api/sections/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries }),
        }).catch(() => {});
      }
    } catch { /* fail silently */ }
  }, []);

  useEffect(() => {
    if (quotesFetched.current) return;
    quotesFetched.current = true;
    loadSections().then(secs => loadQuotes(secs));
  }, [loadSections, loadQuotes]);

  // Analysis
  async function analyse(ticker: string) {
    setAnalysisLoading(true); setAnalysisError(null); setResult(null);
    try {
      const res  = await fetch("/api/analyse", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ ticker }) });
      const data = await res.json();
      if (!res.ok) { setAnalysisError(data.error ?? "Analysis failed"); return; }
      setResult(data as AnalysisResult);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Analysis failed");
    } finally { setAnalysisLoading(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/sections/${id}`, { method:"DELETE" });
    setSections(s => s.filter(x => x.id !== id));
  }

  async function handleCreated() {
    setCreating(false);
    const secs = await loadSections();
    await loadQuotes(secs);
  }

  // Portfolio totals
  let totalCurEur = 0, totalDailyPnl = 0;
  for (const sec of sections) {
    const c = computeSection(sec, quotes, usdToEur);
    totalCurEur += c.curValue; totalDailyPnl += c.dailyPnl;
  }
  const cashEurTotal  = cashEur + cashUsd * usdToEur;
  const totalWorthEur = totalCurEur + cashEurTotal;
  const prevWorthEur  = totalWorthEur - totalDailyPnl;
  const totalDailyPct = prevWorthEur > 0 ? (totalDailyPnl / prevWorthEur) * 100 : 0;
  const pnlPos        = pos(totalDailyPnl);
  const totalPositions = sections.reduce((a, s) => a + s.positions.length, 0);
  const activeSections = sections.filter(s => s.positions.length > 0).length;

  return (
    <div>
      {/* ── Search Bar (always visible) ── */}
      <SearchBar onAnalyse={analyse} disabled={analysisLoading} />

      {analysisLoading && <LoadingSpinner message="Analysing…" />}
      {analysisError   && <ErrorBanner   message={analysisError} />}

      {/* ── Analysis Results ── */}
      {result && !analysisLoading && (
        <AnalysisPanel r={result} onClose={() => { setResult(null); setAnalysisError(null); }} />
      )}

      {/* ── Portfolio Dashboard (shown when no analysis active) ── */}
      {!result && !analysisLoading && (
        <div style={{ marginTop: 24 }}>
          {/* Portfolio Summary */}
          <div style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"var(--radius)", padding:"18px 24px", marginBottom:16, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(212,168,67,.04),transparent 60%)", pointerEvents:"none" }} />
            <div style={{ flexShrink:0 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>TOTAL PORTFOLIO</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:26, fontWeight:700, color:pnlPos ? "var(--green)" : "var(--red)" }}>{pnlPos ? "+" : ""}{fmtEur(totalDailyPnl)}</span>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:14, color:pnlPos ? "var(--green)" : "var(--red)" }}>({fmtPct(totalDailyPct)})</span>
              </div>
            </div>
            <div style={{ width:1, height:36, background:"var(--border2)", flexShrink:0, margin:"0 4px" }} />
            <div style={{ flexShrink:0 }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"var(--text3)", letterSpacing:2, marginBottom:5 }}>TOTAL WORTH</div>
              {cashHidden
                ? <div style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700, letterSpacing:-0.5, color:"var(--text3)" }}>••••••</div>
                : <div style={{ fontFamily:"'Space Mono',monospace", fontSize:20, fontWeight:700, letterSpacing:-0.5 }}>€{fmtEur(totalWorthEur)}</div>
              }
            </div>
            <div style={{ marginLeft:"auto", fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--text3)", textAlign:"right", lineHeight:1.7 }}>
              {totalPositions} position{totalPositions !== 1 ? "s" : ""} across {activeSections} section{activeSections !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Cash Card */}
          <CashCard cashEur={cashEur} cashUsd={cashUsd} onChange={saveCash} hidden={cashHidden} onToggleHidden={() => setCashHidden(h => !h)} />

          {/* Sections Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text3)", letterSpacing:2 }}>MY SECTIONS</span>
            <button onClick={() => setCreating(c => !c)}
              style={{ padding:"7px 16px", background:"linear-gradient(135deg,var(--gold),#f0c870)", color:"#07070f", border:"none", borderRadius:7, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif" }}>
              + New Section
            </button>
          </div>

          {creating && <CreateForm onCreated={handleCreated} />}

          {portLoading ? (
            <div style={{ textAlign:"center", padding:60, color:"var(--text3)", fontFamily:"'Space Mono',monospace", fontSize:12 }}>Loading portfolio…</div>
          ) : sections.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text3)" }}>
              <div style={{ fontSize:40, marginBottom:14, opacity:.3 }}>▤</div>
              <p style={{ fontSize:13, fontFamily:"'Space Mono',monospace", letterSpacing:1 }}>No sections yet. Create your first watchlist section above.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
              {sections.map(sec => (
                <SectionDashCard key={sec.id} sec={sec} quotes={quotes} usdToEur={usdToEur} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
