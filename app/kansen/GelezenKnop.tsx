"use client";

import { useTransition } from "react";
import { toggleGelezen } from "./actions";

export function GelezenKnop({ id, gelezen }: { id: number; gelezen: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleGelezen(id, !gelezen))}
      disabled={isPending}
      className="mono-label text-[10px] text-muted hover:text-accent"
    >
      {isPending ? "bezig…" : gelezen ? "markeer ongelezen" : "markeer gelezen"}
    </button>
  );
}