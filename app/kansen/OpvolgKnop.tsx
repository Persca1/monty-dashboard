"use client";

import { useTransition } from "react";
import { toggleOpvolgen } from "./actions";

export function OpvolgKnop({ id, opvolgen }: { id: number; opvolgen: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleOpvolgen(id, !opvolgen))}
      disabled={isPending}
      className={`mono-label text-[10px] hover:text-accent ${opvolgen ? "text-accent" : "text-muted"}`}
    >
      {isPending ? "bezig…" : opvolgen ? "★ opvolgen" : "☆ opvolgen"}
    </button>
  );
}