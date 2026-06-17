"use client";

import { useState } from "react";

export default function ReportActions({
  report,
  filename = "monty-pulse-ochtend.txt",
}: {
  report: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: selecteer niets, toon gewoon niets
    }
  }

  function download() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        onClick={copy}
        className="mono-label rounded-md border border-line bg-panel2 px-3 py-1.5 text-[11px] text-txt2 transition-colors hover:border-muted hover:text-txt"
      >
        {copied ? "✓ gekopieerd" : "Kopieer rapport"}
      </button>
      <button
        onClick={download}
        className="mono-label rounded-md border border-accent/50 bg-accent/15 px-3 py-1.5 text-[11px] text-accent transition-colors hover:bg-accent/25"
      >
        Download
      </button>
    </>
  );
}
