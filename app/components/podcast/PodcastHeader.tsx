"use client";

import { useState, useEffect } from "react";

export function PodcastHeader() {
  const [permState, setPermState] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermState(Notification.permission);
    }
  }, []);

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermState(result);
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          color: "var(--gold)",
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: 3,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        The Rundown
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Latest Episodes
          </h1>
          <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>
            AI-summarised · Updates automatically
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginLeft: "auto", flexWrap: "wrap" }}>
          {permState !== null && permState !== "granted" && (
            <button
              onClick={enableNotifications}
              style={{
                background: "rgba(212,168,67,0.1)",
                border: "1px solid rgba(212,168,67,0.4)",
                color: "var(--gold)",
                borderRadius: "var(--radius)",
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {permState === "denied" ? "Notifications blocked" : "Enable Notifications"}
            </button>
          )}

          <a
            href="https://podcasts.apple.com/podcast/id1726048251"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              color: "var(--text2)",
              borderRadius: "var(--radius)",
              padding: "6px 14px",
              fontSize: 12,
              textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Open in Apple Podcasts ↗
          </a>
        </div>
      </div>
    </div>
  );
}
