import type { FitRapport, Signaal, Tier, PNiveau } from "./types";

// Tolerante helpers rond signaal + fit_rapport. n8n kan velden leeg laten;
// we vallen altijd terug op iets bruikbaars.

export function parseFit(raw: unknown): FitRapport {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as FitRapport;
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") return raw as FitRapport;
  return {};
}

export function fitOf(s: Signaal): FitRapport {
  return parseFit(s.fit_rapport);
}

// Beste beschikbare titel: NL-titel eerst, dan fit, dan originele titel.
export function displayTitle(s: Signaal): string {
  const fit = fitOf(s);
  return (
    s.nl_titel?.trim() ||
    fit.nl_titel?.trim() ||
    s.titel?.trim() ||
    "(zonder titel)"
  );
}

export function companyName(s: Signaal): string {
  const fit = fitOf(s);
  return (
    s.bedrijf_naam?.trim() ||
    fit.bedrijf?.naam?.trim() ||
    ""
  );
}

export function themeOf(s: Signaal): string {
  const fit = fitOf(s);
  return fit.artikel?.thema?.trim() || "";
}

export function tierOf(s: Signaal): Tier | null {
  if (s.tier) return s.tier as Tier;
  const q = fitOf(s).bedrijf?.kwalificatie;
  if (q === "JA" || q === "MONITOR" || q === "NEE") return q;
  return null;
}

export function pNiveauOf(s: Signaal): PNiveau | null {
  if (s.p_niveau) return s.p_niveau as PNiveau;
  const p = fitOf(s).P;
  if (p === "P1" || p === "P2" || p === "P3") return p;
  return null;
}

export function painOf(s: Signaal): number {
  if (typeof s.pain_score === "number") return s.pain_score;
  const fp = fitOf(s).bedrijf?.pain_score;
  return typeof fp === "number" ? fp : 0;
}

export function relevantieOf(s: Signaal): number {
  if (typeof s.relevantie_score === "number") return s.relevantie_score;
  const r = fitOf(s).artikel?.relevantie_score;
  return typeof r === "number" ? r : 0;
}

export function klantkansOf(s: Signaal): number {
  if (typeof s.klantkans_score === "number") return s.klantkans_score;
  const k = fitOf(s).artikel?.klantkans_score;
  return typeof k === "number" ? k : 0;
}

export function prioriteitOf(s: Signaal): number {
  if (typeof s.prioriteit === "number") return s.prioriteit;
  const p = fitOf(s).prioriteit;
  return typeof p === "number" ? p : 5;
}

export function hasKans(s: Signaal): boolean {
  return klantkansOf(s) >= 70;
}

export function shouldReact(s: Signaal): boolean {
  const a = fitOf(s).post?.advies?.trim().toLowerCase();
  return Boolean(a) && a !== "negeren";
}

export function isUncertain(s: Signaal): boolean {
  return fitOf(s).bedrijf?.zekerheid === "laag";
}

export function needsTranslationNote(s: Signaal): boolean {
  const taal = (s.taal || fitOf(s).taal || "nl").toLowerCase();
  return taal !== "nl";
}

// Sorteer-rang voor tier: JA(0) -> MONITOR(1) -> NEE(2) -> onbekend(3)
export function tierRank(t: Tier | null): number {
  switch (t) {
    case "JA":
      return 0;
    case "MONITOR":
      return 1;
    case "NEE":
      return 2;
    default:
      return 3;
  }
}

// "vandaag" in lokale tijd als YYYY-MM-DD
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isToday(s: Signaal): boolean {
  if (!s.dag) return false;
  return s.dag.slice(0, 10) === todayISO();
}
