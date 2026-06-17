import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const STATUSSEN = ["prospect", "bellen", "gecontacteerd", "klant"];

// Werkt status en/of outcome van een bedrijf bij.
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase niet geconfigureerd." },
      { status: 503 }
    );
  }

  let body: { id?: number; status?: string; outcome?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const { id, status, outcome } = body;
  if (typeof id !== "number") {
    return NextResponse.json({ error: "id ontbreekt." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof status === "string") {
    if (!STATUSSEN.includes(status)) {
      return NextResponse.json(
        { error: `Ongeldige status. Kies uit: ${STATUSSEN.join(", ")}.` },
        { status: 400 }
      );
    }
    update.status = status;
  }
  if (typeof outcome === "string") update.outcome = outcome;

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Niets om bij te werken." },
      { status: 400 }
    );
  }

  const sb = getSupabase();
  const { error } = await sb.from("bedrijf").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id, ...update });
}
