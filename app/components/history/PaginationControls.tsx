import { Button } from "@/components/ui/Button";

interface PaginationControlsProps {
  page:   number;
  pages:  number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({ page, pages, onPrev, onNext }: PaginationControlsProps) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
      <Button onClick={onPrev} disabled={page <= 1} size="sm">← Prev</Button>
      <span style={{ padding: "6px 14px", color: "var(--text3)", fontSize: 12 }}>
        Page {page} of {pages}
      </span>
      <Button onClick={onNext} disabled={page >= pages} size="sm">Next →</Button>
    </div>
  );
}
