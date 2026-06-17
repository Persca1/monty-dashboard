import { createClient, SupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY Supabase client.
// Gebruikt de service_role-sleutel; mag NOOIT in client-/browsercode geïmporteerd worden.
// Importeer dit bestand uitsluitend vanuit Server Components of Route Handlers.

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Ontbrekende Supabase-config. Zet SUPABASE_URL en SUPABASE_SERVICE_KEY in .env.local."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

// Geeft true als de omgeving geconfigureerd is — handig om vriendelijke
// foutmeldingen te tonen i.p.v. te crashen wanneer .env.local nog leeg is.
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}
