"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function verwijderSignaal(id: number) {
  const supabase = getClient();
  await supabase
    .from("signaal")
    .update({ verwijderd: true, verwijderd_op: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/kansen");
}

export async function toggleGelezen(id: number, gelezen: boolean) {
  const supabase = getClient();
  await supabase
    .from("signaal")
    .update({ gelezen })
    .eq("id", id);
  revalidatePath("/kansen");
}