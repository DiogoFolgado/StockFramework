import { SIGNAL_COLORS } from "@/lib/utils/colors";

interface BadgeProps {
  signal: string;
  size?: "sm" | "md";
}

export function Badge({ signal, size = "md" }: BadgeProps) {
  const color = SIGNAL_COLORS[signal] ?? "var(--text)";
  return (
    <span style={{
      padding:     size === "sm" ? "2px 8px" : "3px 10px",
      borderRadius: 5,
      background:  color + "22",
      color,
      fontSize:    size === "sm" ? 10 : 11,
      fontFamily:  "'Space Mono', monospace",
      border:      `1px solid ${color}44`,
    }}>
      {signal}
    </span>
  );
}
