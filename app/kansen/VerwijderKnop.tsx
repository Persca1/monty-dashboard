"use client";

import { useState, useTransition } from "react";
import { verwijderSignaal } from "./actions";

export function VerwijderKnop({ id }: { id: number }) {
  const [bevestig, setBevestig] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (bevestig) {
    return (
      <span className="flex items-center gap-2 text-[10px]">
        <span className="text-muted">Zeker?</span>
        <button
          onClick={() => startTransition(() => verwijderSignaal(id))}
          disabled={isPending}
          className="mono-label text-red-400 hover:text-red-300"
        >
          {isPending ? "bezig…" : "ja, verwijder"}
        </button>
        <button
          onClick={() => setBevestig(false)}
          className="mono-label text-muted hover:text-txt"
        >
          annuleer
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setBevestig(true)}
      className="mono-label text-[10px] text-muted hover:text-red-400"
    >
      verwijder
    </button>
  );
}