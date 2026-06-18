"use client";

import { useState } from "react";

export interface ReageerItem {
  id: number;
  titel: string;
  bedrijf: string;
  advies: string;
  invalshoek: string;
  thema: string;
  samenvatting: string;
}

export interface Top6Item {
  id: number;
  titel: string;
  bedrijf: string;
  thema: string;
  samenvatting: string;
  waarom: string;
  score: number;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* noop */
        }
      }}
      className="mono-label rounded-md border border-line bg-panel2 px-2.5 py-1 text-[10px] text-txt2 hover:border-muted hover:text-txt"
    >
      {copied ? "✓ gekopieerd" : "Kopieer"}
    </button>
  );
}

function ResultBox({ text }: { text: string }) {
  return (
    <div className="panel-2 mt-3 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="mono-label text-[10px] text-green">resultaat</span>
        <CopyButton text={text} />
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-txt">
        {text}
      </pre>
    </div>
  );
}

async function callCopywriter(body: Record<string, unknown>): Promise<string> {
  const res = await fetch("/api/copywriter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || `Fout ${res.status}`);
  return j.text as string;
}

function ReageerKaart({ item }: { item: ReageerItem }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function schrijf() {
    setLoading(true);
    setErr(null);
    try {
      const t = await callCopywriter({
        mode: "react",
        advies: item.advies,
        invalshoek: item.invalshoek,
        thema: item.thema,
        titel: item.titel,
        samenvatting: item.samenvatting,
      });
      setText(t);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel border-l-[3px] border-l-accent p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="mono-label rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
          {item.advies}
        </span>
        {item.bedrijf && (
          <span className="mono-label rounded border border-line bg-panel2 px-2 py-0.5 text-[10px] text-txt2">
            {item.bedrijf}
          </span>
        )}
      </div>
      <h3 className="heading-serif text-[15px] leading-snug text-txt">
        {item.titel}
      </h3>
      {item.invalshoek && (
        <p className="mt-1.5 text-sm text-txt2">
          <span className="mono-label text-[10px] text-muted">invalshoek</span>{" "}
          {item.invalshoek}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={schrijf}
          disabled={loading}
          className="mono-label rounded-md border border-accent/50 bg-accent/15 px-3 py-1.5 text-[11px] text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
        >
          {loading ? "Schrijft…" : text ? "Opnieuw schrijven" : "Schrijf het"}
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
          {err}
        </div>
      )}
      {text && <ResultBox text={text} />}
    </div>
  );
}

export default function Copywriter({
  items,
  themas,
  top6,
}: {
  items: ReageerItem[];
  themas: string[];
  top6: Top6Item[];
}) {
  const [ideas, setIdeas] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [posts, setPosts] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsErr, setPostsErr] = useState<string | null>(null);

  async function genereerPosts() {
    setPostsLoading(true);
    setPostsErr(null);
    try {
      const t = await callCopywriter({ mode: "top6", signalen: top6 });
      setPosts(t);
    } catch (e) {
      setPostsErr((e as Error).message);
    } finally {
      setPostsLoading(false);
    }
  }

  async function genereer() {
    setLoading(true);
    setErr(null);
    try {
      const t = await callCopywriter({ mode: "ideas", themas });
      setIdeas(t);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <section className="mb-8">
      <h2 className="mono-label mb-3 text-[11px] text-txt2">
        Top 6 posts · automatisch
      </h2>
      <div className="panel p-4">
        <p className="mb-3 text-sm text-txt2">
          Pakt de 6 sterkste signalen van het dashboard en schrijft er
          kant-en-klare LinkedIn-posts bij.
          {top6.length > 0 ? ` (${top6.length} geselecteerd)` : " (geen signalen)"}
        </p>
        <button
          onClick={genereerPosts}
          disabled={postsLoading || top6.length === 0}
          className="mono-label rounded-md border border-accent/50 bg-accent/15 px-3 py-1.5 text-[11px] text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
        >
          {postsLoading ? "Schrijft 6 posts…" : "Genereer 6 posts"}
        </button>
        {postsErr && (
          <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
            {postsErr}
          </div>
        )}
        {posts && <ResultBox text={posts} />}
      </div>
    </section>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <section>
        <h2 className="mono-label mb-3 text-[11px] text-txt2">
          Reageren op · {items.length}
        </h2>
        {items.length === 0 ? (
          <div className="panel px-5 py-10 text-center text-sm text-txt2">
            Geen signalen met postadvies (≠ negeren).
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <ReageerKaart key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mono-label mb-3 text-[11px] text-txt2">
          Zelf posten · 3 ideeën
        </h2>
        <div className="panel p-4">
          <p className="mb-3 text-sm text-txt2">
            Genereert 3 postvoorstellen op basis van de top-thema&apos;s
            {themas.length > 0 ? `: ${themas.slice(0, 5).join(", ")}.` : "."}
          </p>
          <button
            onClick={genereer}
            disabled={loading}
            className="mono-label rounded-md border border-accent/50 bg-accent/15 px-3 py-1.5 text-[11px] text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
          >
            {loading ? "Genereert…" : "Geef 3 ideeën"}
          </button>
          {err && (
            <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
              {err}
            </div>
          )}
          {ideas && <ResultBox text={ideas} />}
        </div>
      </section>
    </div>
    </>
  );
}
