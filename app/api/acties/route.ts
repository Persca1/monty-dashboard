import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Zet signaal.done. Enige schrijfactie op de signaal-tabel.
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase niet geconfigureerd." },
      { status: 503 }
    );
  }

  let body: { id?: number; done?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const { id, done } = body;
  if (typeof id !== "number" || typeof done !== "boolean") {
    return NextResponse.json(
      { error: "Verwacht { id: number, done: boolean }." },
      { status: 400 }
    );
  }

  const sb = getSupabase();
  const { error } = await sb.from("signaal").update({ done }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id, done });
}
