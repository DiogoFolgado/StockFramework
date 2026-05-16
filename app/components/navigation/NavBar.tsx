"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MarketClock } from "./MarketClock";

const NAV_ITEMS = [
  { href: "/",             label: "Home",        icon: "⌂" },
  { href: "/sectors",      label: "Sectors",     icon: "⬡" },
  { href: "/scores",       label: "Scores",      icon: "◎" },
  { href: "/sections",     label: "My Sections", icon: "▤" },
  { href: "/how-it-works", label: "How It Works",icon: "?" },
  { href: "/history",      label: "History",     icon: "⏱" },
  { href: "/news",         label: "News",        icon: "◈" },
];

const AUTH_ROUTES = ["/login", "/register"];

export function NavBar() {
  const path = usePathname();

  if (AUTH_ROUTES.includes(path)) return null;

  return (
    <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)" }} className="sticky top-0 z-50">
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, padding: "10px 20px" }}>
        <div style={{ marginRight: 8, flexShrink: 0 }}>
          <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 14, fontFamily: "'Space Mono', monospace" }}>
            Stock Analysis Framework
          </div>
          <div style={{ color: "var(--text3)", fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>
            RESEARCH-GRADE · FOUR-PILLAR
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap" }}>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  background:   active ? "var(--bg4)" : "transparent",
                  color:        active ? "var(--gold)" : "var(--text2)",
                  border:       `1px solid ${active ? "var(--border2)" : "transparent"}`,
                  borderRadius: "var(--radius)",
                  padding:      "5px 12px",
                  fontSize:     13,
                  fontWeight:   active ? 600 : 400,
                  display:      "flex",
                  gap:          6,
                  alignItems:   "center",
                  textDecoration: "none",
                  transition:   "all .15s",
                }}
              >
                <span>{icon}</span>{label}
              </Link>
            );
          })}
        </nav>

        <MarketClock />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background:   "transparent",
            border:       "1px solid var(--border2)",
            color:        "var(--text3)",
            borderRadius: "var(--radius)",
            padding:      "5px 12px",
            fontSize:     12,
            cursor:       "pointer",
            flexShrink:   0,
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
