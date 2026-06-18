import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { displayTitle, companyName, klantkansOf } from "@/lib/fit";
import { PageHeader, ConfigNotice, ErrorNotice, EmptyState } from "@/components/ui";
import { Chip } from "@/components/Chips";
import { VerwijderKnop } from "../kansen/VerwijderKnop";
import { GelezenKnop } from "../kansen/GelezenKnop";
import { OpvolgKnop } from "../kansen/OpvolgKnop";

export const dynamic = "force-dynamic";

function formatDatum(d: string | null): string {
  if (!d) return "";
  const datum = new Date(d);
  if (isNaN(datum.getTime())) return "";
  return datum.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
}

export default async function OpvolgenPage() {
  if (!isSupabaseConfigured()) {
    return (<><PageHeader title="Opvolgen" /><ConfigNotice /></>);
  }

  let signalen;
  try {
    signalen = await fetchSignalen();
  } catch (e) {
    return (<><PageHeader title="Opvolgen" /><ErrorNotice message={(e as Error).message} /></>);
  }

  const opvolgItems = signalen
    .filter((s) => !s.verwijderd)
    .filter((s) => s.opvolgen)
    .sort((a, b) => klantkansOf(b) - klantkansOf(a));

  return (
    <>
      <PageHeader title="Opvolgen" subtitle={`${opvolgItems.length} signalen die je opvolgt`} />
      {opvolgItems.length === 0 ? (
        <EmptyState>Je volgt nog geen signalen op.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {opvolgItems.map((s) => (
            <div key={s.id} className={`panel border-l-[3px] border-l-accent p-4 ${s.gelezen ? "opacity-50" : ""}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {s.bron_naam && <span className="mono-label text-[11px] text-accent">{s.bron_naam}</span>}
                  {s.gepubliceerd_op && <span className="text-[11px] text-muted">{formatDatum(s.gepubliceerd_op)}</span>}
                </div>
                {companyName(s) && <Chip>{companyName(s)}</Chip>}
              </div>
              <h3 className="heading-serif mb-2 text-[15px] leading-snug text-txt">{displayTitle(s)}</h3>
              {s.waarom_nu && <p className="mb-3 text-sm leading-relaxed text-txt2">{s.waarom_nu}</p>}
              <div className="flex items-center justify-between gap-2">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="mono-label text-[10px] text-muted hover:text-accent">lees artikel →</a>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <OpvolgKnop id={s.id} opvolgen={!!s.opvolgen} />
                  <GelezenKnop id={s.id} gelezen={!!s.gelezen} />
                  <VerwijderKnop id={s.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
