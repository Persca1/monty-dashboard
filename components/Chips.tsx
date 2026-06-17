import type { Tier, PNiveau } from "@/lib/types";

export function TierBadge({ tier }: { tier: Tier | null }) {
  if (!tier) {
    return (
      <span className="mono-label rounded border border-line bg-panel2 px-2 py-0.5 text-[10px] text-muted">
        ?
      </span>
    );
  }
  const styles: Record<Tier, string> = {
    JA: "border-green/40 bg-green/15 text-green",
    MONITOR: "border-amber/40 bg-amber/15 text-amber",
    NEE: "border-line bg-panel2 text-muted",
  };
  return (
    <span
      className={`mono-label rounded border px-2 py-0.5 text-[10px] ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}

export function PChip({ p }: { p: PNiveau | null }) {
  if (!p) return null;
  const styles: Record<PNiveau, string> = {
    P1: "border-accent/50 bg-accent/15 text-accent",
    P2: "border-amber/50 bg-amber/15 text-amber",
    P3: "border-line bg-panel2 text-txt2",
  };
  return (
    <span
      className={`mono-label rounded border px-2 py-0.5 text-[10px] ${styles[p]}`}
    >
      {p}
    </span>
  );
}

export function PainChip({ score }: { score: number }) {
  const tone =
    score >= 70
      ? "border-accent/50 bg-accent/15 text-accent"
      : score >= 40
      ? "border-amber/50 bg-amber/15 text-amber"
      : "border-line bg-panel2 text-txt2";
  return (
    <span
      className={`mono-label rounded border px-2 py-0.5 text-[10px] ${tone}`}
      title="Pain score"
    >
      PAIN {score}
    </span>
  );
}

export function Chip({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="mono-label rounded border border-line bg-panel2 px-2 py-0.5 text-[10px] text-txt2"
    >
      {children}
    </span>
  );
}

export function UncertainFlag() {
  return (
    <span
      className="mono-label rounded border border-amber/50 bg-amber/10 px-2 py-0.5 text-[10px] text-amber"
      title="Lage zekerheid over bedrijfsmatch — controleer handmatig"
    >
      ⚠ lage zekerheid
    </span>
  );
}
