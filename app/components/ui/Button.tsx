"use client";

import { ReactNode, CSSProperties } from "react";

interface ButtonProps {
  children:  ReactNode;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  variant?:  "primary" | "secondary" | "danger";
  size?:     "sm" | "md";
  disabled?: boolean;
  style?:    CSSProperties;
}

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary:   { background: "var(--gold)",        color: "#000",           borderColor: "transparent" },
  secondary: { background: "transparent",         color: "var(--text2)",   borderColor: "var(--border2)" },
  danger:    { background: "transparent",         color: "var(--red)",     borderColor: "var(--border)" },
};

export function Button({
  children, onClick, type = "button", variant = "secondary", size = "md", disabled, style,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: "var(--radius)",
        cursor:       disabled ? "not-allowed" : "pointer",
        fontFamily:   "inherit",
        fontSize:     size === "sm" ? 12 : 13,
        padding:      size === "sm" ? "4px 10px" : "8px 16px",
        fontWeight:   variant === "primary" ? 700 : 400,
        border:       "1px solid",
        opacity:      disabled ? 0.5 : 1,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
