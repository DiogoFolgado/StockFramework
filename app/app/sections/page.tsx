"use client";

import { useState, useEffect, useCallback } from "react";

interface Position {
  id:            string;
  ticker:        string;
  companyName:   string;
  purchasePrice?: number;
  quantity?:     number;
  currency:      string;
}

interface Section {
  id:        string;
  name:      string;
  icon:      string;
  color:     string;
  positions: Position[];
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ name: "", icon: "📊", color: "#d4a843" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sections");
      const data = await res.json();
      setSections(data.sections ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createSection(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ name: "", icon: "📊", color: "#d4a843" }); setCreating(false); await load(); }
  }

  async function deleteSection(id: string) {
    if (!confirm("Delete this section and all its positions?")) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    setSections((s) => s.filter((x) => x.id !== id));
  }

  async function removePosition(posId: string, secId: string) {
    await fetch(`/api/positions/${posId}`, { method: "DELETE" });
    setSections((s) => s.map((sec) =>
      sec.id === secId ? { ...sec, positions: sec.positions.filter((p) => p.id !== posId) } : sec
    ));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ color: "var(--gold)", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>
            MY SECTIONS
          </div>
          <div style={{ color: "var(--text2)", fontSize: 14 }}>{sections.length} watchlist sections</div>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          style={{
            background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius)",
            padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
        >
          + New Section
        </button>
      </div>

      {creating && (
        <form onSubmit={createSection} style={{
          background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
          padding: 20, marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end",
        }}>
          <div>
            <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>NAME</div>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Section name…"
              style={{
                background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7,
                color: "var(--text)", padding: "8px 12px", fontSize: 14, outline: "none",
              }}
            />
          </div>
          <div>
            <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>ICON</div>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              maxLength={2}
              style={{
                background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7,
                color: "var(--text)", padding: "8px 12px", fontSize: 18, outline: "none", width: 60, textAlign: "center",
              }}
            />
          </div>
          <div>
            <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>COLOUR</div>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
              style={{ width: 44, height: 36, border: "none", background: "none", cursor: "pointer" }} />
          </div>
          <button type="submit" style={{
            background: "var(--gold)", color: "#000", border: "none", borderRadius: 7,
            padding: "8px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Create</button>
          <button type="button" onClick={() => setCreating(false)} style={{
            background: "transparent", border: "1px solid var(--border2)", color: "var(--text3)",
            borderRadius: 7, padding: "8px 14px", fontSize: 13, cursor: "pointer",
          }}>Cancel</button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading…</div>
      ) : sections.length === 0 ? (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: 40, textAlign: "center", color: "var(--text3)",
        }}>
          No sections yet. Create your first watchlist section above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.map((sec) => (
            <div key={sec.id} style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
              overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                borderBottom: sec.positions.length ? "1px solid var(--border)" : undefined,
                borderLeft: `4px solid ${sec.color}`,
              }}>
                <span style={{ fontSize: 20 }}>{sec.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{sec.name}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12 }}>{sec.positions.length} positions</div>
                </div>
                <button
                  onClick={() => deleteSection(sec.id)}
                  style={{
                    background: "transparent", border: "1px solid var(--border)", color: "var(--red)",
                    borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                  }}
                >Delete</button>
              </div>

              {sec.positions.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--bg3)" }}>
                      {["Ticker", "Company", "Price", "Qty", "Currency", ""].map((h) => (
                        <th key={h} style={{
                          padding: "7px 14px", textAlign: "left", color: "var(--text3)",
                          fontFamily: "'Space Mono', monospace", fontSize: 10,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.positions.map((pos) => (
                      <tr key={pos.id} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 14px", fontFamily: "'Space Mono', monospace", color: "var(--gold)", fontSize: 13 }}>
                          {pos.ticker}
                        </td>
                        <td style={{ padding: "8px 14px", fontSize: 13 }}>{pos.companyName}</td>
                        <td style={{ padding: "8px 14px", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                          {pos.purchasePrice != null ? `$${pos.purchasePrice.toFixed(2)}` : "—"}
                        </td>
                        <td style={{ padding: "8px 14px", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                          {pos.quantity ?? "—"}
                        </td>
                        <td style={{ padding: "8px 14px", color: "var(--text3)", fontSize: 12 }}>{pos.currency}</td>
                        <td style={{ padding: "8px 14px" }}>
                          <button
                            onClick={() => removePosition(pos.id, sec.id)}
                            style={{
                              background: "transparent", border: "none", color: "var(--text3)",
                              fontSize: 14, cursor: "pointer",
                            }}
                          >✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
