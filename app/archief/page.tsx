import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { PageHeader, ConfigNotice, ErrorNotice } from "@/components/ui";
import ArchiefList from "@/components/ArchiefList";

export const dynamic = "force-dynamic";

export default async function ArchiefPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Archief" />
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
        <PageHeader title="Archief" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Archief"
        subtitle={`Alle ${signalen.length} signalen · filter op tier en zoek`}
      />
      <ArchiefList signalen={signalen} />
    </>
  );
}
