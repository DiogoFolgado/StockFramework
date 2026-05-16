interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div style={{
      background:   "rgba(232,93,93,.1)",
      border:       "1px solid var(--red)",
      borderRadius: "var(--radius)",
      padding:      "14px 18px",
      color:        "var(--red)",
      marginBottom:  20,
    }}>
      ⚠ {message}
    </div>
  );
}
