"use client";

interface Props {
  show: boolean;
  onDismiss: () => void;
}

export function NotificationBanner({ show, onDismiss }: Props) {
  if (!show) return null;

  return (
    <div
      style={{
        background: "rgba(212,168,67,0.08)",
        border: "1px solid rgba(212,168,67,0.4)",
        borderRadius: "var(--radius)",
        padding: "12px 18px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ color: "var(--gold)", fontSize: 13 }}>
        ◉ New episode available — scroll down to see it
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text3)",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
