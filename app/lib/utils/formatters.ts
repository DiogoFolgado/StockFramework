export function newsAge(ts: number): string {
  const diff = Date.now() - ts * 1000;
  const m = Math.floor(diff / 60000);
  if (m < 2) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fmtDate(str: string): string {
  const days = Math.ceil((new Date(str).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 7)  return `${days}d — soon`;
  if (days <= 30) return `${days}d`;
  return str;
}
