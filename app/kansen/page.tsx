import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { hasKans, displayTitle, companyName, klantkansOf } from "@/lib/fit";
import { PageHeader, ConfigNotice, ErrorNotice, EmptyState } from "@/components/ui";
import { Chip } from "@/components/Chips";

export const dynamic = "force-dynamic";

export default async function KansenPage() {
  if (!isSupabaseConfigured()) {
    return (<><PageHeader title="Kansen" /><ConfigNotice /></>);
  }

  let signalen;
  try {
    signalen = await fetchSignalen();
  } catch (e) {
    return (<><PageHeader title="Kansen" /><ErrorNotice message={(e as Error).message} /></>);
  }

  const kansen = signalen.filter(hasKans).sort((a, b) => klantkansOf(b) - klantkansOf(a));

  return (
    <>
      <PageHeader title="Kansen" subtitle={`${kansen.length} content- en zakelijke kansen uit de signalen`} />
      {kansen.length === 0 ? (
        <EmptyState>Geen kansen gevonden in de huidige signalen.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {kansen.map((s) => (
            <div key={s.id} className="panel border-l-[3px] border-l-accent p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                {s.bron_naam && <span className="mono-label text-[11px] text-accent">{s.bron_naam}</span>}
                {companyName(s) && <Chip>{companyName(s)}</Chip>}
              </div>
              <h3 className="heading-serif mb-2 text-[15px] leading-snug text-txt">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">{displayTitle(s)}</a>
                ) : (
                  displayTitle(s)
                )}
              </h3>
              {s.waarom_nu && <p className="mb-3 text-sm leading-relaxed text-txt2">{s.waarom_nu}</p>}
              {s.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="mono-label text-[10px] text-muted hover:text-accent">lees artikel →</a>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}