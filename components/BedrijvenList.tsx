"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BedrijfRij } from "@/lib/bedrijven";
import { PainChip, TierBadge, Chip } from "./Chips";

const STATUSSEN = ["prospect", "bellen", "gecontacteerd", "klant"];

function slug(naam: string) {
  return encodeURIComponent(naam);
}

export default function BedrijvenList({ rijen }: { rijen: BedrijfRij[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<BedrijfRij[]>(rijen);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "alle") {
        if (statusFilter === "geen") {
          if (r.status) return false;
        } else if (r.status !== statusFilter) return false;
      }
      if (needle && !r.naam.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, statusFilter, q]);

  async function patch(id: number, body: Record<string, string>) {
    setBusy(id);
    setErr(null);
    try {
      const res = await fetch("/api/bedrijven", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Fout ${res.status}`);
      }
      setRows((rs) =>
        rs.map((r) => (r.id === id ? { ...r, ...body } : r))
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {["alle", ...STATUSSEN, "geen"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`mono-label rounded-md border px-3 py-1.5 text-[11px] transition-colors ${
                statusFilter === s
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-line bg-panel2 text-txt2 hover:text-txt"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek bedrijf…"
          className="min-w-0 flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-sm text-txt placeholder:text-muted focus:border-muted focus:outline-none"
        />
        <span className="mono-label text-[10px] text-muted">
          {filtered.length} bedrijven
        </span>
      </div>

      {err && (
        <div className="mb-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          Kon niet opslaan: {err}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="panel px-5 py-10 text-center text-sm text-txt2">
          Geen bedrijven gevonden.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <div
              key={r.naam}
              className="panel flex flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <PainChip score={r.pain} />
                  {r.laatste_tier && <TierBadge tier={r.laatste_tier} />}
                  {r.sector && <Chip>{r.sector}</Chip>}
                  <Chip title="Aantal signalen">{r.signaalCount} sig.</Chip>
                </div>
                <Link
                  href={`/bedrijven/${slug(r.naam)}`}
                  className="heading-serif text-[15px] text-txt hover:text-accent"
                >
                  {r.naam}
                </Link>
              </div>

              {r.id != null ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={r.status || ""}
                    disabled={busy === r.id}
                    onChange={(e) =>
                      r.id != null && patch(r.id, { status: e.target.value })
                    }
                    className="mono-label rounded-md border border-line bg-panel2 px-2 py-1.5 text-[11px] text-txt focus:border-muted focus:outline-none"
                  >
                    <option value="" disabled>
                      status…
                    </option>
                    {STATUSSEN.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    defaultValue={r.outcome || ""}
                    disabled={busy === r.id}
                    placeholder="uitkomst…"
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (r.id != null && v !== (r.outcome || ""))
                        patch(r.id, { outcome: v });
                    }}
                    className="w-36 rounded-md border border-line bg-panel2 px-2 py-1.5 text-xs text-txt placeholder:text-muted focus:border-muted focus:outline-none"
                  />
                </div>
              ) : (
                <span
                  className="mono-label text-[10px] text-muted"
                  title="Afgeleid uit signalen — nog geen bedrijf-record om te bewerken"
                >
                  alleen-lezen
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
