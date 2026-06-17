import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import {
  topThemas,
  topLeads,
  topArtikels,
  topKansen,
  topPijnBedrijven,
  buildReport,
} from "@/lib/briefing";
import {
  displayTitle,
  companyName,
  painOf,
  relevantieOf,
  fitOf,
} from "@/lib/fit";
import { PageHeader, ConfigNotice, ErrorNotice, PanelLink } from "@/components/ui";
import { PainChip } from "@/components/Chips";
import ReportActions from "@/components/ReportActions";

export const dynamic = "force-dynamic";

function vandaagLeesbaar(): string {
  return new Date().toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="mono-label text-[11px] text-txt2">{title}</h2>
        {href && <PanelLink href={href}>alles</PanelLink>}
      </div>
      <div className="flex-1 space-y-2">{children}</div>
    </section>
  );
}

export default async function OchtendPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Ochtend" subtitle={vandaagLeesbaar()} />
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
        <PageHeader title="Ochtend" subtitle={vandaagLeesbaar()} />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const trends = topThemas(signalen, 10);
  const leads = topLeads(signalen, 10);
  const artikels = topArtikels(signalen, 5);
  const kansen = topKansen(signalen, 3);
  const pijn = topPijnBedrijven(signalen, 3);
  const report = buildReport(signalen, vandaagLeesbaar());

  return (
    <>
      <PageHeader title="Ochtend" subtitle={vandaagLeesbaar()}>
        <ReportActions report={report} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Section title="Top 10 trends" href="/trends">
          {trends.length === 0 && (
            <p className="text-sm text-muted">Geen thema&apos;s gevonden.</p>
          )}
          {trends.map((t, i) => (
            <div
              key={t.thema}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0 truncate text-txt">
                <span className="mono-label mr-2 text-[10px] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t.thema}
              </span>
              <span className="mono-label shrink-0 text-[10px] text-txt2">
                {t.aantal}×
              </span>
            </div>
          ))}
        </Section>

        <Section title="Top 10 leads · tier JA" href="/bedrijven">
          {leads.length === 0 && (
            <p className="text-sm text-muted">Geen JA-leads vandaag.</p>
          )}
          {leads.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <PainChip score={painOf(s)} />
              <span className="min-w-0 flex-1 truncate text-txt">
                {companyName(s) || displayTitle(s)}
              </span>
            </div>
          ))}
        </Section>

        <Section title="Top 5 artikels" href="/archief">
          {artikels.map((s) => (
            <div key={s.id} className="flex items-start gap-2 text-sm">
              <span className="mono-label mt-0.5 shrink-0 text-[10px] text-muted">
                {relevantieOf(s)}
              </span>
              <span className="min-w-0 flex-1 text-txt">{displayTitle(s)}</span>
            </div>
          ))}
        </Section>

        <Section title="Top 3 contentkansen" href="/kansen">
          {kansen.length === 0 && (
            <p className="text-sm text-muted">Geen kansen gevonden.</p>
          )}
          {kansen.map((s) => {
            const k = fitOf(s).kans || {};
            return (
              <div key={s.id} className="panel-2 p-2.5 text-sm">
                <div className="mono-label mb-1 text-[10px] text-accent">
                  {k.type}
                </div>
                <div className="text-txt">{k.omschrijving || displayTitle(s)}</div>
                {k.voor_wie && (
                  <div className="mt-1 text-xs text-txt2">
                    voor: {k.voor_wie}
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        <Section title="Top 3 bedrijven met pijn" href="/bedrijven">
          {pijn.length === 0 && (
            <p className="text-sm text-muted">Geen bedrijven met pijn.</p>
          )}
          {pijn.map((b) => (
            <div key={b.naam} className="flex items-center gap-2 text-sm">
              <PainChip score={b.pain} />
              <span className="min-w-0 flex-1 truncate text-txt">{b.naam}</span>
            </div>
          ))}
        </Section>

        <Section title="Vandaag in één oogopslag" href="/vandaag">
          <div className="grid grid-cols-2 gap-2">
            <Mini label="Signalen" value={signalen.length} />
            <Mini
              label="JA-leads"
              value={leads.length}
              tone="text-green"
            />
            <Mini label="Kansen" value={kansen.length} tone="text-accent" />
            <Mini label="Trends" value={trends.length} />
          </div>
        </Section>
      </div>
    </>
  );
}

function Mini({
  label,
  value,
  tone = "text-txt",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="panel-2 px-3 py-2">
      <div className={`heading-serif text-xl ${tone}`}>{value}</div>
      <div className="mono-label text-[10px] text-muted">{label}</div>
    </div>
  );
}
