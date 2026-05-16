import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children:   ReactNode;
  className?: string;
  style?:     CSSProperties;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background:   "var(--bg2)",
        border:       "1px solid var(--border)",
        borderRadius: "var(--radius)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
