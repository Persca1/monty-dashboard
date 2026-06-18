import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { fitOf, shouldReact, displayTitle, companyName, themeOf } from "@/lib/fit";
import { topThemas, topKansen, topArtikels } from "@/lib/briefing";
import { klantkansOf, relevantieOf } from "@/lib/fit";
import { PageHeader, ConfigNotice, ErrorNotice } from "@/components/ui";
import Copywriter, { type ReageerItem } from "@/components/Copywriter";

export const dynamic = "force-dynamic";

export default async function CopywriterPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Copywriter" />
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
        <PageHeader title="Copywriter" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const items: ReageerItem[] = signalen.filter(shouldReact).map((s) => {
    const fit = fitOf(s);
    return {
      id: s.id,
      titel: displayTitle(s),
      bedrijf: companyName(s),
      advies: fit.post?.advies || "",
      invalshoek: fit.post?.invalshoek || "",
      thema: themeOf(s),
      samenvatting: fit.artikel?.samenvatting || "",
    };
  });

  const themas = topThemas(signalen, 8).map((t) => t.thema);

  // Top 6 voor LinkedIn-posts: kansen eerst (op klantkans), aangevuld met sterkste artikels
  const kansen = topKansen(signalen, 6);
  const gebruikt = new Set(kansen.map((s) => s.id));
  const aanvulling = topArtikels(signalen, 12).filter((s) => !gebruikt.has(s.id));
  const top6Bron = [...kansen, ...aanvulling].slice(0, 6);
  const top6 = top6Bron.map((s) => {
    const fit = fitOf(s);
    return {
      id: s.id,
      titel: displayTitle(s),
      bedrijf: companyName(s),
      thema: themeOf(s),
      samenvatting: fit.artikel?.samenvatting || s.korte_samenvatting || "",
      waarom: s.waarom_nu || fit.artikel?.waarom_nu || "",
      score: klantkansOf(s) || relevantieOf(s),
    };
  });

  return (
    <>
      <PageHeader
        title="Copywriter"
        subtitle="Schrijf LinkedIn-content via Claude — reageren op signalen of zelf posten"
      />
      <Copywriter items={items} themas={themas} top6={top6} />
    </>
  );
}
