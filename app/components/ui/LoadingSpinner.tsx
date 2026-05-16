interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>
      <div style={{ fontSize: 28, marginBottom: 12, animation: "spin 1s linear infinite" }}>◎</div>
      {message && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{message}</div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
