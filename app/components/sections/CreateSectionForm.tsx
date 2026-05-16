"use client";

import { useState, CSSProperties } from "react";
import { Button } from "@/components/ui/Button";

interface FormState {
  name:  string;
  icon:  string;
  color: string;
}

interface CreateSectionFormProps {
  form:     FormState;
  onChange: (form: FormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ICONS = [
  "📊","📈","📉","💰","💵","💹","🏦","💎","🔥","⭐",
  "🤖","💻","📱","🌐","🔬","🧬","💊","🏥","⚡","🌱",
  "🛒","🛍️","🚀","🛡️","✈️","🏠","🏗️","⛽","🔋","💡",
  "🌍","🌊","🧪","🎯","🏆","💫","🔮","🎲","🧠","👁️",
  "🦾","🔑","🗝️","📡","🛸","🧩","🎮","🎬","🎵","🏋️",
];

const inputStyle: CSSProperties = {
  background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7,
  color: "var(--text)", padding: "8px 12px", fontSize: 14, outline: "none",
};

export function CreateSectionForm({ form, onChange, onSubmit, onCancel }: CreateSectionFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function pickIcon(icon: string) {
    onChange({ ...form, icon });
    setPickerOpen(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
        padding: 20, marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>NAME</div>
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="Section name…"
            style={inputStyle}
          />
        </div>

        {/* Icon picker trigger */}
        <div style={{ position: "relative" }}>
          <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>ICON</div>
          <button
            type="button"
            onClick={() => setPickerOpen(o => !o)}
            style={{
              width: 52, height: 38, fontSize: 22, background: "var(--bg3)",
              border: `1px solid ${pickerOpen ? "var(--gold)" : "var(--border2)"}`,
              borderRadius: 7, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              transition: "border-color 150ms",
            }}
          >
            {form.icon}
          </button>

          {pickerOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 400,
              background: "var(--bg2)", border: "1px solid var(--border2)",
              borderRadius: 10, padding: 10,
              display: "grid", gridTemplateColumns: "repeat(10, 34px)", gap: 4,
              boxShadow: "0 12px 36px rgba(0,0,0,.6)",
              width: 390,
            }}>
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => pickIcon(icon)}
                  style={{
                    width: 34, height: 34, fontSize: 18, background: form.icon === icon ? "var(--bg4)" : "none",
                    border: form.icon === icon ? "1px solid var(--gold)" : "1px solid transparent",
                    borderRadius: 6, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 80ms",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg4)")}
                  onMouseLeave={e => (e.currentTarget.style.background = form.icon === icon ? "var(--bg4)" : "none")}
                >
                  {icon}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}>COLOUR</div>
          <input
            type="color"
            value={form.color}
            onChange={(e) => onChange({ ...form, color: e.target.value })}
            style={{ width: 44, height: 38, border: "none", background: "none", cursor: "pointer" }}
          />
        </div>

        <Button type="submit" variant="primary">Create</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
