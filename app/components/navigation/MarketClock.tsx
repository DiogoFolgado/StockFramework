"use client";

import { useState, useEffect } from "react";

const NYSE_HOLIDAYS = new Set([
  "2025-01-01","2025-01-20","2025-02-17","2025-04-18","2025-05-26",
  "2025-06-19","2025-07-04","2025-09-01","2025-11-27","2025-12-25",
  "2026-01-01","2026-01-19","2026-02-16","2026-04-03","2026-05-25",
  "2026-06-19","2026-07-03","2026-09-07","2026-11-26","2026-12-25",
]);

function getEtParts(now: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  return Object.fromEntries(
    fmt.formatToParts(now).filter(p => p.type !== "literal").map(p => [p.type, parseInt(p.value, 10)])
  ) as Record<string, number>;
}

function etDateStr(p: Record<string, number>) {
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function isTradingDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  const dow = d.getUTCDay();
  return dow !== 0 && dow !== 6 && !NYSE_HOLIDAYS.has(dateStr);
}

function nextTradingDay(fromDateStr: string) {
  const d = new Date(fromDateStr + "T12:00:00Z");
  for (let i = 0; i < 10; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
    const str = d.toISOString().slice(0, 10);
    if (isTradingDay(str)) return str;
  }
  return null;
}

function dayLabel(isoDate: string) {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(isoDate + "T12:00:00Z").getUTCDay()];
}

function fmtCountdown(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function etEpochForOpen(dateStr: string) {
  const refUtc = new Date(dateStr + "T17:00:00Z");
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(refUtc).filter(p => p.type !== "literal").map(p => [p.type, parseInt(p.value, 10)])
  ) as Record<string, number>;
  const etEpochAtRef = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const offsetMs = refUtc.getTime() - etEpochAtRef;
  const [yr, mo, da] = dateStr.split("-").map(Number);
  return Date.UTC(yr, mo - 1, da, 9, 30, 0) + offsetMs;
}

interface ClockState {
  open:      boolean;
  label:     string;
  countdown: string;
  dotColor:  string;
  textColor: string;
}

function tick(): ClockState {
  const now      = new Date();
  const p        = getEtParts(now);
  const todayStr = etDateStr(p);
  const secNow   = p.hour * 3600 + p.minute * 60 + p.second;
  const OPEN_SEC  = 9 * 3600 + 30 * 60;
  const CLOSE_SEC = 16 * 3600;

  if (isTradingDay(todayStr) && secNow >= OPEN_SEC && secNow < CLOSE_SEC) {
    return {
      open:      true,
      label:     "NYSE OPEN",
      countdown: fmtCountdown(CLOSE_SEC - secNow) + " left",
      dotColor:  "#4cbb8a",
      textColor: "#4cbb8a",
    };
  }

  const targetDate = (isTradingDay(todayStr) && secNow < OPEN_SEC) ? todayStr : nextTradingDay(todayStr);
  let countdown = "--:--";
  if (targetDate) {
    const secsLeft = Math.max(0, Math.round((etEpochForOpen(targetDate) - now.getTime()) / 1000));
    const prefix   = targetDate !== todayStr ? `Opens ${dayLabel(targetDate)} in ` : "Opens in ";
    countdown      = prefix + fmtCountdown(secsLeft);
  }
  return {
    open:      false,
    label:     "NYSE",
    countdown,
    dotColor:  "#e05555",
    textColor: "var(--text2)",
  };
}

export function MarketClock() {
  const [state, setState] = useState<ClockState>(() => tick());

  useEffect(() => {
    const id = setInterval(() => setState(tick()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      background: "var(--bg3)", border: "1px solid var(--border2)",
      borderRadius: 20, padding: "4px 12px 4px 9px",
      fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap",
      userSelect: "none", flexShrink: 0,
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: state.dotColor,
        boxShadow: `0 0 6px ${state.dotColor}`,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 10, color: state.open ? state.textColor : "var(--text3)", letterSpacing: 1 }}>
        {state.label}
      </span>
      <span style={{ fontSize: 10, color: "var(--border2)" }}>·</span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: -0.3, color: state.textColor }}>
        {state.countdown}
      </span>
    </div>
  );
}
