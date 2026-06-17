import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchBedrijfByNaam,
  fetchSignalenVoorBedrijf,
  fetchOutcomes,
} from "@/lib/queries";
import { painOf, tierOf, tierRank } from "@/lib/fit";
import {
  PageHeader,
  ConfigNotice,
  ErrorNotice,
  EmptyState,
} from "@/components/ui";
import { PainChip, TierBadge, Chip } from "@/components/Chips";
import DetailCard from "@/components/DetailCard";

export const dynamic = "force-dynamic";

export default async function BedrijfDetail({
  params,
}: {
  params: { naam: string };
}) {
  const naam = decodeURIComponent(params.naam);

  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title={naam} />
        <ConfigNotice />
      </>
    );
  }

  let bedrijf, signalen, outcomes;
  try {
    bedrijf = await fetchBedrijfByNaam(naam);
    signalen = await fetchSignalenVoorBedrijf(naam);
    outcomes = bedrijf ? await fetchOutcomes(bedrijf.id) : [];
  } catch (e) {
    return (
      <>
        <PageHeader title={naam} />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const sorted = [...signalen].sort((a, b) => {
    const r = tierRank(tierOf(a)) - tierRank(tierOf(b));
    if (r !== 0) return r;
    return painOf(b) - painOf(a);
  });
  const maxPain = signalen.reduce((m, s) => Math.max(m, painOf(s)), 0);

  return (
    <>
      <div className="mb-2">
        <Link
          href="/bedrijven"
          className="mono-label text-[11px] text-txt2 hover:text-txt"
        >
          ← Bedrijven
        </Link>
      </div>
      <PageHeader title={naam} subtitle={`${signalen.length} signalen`}>
        <PainChip score={bedrijf?.pain_score ?? maxPain} />
        {bedrijf?.laatste_tier && <TierBadge tier={bedrijf.laatste_tier} />}
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {bedrijf?.sector && <Chip>{bedrijf.sector}</Chip>}
        {bedrijf?.status && <Chip title="Status">{bedrijf.status}</Chip>}
        {bedrijf?.outcome && <Chip title="Uitkomst">{bedrijf.outcome}</Chip>}
        {!bedrijf && (
          <span className="mono-label text-[10px] text-muted">
            Geen bedrijf-record — afgeleid uit signalen
          </span>
        )}
      </div>

      {outcomes.length > 0 && (
        <div className="panel mb-6 p-4">
          <h2 className="mono-label mb-3 text-[11px] text-txt2">Uitkomsten</h2>
          <ul className="space-y-2 text-sm">
            {outcomes.map((o) => (
              <li key={o.id} className="flex gap-3">
                <span className="mono-label shrink-0 text-[10px] text-muted">
                  {o.datum?.slice(0, 10) || "—"}
                </span>
                <span className="text-txt">
                  <span className="text-accent">{o.soort}</span>
                  {o.notitie ? ` — ${o.notitie}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mono-label mb-3 text-[11px] text-txt2">Signalen</h2>
      {sorted.length === 0 ? (
        <EmptyState>Geen signalen voor dit bedrijf.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((s) => (
            <DetailCard key={s.id} signaal={s} />
          ))}
        </div>
      )}
    </>
  );
}
