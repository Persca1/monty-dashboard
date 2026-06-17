import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { fitOf, hasKans, displayTitle, companyName, klantkansOf } from "@/lib/fit";
import {
  PageHeader,
  ConfigNotice,
  ErrorNotice,
  EmptyState,
} from "@/components/ui";
import { Chip } from "@/components/Chips";

export const dynamic = "force-dynamic";

const TYPE_TONE: Record<string, string> = {
  content: "text-accent",
  event: "text-green",
  kanaal: "text-amber",
  speech: "text-accent",
  analyse: "text-txt2",
};

export default async function KansenPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Kansen" />
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
        <PageHeader title="Kansen" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const kansen = signalen
    .filter(hasKans)
    .sort((a, b) => klantkansOf(b) - klantkansOf(a));

  return (
    <>
      <PageHeader
        title="Kansen"
        subtitle={`${kansen.length} content- en zakelijke kansen uit de signalen`}
      />

      {kansen.length === 0 ? (
        <EmptyState>Geen kansen gevonden in de huidige signalen.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {kansen.map((s) => {
            const k = fitOf(s).kans || {};
            const type = (k.type || "").toLowerCase();
            return (
              <div
                key={s.id}
                className="panel border-l-[3px] border-l-accent p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className={`mono-label text-[11px] ${
                      TYPE_TONE[type] || "text-txt2"
                    }`}
                  >
                    {k.type}
                  </span>
                  {companyName(s) && <Chip>{companyName(s)}</Chip>}
                </div>
                <h3 className="heading-serif mb-2 text-[15px] leading-snug text-txt">
                  {k.omschrijving || displayTitle(s)}
                </h3>
                <dl className="space-y-1.5 text-sm">
                  {k.voor_wie && (
                    <div className="flex gap-2">
                      <dt className="mono-label shrink-0 text-[10px] text-muted">
                        voor wie
                      </dt>
                      <dd className="text-txt2">{k.voor_wie}</dd>
                    </div>
                  )}
                  {k.actie && (
                    <div className="flex gap-2">
                      <dt className="mono-label shrink-0 text-[10px] text-muted">
                        actie
                      </dt>
                      <dd className="text-txt2">{k.actie}</dd>
                    </div>
                  )}
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
