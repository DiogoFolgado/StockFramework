"use client";

import { useState } from "react";
import { Button }           from "@/components/ui/Button";
import { PositionTable }    from "./PositionTable";
import { AddPositionForm }  from "./AddPositionForm";

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

interface SectionCardProps {
  section:          Section;
  onDelete:         (id: string) => void;
  onRemovePosition: (posId: string, secId: string) => void;
  onPositionAdded:  () => void;
}

export function SectionCard({ section: sec, onDelete, onRemovePosition, onPositionAdded }: SectionCardProps) {
  const [adding, setAdding] = useState(false);

  function handleAdded() {
    setAdding(false);
    onPositionAdded();
  }

  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
        borderBottom: "1px solid var(--border)",
        borderLeft: `4px solid ${sec.color}`,
      }}>
        <span style={{ fontSize: 20 }}>{sec.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{sec.name}</div>
          <div style={{ color: "var(--text3)", fontSize: 12 }}>{sec.positions.length} positions</div>
        </div>
        <Button variant="danger" size="sm" onClick={() => onDelete(sec.id)}>Delete</Button>
      </div>

      <PositionTable positions={sec.positions} sectionId={sec.id} onRemove={onRemovePosition} />

      {adding ? (
        <AddPositionForm sectionId={sec.id} onAdded={handleAdded} onCancel={() => setAdding(false)} />
      ) : (
        <div style={{ padding: "10px 16px", borderTop: sec.positions.length ? "1px solid var(--border)" : undefined }}>
          <button
            onClick={() => setAdding(true)}
            style={{
              background: "none", border: "1px dashed var(--border2)", borderRadius: 6,
              color: "var(--text3)", fontFamily: "'Space Mono',monospace", fontSize: 11,
              padding: "6px 14px", cursor: "pointer", width: "100%",
              transition: "color 150ms, border-color 150ms",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gold)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text3)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)"; }}
          >
            + Add Stock
          </button>
        </div>
      )}
    </div>
  );
}
