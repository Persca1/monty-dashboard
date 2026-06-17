import type { Bedrijf, Signaal, Tier } from "./types";
import { companyName, painOf, tierOf } from "./fit";

export interface BedrijfRij {
  id: number | null; // null = enkel afgeleid uit signalen, niet bewerkbaar
  naam: string;
  sector: string | null;
  status: string | null;
  outcome: string | null;
  pain: number;
  signaalCount: number;
  laatste_tier: Tier | null;
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

// Combineert echte bedrijf-records met namen afgeleid uit signaal.bedrijf_naam.
// Echte records winnen (bewerkbaar); afgeleide namen vullen aan.
export function combineerBedrijven(
  bedrijven: Bedrijf[],
  signalen: Signaal[]
): BedrijfRij[] {
  const map = new Map<string, BedrijfRij>();

  for (const b of bedrijven) {
    if (!b.naam) continue;
    map.set(norm(b.naam), {
      id: b.id,
      naam: b.naam,
      sector: b.sector,
      status: b.status ?? null,
      outcome: b.outcome ?? null,
      pain: b.pain_score ?? 0,
      signaalCount: 0,
      laatste_tier: (b.laatste_tier as Tier) ?? null,
    });
  }

  for (const s of signalen) {
    const naam = companyName(s);
    if (!naam) continue;
    const key = norm(naam);
    const p = painOf(s);
    const t = tierOf(s);
    const bestaand = map.get(key);
    if (bestaand) {
      bestaand.signaalCount += 1;
      if (p > bestaand.pain) bestaand.pain = p;
      if (!bestaand.laatste_tier && t) bestaand.laatste_tier = t;
    } else {
      map.set(key, {
        id: null,
        naam,
        sector: null,
        status: null,
        outcome: null,
        pain: p,
        signaalCount: 1,
        laatste_tier: t,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.pain - a.pain);
}
