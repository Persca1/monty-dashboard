import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { themeOf } from "@/lib/fit";
import { topThemas, filterPeriode, type Periode } from "@/lib/briefing";
import {
  PageHeader,
  ConfigNotice,
  ErrorNotice,
  EmptyState,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: { periode?: string };
}) {
  const geldigePeriodes: Periode[] = ["vandaag", "week", "maand", "alles"];
  const periode: Periode = geldigePeriodes.includes(searchParams.periode as Periode)
    ? (searchParams.periode as Periode)
    : "alles";

  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Trends" />
        <ConfigNotice />
      </>
    );
  }

  let signalen;
  try {
    signalen = await fetchSignalen();
  } catch (e) {
    return (
      <>
        <PageHeader title="Trends" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const gefilterd = filterPeriode(signalen, periode);
  const themas = topThemas(gefilterd, 20);
  const max = themas.length > 0 ? themas[0].aantal : 1;
  const metThema = gefilterd.filter((s) => themeOf(s)).length;
  

  return (
    <>
      <PageHeader
        title="Trends"
        subtitle={`Meest voorkomende thema's over ${metThema} signalen`}
      />
<div className="flex gap-2 mb-4">
        {([
          ["vandaag", "Vandaag"],
          ["week", "Deze week"],
          ["maand", "Deze maand"],
          ["alles", "Alles"],
        ] as const).map(([waarde, label]) => (
          
            <a key={waarde}
            href={`/trends?periode=${waarde}`}
            className={
              "mono-label rounded px-3 py-1.5 text-[11px] " +
              (periode === waarde
                ? "bg-accent/80 text-white"
                : "bg-panel2 text-muted hover:text-txt")
            }
          >
            {label}
          </a>
        ))}
      </div>

      {themas.length === 0 ? (
        <EmptyState>Nog geen thema&apos;s om te tonen.</EmptyState>
      ) : (
        <div className="panel space-y-3 p-5">
          {themas.map((t, i) => {
            const pct = Math.round((t.aantal / max) * 100);
            return (
              <div key={t.thema} className="flex items-center gap-3">
                <div className="mono-label w-6 shrink-0 text-right text-[10px] text-muted">
                  {i + 1}
                </div>
                <div className="w-40 shrink-0 truncate text-sm text-txt md:w-56">
                  {t.thema}
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded bg-panel2">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-accent/80"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mono-label w-8 shrink-0 text-right text-[11px] text-txt2">
                  {t.aantal}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
