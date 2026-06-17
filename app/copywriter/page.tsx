import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { fitOf, shouldReact, displayTitle, companyName, themeOf } from "@/lib/fit";
import { topThemas } from "@/lib/briefing";
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

  return (
    <>
      <PageHeader
        title="Copywriter"
        subtitle="Schrijf LinkedIn-content via Claude — reageren op signalen of zelf posten"
      />
      <Copywriter items={items} themas={themas} />
    </>
  );
}
