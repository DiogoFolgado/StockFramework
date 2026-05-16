interface EmptyStateProps {
  message: string;
  icon?:   string;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div style={{
      background:   "var(--bg2)",
      border:       "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding:       40,
      textAlign:    "center",
      color:        "var(--text3)",
    }}>
      {icon && <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>}
      {message}
    </div>
  );
}
