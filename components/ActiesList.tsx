"use client";

import { useMemo, useState } from "react";
import type { Signaal } from "@/lib/types";
import { displayTitle, companyName, prioriteitOf, pNiveauOf } from "@/lib/fit";
import { PChip, Chip } from "./Chips";

interface Row extends Signaal {
  _done: boolean;
}

export default function ActiesList({ signalen }: { signalen: Signaal[] }) {
  const [rows, setRows] = useState<Row[]>(
    signalen.map((s) => ({ ...s, _done: Boolean(s.done) }))
  );
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a._done !== b._done) return a._done ? 1 : -1;
      return prioriteitOf(a) - prioriteitOf(b);
    });
  }, [rows]);

  async function toggle(id: number, next: boolean) {
    setBusy(id);
    setErr(null);
    // optimistisch
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, _done: next } : r)));
    try {
      const res = await fetch("/api/acties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Fout ${res.status}`);
      }
    } catch (e) {
      // terugdraaien
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, _done: !next } : r)));
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="panel px-5 py-10 text-center text-sm text-txt2">
        Geen openstaande acties. 🎉
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {err && (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          Kon niet opslaan: {err}
        </div>
      )}
      {sorted.map((s) => (
        <div
          key={s.id}
          className={`panel flex items-start gap-3 border-l-[3px] px-4 py-3 ${
            s._done ? "border-l-muted opacity-55" : "border-l-accent"
          }`}
        >
          <button
            onClick={() => toggle(s.id, !s._done)}
            disabled={busy === s.id}
            aria-label={s._done ? "Heropenen" : "Afvinken"}
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border text-[11px] transition-colors ${
              s._done
                ? "border-green/50 bg-green/20 text-green"
                : "border-line bg-panel2 text-transparent hover:border-muted"
            }`}
          >
            ✓
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <PChip p={pNiveauOf(s)} />
              <Chip title="Prioriteit (1 hoog – 5 laag)">
                PRIO {prioriteitOf(s)}
              </Chip>
              {companyName(s) && <Chip>{companyName(s)}</Chip>}
              {s.deadline && <Chip title="Deadline">{s.deadline}</Chip>}
            </div>
            <div
              className={`heading-serif text-[15px] leading-snug ${
                s._done ? "text-txt2 line-through" : "text-txt"
              }`}
            >
              {displayTitle(s)}
            </div>
            {(s.waarom_nu || "") && (
              <div className="mt-1 text-xs text-txt2">{s.waarom_nu}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
