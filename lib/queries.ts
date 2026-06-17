import "server-only";
import { getSupabase } from "./supabase";
import type { Signaal, Bedrijf, Outcome } from "./types";

// Centrale, server-only dataqueries. Geen van deze functies mag vanuit
// clientcomponenten worden aangeroepen — alleen Server Components / routes.

export async function fetchSignalen(limit = 2000): Promise<Signaal[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("signaal")
    .select("*")
    .order("aangemaakt_op", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`signaal ophalen mislukt: ${error.message}`);
  return (data || []) as Signaal[];
}

export async function fetchSignalenVoorDag(dag: string): Promise<Signaal[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("signaal")
    .select("*")
    .eq("dag", dag);
  if (error) throw new Error(`dagsignalen ophalen mislukt: ${error.message}`);
  return (data || []) as Signaal[];
}

export async function fetchSignaal(id: number): Promise<Signaal | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("signaal")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`signaal ${id} ophalen mislukt: ${error.message}`);
  return (data as Signaal) || null;
}

export async function fetchBedrijven(): Promise<Bedrijf[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("bedrijf")
    .select("*")
    .order("pain_score", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`bedrijven ophalen mislukt: ${error.message}`);
  return (data || []) as Bedrijf[];
}

export async function fetchBedrijfByNaam(naam: string): Promise<Bedrijf | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("bedrijf")
    .select("*")
    .ilike("naam", naam)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`bedrijf ophalen mislukt: ${error.message}`);
  return (data as Bedrijf) || null;
}

export async function fetchSignalenVoorBedrijf(naam: string): Promise<Signaal[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("signaal")
    .select("*")
    .ilike("bedrijf_naam", naam)
    .order("aangemaakt_op", { ascending: false });
  if (error)
    throw new Error(`signalen voor bedrijf ophalen mislukt: ${error.message}`);
  return (data || []) as Signaal[];
}

export async function fetchOutcomes(bedrijfId?: number): Promise<Outcome[]> {
  const sb = getSupabase();
  let q = sb.from("outcome").select("*").order("datum", { ascending: false });
  if (bedrijfId != null) q = q.eq("bedrijf_id", bedrijfId);
  const { data, error } = await q;
  if (error) throw new Error(`outcomes ophalen mislukt: ${error.message}`);
  return (data || []) as Outcome[];
}
