"use client";

import { useState, useEffect, useCallback } from "react";
import { Button }              from "@/components/ui/Button";
import { EmptyState }          from "@/components/ui/EmptyState";
import { CreateSectionForm }   from "@/components/sections/CreateSectionForm";
import { SectionCard }         from "@/components/sections/SectionCard";

interface Position {
  id:             string;
  ticker:         string;
  companyName:    string;
  purchasePrice?: number;
  quantity?:      number;
  currency:       string;
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
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", icon: "📊", color: "#d4a843" });
      setCreating(false);
      await load();
    }
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
        <Button variant="primary" onClick={() => setCreating(!creating)}>+ New Section</Button>
      </div>

      {creating && (
        <CreateSectionForm
          form={form}
          onChange={setForm}
          onSubmit={createSection}
          onCancel={() => setCreating(false)}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>Loading…</div>
      ) : sections.length === 0 ? (
        <EmptyState message="No sections yet. Create your first watchlist section above." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sections.map((sec) => (
            <SectionCard
              key={sec.id}
              section={sec}
              onDelete={deleteSection}
              onRemovePosition={removePosition}
              onPositionAdded={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}
