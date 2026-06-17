import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchBedrijven, fetchSignalen } from "@/lib/queries";
import { combineerBedrijven } from "@/lib/bedrijven";
import { PageHeader, ConfigNotice, ErrorNotice } from "@/components/ui";
import BedrijvenList from "@/components/BedrijvenList";

export const dynamic = "force-dynamic";

export default async function BedrijvenPage() {
  if (!isSupabaseConfigured()) {
    return (
      <>
        <PageHeader title="Bedrijven" />
        <ConfigNotice />
      </>
    );
  }

  let rijen;
  try {
    const [bedrijven, signalen] = await Promise.all([
      fetchBedrijven(),
      fetchSignalen(),
    ]);
    rijen = combineerBedrijven(bedrijven, signalen);
  } catch (e) {
    return (
      <>
        <PageHeader title="Bedrijven" />
        <ErrorNotice message={(e as Error).message} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Bedrijven"
        subtitle={`${rijen.length} bedrijven · status en uitkomst bewerkbaar`}
      />
      <BedrijvenList rijen={rijen} />
    </>
  );
}
