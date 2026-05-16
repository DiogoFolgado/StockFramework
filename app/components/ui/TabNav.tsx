"use client";

interface Tab {
  label: string;
  value: string;
}

interface TabNavProps {
  tabs:     Tab[];
  active:   string;
  onChange: (value: string) => void;
}

export function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          style={{
            background:   active === t.value ? "var(--bg4)"      : "transparent",
            color:        active === t.value ? "var(--gold)"      : "var(--text2)",
            border:       `1px solid ${active === t.value ? "var(--border2)" : "transparent"}`,
            borderRadius: "var(--radius)",
            padding:      "6px 16px",
            fontSize:      13,
            cursor:       "pointer",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
