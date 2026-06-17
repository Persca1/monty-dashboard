import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchSignalen } from "@/lib/queries";
import { PageHeader, ConfigNotice, ErrorNotice } from "@/components/ui";
import ActiesList from "@/components/ActiesList";

export const dynamic = "force-dynamic";

export default async function ActiesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Acties" />
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
        <PageHeader title="Acties" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  const acties = signalen.filter((s) => s.actie_nodig === true);

  return (
    <>
      <PageHeader
        title="Acties"
        subtitle="Signalen die actie vragen, op prioriteit. Afvinken zet ze onderaan."
      />
      <ActiesList signalen={acties} />
    </>
  );
}
