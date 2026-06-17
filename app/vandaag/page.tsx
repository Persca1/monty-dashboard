import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalenVoorDag } from "@/lib/queries";
import { tierOf, tierRank, painOf, todayISO } from "@/lib/fit";
import {
  PageHeader,
  ConfigNotice,
  ErrorNotice,
  EmptyState,
  Counter,
} from "@/components/ui";
import DetailCard from "@/components/DetailCard";

export const dynamic = "force-dynamic";

function vandaagLeesbaar(): string {
  return new Date().toLocaleDateString("nl-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function VandaagPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Vandaag" subtitle={vandaagLeesbaar()} />
        <ConfigNotice />
      </>
    );
  }

  let signalen;
  try {
    signalen = await fetchSignalenVoorDag(todayISO());
  } catch (e) {
    return (
      <>
        <PageHeader title="Vandaag" subtitle={vandaagLeesbaar()} />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const sorted = [...signalen].sort((a, b) => {
    const r = tierRank(tierOf(a)) - tierRank(tierOf(b));
    if (r !== 0) return r;
    return painOf(b) - painOf(a);
  });

  const tel = {
    totaal: signalen.length,
    ja: signalen.filter((s) => tierOf(s) === "JA").length,
    monitor: signalen.filter((s) => tierOf(s) === "MONITOR").length,
    nee: signalen.filter((s) => tierOf(s) === "NEE").length,
  };

  return (
    <>
      <PageHeader
        title="Vandaag"
        subtitle={`${vandaagLeesbaar()} · gesorteerd op tier`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Counter label="Signalen" value={tel.totaal} />
        <Counter label="Tier JA" value={tel.ja} tone="green" />
        <Counter label="Monitor" value={tel.monitor} tone="amber" />
        <Counter label="Nee" value={tel.nee} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState>
          Geen signalen voor vandaag. De n8n-workflow vult de database
          automatisch — kom later terug of bekijk het{" "}
          <a className="text-accent hover:underline" href="/archief">
            archief
          </a>
          .
        </EmptyState>
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
