"use client";

import { useMemo, useState } from "react";
import type { Signaal, Tier } from "@/lib/types";
import { tierOf, displayTitle, companyName } from "@/lib/fit";
import DetailCard from "./DetailCard";

const TIERS: (Tier | "ALLE")[] = ["ALLE", "JA", "MONITOR", "NEE"];
const PAGE = 60;

export default function ArchiefList({ signalen }: { signalen: Signaal[] }) {
  const [tier, setTier] = useState<Tier | "ALLE">("ALLE");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return signalen.filter((s) => {
      if (tier !== "ALLE" && tierOf(s) !== tier) return false;
      if (!needle) return true;
      const hay = `${displayTitle(s)} ${s.titel || ""} ${companyName(s)}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [signalen, tier, q]);

  const shown = filtered.slice(0, limit);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTier(t);
                setLimit(PAGE);
              }}
              className={`mono-label rounded-md border px-3 py-1.5 text-[11px] transition-colors ${
                tier === t
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-line bg-panel2 text-txt2 hover:text-txt"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Zoek op titel of bedrijf…"
          className="min-w-0 flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-sm text-txt placeholder:text-muted focus:border-muted focus:outline-none"
        />
        <span className="mono-label text-[10px] text-muted">
          {filtered.length} resultaten
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="panel px-5 py-10 text-center text-sm text-txt2">
          Geen signalen die aan je filter voldoen.
        </div>
      ) : (
        <div className="space-y-2.5">
          {shown.map((s) => (
            <DetailCard key={s.id} signaal={s} />
          ))}
        </div>
      )}

      {filtered.length > limit && (
        <div className="mt-5 text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="mono-label rounded-md border border-line bg-panel2 px-4 py-2 text-[11px] text-txt2 transition-colors hover:border-muted hover:text-txt"
          >
            Toon meer ({filtered.length - limit} resterend)
          </button>
        </div>
      )}
    </>
  );
}
