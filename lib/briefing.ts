import type { Signaal } from "./types";
import {
  themeOf,
  tierOf,
  painOf,
  relevantieOf,
  fitOf,
  hasKans,
  displayTitle,
  companyName,
} from "./fit";

export type Periode = "vandaag" | "week" | "maand" | "alles";

// Filtert signalen op aanmaakdatum (aangemaakt_op) volgens periode.
export function filterPeriode(signalen: Signaal[], periode: Periode): Signaal[] {
  if (periode === "alles") return signalen;

  const nu = new Date();
  const grens = new Date(nu);
  if (periode === "vandaag") grens.setHours(0, 0, 0, 0);
  else if (periode === "week") grens.setDate(nu.getDate() - 7);
  else if (periode === "maand") grens.setDate(nu.getDate() - 30);

  return signalen.filter((s) => {
    if (!s.aangemaakt_op) return false;
    const d = new Date(s.aangemaakt_op);
    if (isNaN(d.getTime())) return false;
    return d >= grens;
  });
}
export interface ThemaTel {
  thema: string;
  aantal: number;
}

function themaKey(thema: string): string {
  const stop = new Set([
    "in", "en", "de", "het", "een", "van", "voor", "op", "bij",
    "met", "of", "die", "dat", "te", "is", "naar",
  ]);
  return thema
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b\d{4}\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w))
    .sort()
    .join(" ");
}

export function topThemas(signalen: Signaal[], n = 10): ThemaTel[] {
  const groepen = new Map<string, { aantal: number; varianten: Map<string, number> }>();

  for (const s of signalen) {
    const t = themeOf(s);
    if (!t) continue;
    const key = themaKey(t);
    if (!key) continue;

    let g = groepen.get(key);
    if (!g) {
      g = { aantal: 0, varianten: new Map<string, number>() };
      groepen.set(key, g);
    }
    g.aantal += 1;
    g.varianten.set(t, (g.varianten.get(t) || 0) + 1);
  }

  return [...groepen.values()]
    .map((g) => {
      const beste = [...g.varianten.entries()].sort((a, b) => b[1] - a[1])[0][0];
      return { thema: beste, aantal: g.aantal };
    })
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, n);
}

export function topLeads(signalen: Signaal[], n = 10): Signaal[] {
  return signalen
    .filter((s) => tierOf(s) === "JA")
    .sort((a, b) => painOf(b) - painOf(a))
    .slice(0, n);
}

export function topArtikels(signalen: Signaal[], n = 5): Signaal[] {
  return [...signalen]
    .sort((a, b) => relevantieOf(b) - relevantieOf(a))
    .slice(0, n);
}

export function topKansen(signalen: Signaal[], n = 3): Signaal[] {
  return signalen
    .filter(hasKans)
    .sort((a, b) => {
      const ka = fitOf(a).artikel?.klantkans_score || 0;
      const kb = fitOf(b).artikel?.klantkans_score || 0;
      return kb - ka;
    })
    .slice(0, n);
}

export interface PijnBedrijf {
  naam: string;
  pain: number;
}

export function topPijnBedrijven(signalen: Signaal[], n = 3): PijnBedrijf[] {
  const best = new Map<string, number>();
  for (const s of signalen) {
    const naam = companyName(s);
    if (!naam) continue;
    const p = painOf(s);
    if (p > (best.get(naam) || 0)) best.set(naam, p);
  }
  return [...best.entries()]
    .map(([naam, pain]) => ({ naam, pain }))
    .sort((a, b) => b.pain - a.pain)
    .slice(0, n);
}

// Bouwt een platte-tekst briefing voor "Kopieer rapport" / "Download".
export function buildReport(signalen: Signaal[], datum: string): string {
  const L: string[] = [];
  L.push(`MONTY · PULSE — OCHTENDBRIEFING`);
  L.push(datum);
  L.push("=".repeat(48));
  L.push("");

  L.push("TOP 10 TRENDS");
  topThemas(signalen, 10).forEach((t, i) =>
    L.push(`${i + 1}. ${t.thema} (${t.aantal})`)
  );
  L.push("");

  L.push("TOP 10 LEADS (tier JA, op pain)");
  topLeads(signalen, 10).forEach((s, i) =>
    L.push(
      `${i + 1}. [pain ${painOf(s)}] ${companyName(s) || "?"} — ${displayTitle(s)}`
    )
  );
  L.push("");

  L.push("TOP 5 ARTIKELS (op relevantie)");
  topArtikels(signalen, 5).forEach((s, i) =>
    L.push(`${i + 1}. [rel ${relevantieOf(s)}] ${displayTitle(s)}`)
  );
  L.push("");

  L.push("TOP 3 CONTENTKANSEN");
  topKansen(signalen, 3).forEach((s, i) => {
    const k = fitOf(s).kans || {};
    L.push(`${i + 1}. [${k.type}] ${k.omschrijving || displayTitle(s)}`);
    if (k.voor_wie) L.push(`   voor: ${k.voor_wie}`);
    if (k.actie) L.push(`   actie: ${k.actie}`);
  });
  L.push("");

  L.push("TOP 3 BEDRIJVEN MET PIJN");
  topPijnBedrijven(signalen, 3).forEach((b, i) =>
    L.push(`${i + 1}. [pain ${b.pain}] ${b.naam}`)
  );
  L.push("");

  return L.join("\n");
}
