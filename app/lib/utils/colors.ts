export const SIGNAL_COLORS: Record<string, string> = {
  "STRONG BUY":  "#4cbb8a",
  "BUY":         "#7de8b0",
  "NEUTRAL":     "#d4a843",
  "SELL":        "#e87d3e",
  "STRONG SELL": "#e85d5d",
};

export const PILLAR_COLORS: Record<string, string> = {
  fundamental: "#d4a843",
  technical:   "#4d9de0",
  entropy:     "#9b72cf",
  semantic:    "#4cbb8a",
};

export function signalColor(signal: string): string {
  return SIGNAL_COLORS[signal] ?? "var(--text)";
}

export function scoreColor(score: number): string {
  if (score >= 8.5) return "var(--green)";
  if (score >= 8.0) return "#a8d84e";
  if (score >= 7.5) return "var(--gold)";
  return "var(--text2)";
}

export function sigClass(signal: string): string {
  if (signal.includes("STRONG BUY"))  return "signal-sb";
  if (signal.includes("BUY"))         return "signal-b";
  if (signal.includes("STRONG SELL")) return "signal-ss";
  if (signal.includes("SELL"))        return "signal-s";
  return "signal-n";
}
