// Databasetypes — tolerant: velden uit n8n kunnen ontbreken of leeg zijn.

export type Tier = "JA" | "MONITOR" | "NEE";
export type PNiveau = "P1" | "P2" | "P3";
export type Taal = "nl" | "fr" | "en" | string;

export interface FitBedrijf {
  aanwezig?: boolean;
  naam?: string;
  kwalificatie?: Tier | string;
  behoefte?: string;
  fit?: string;
  timing?: string;
  zekerheid?: "hoog" | "laag" | string;
  voorstel_rol?: string;
  invalshoek?: string;
  opening?: string;
  pain_score?: number;
}

export interface FitArtikel {
  relevant?: "JA" | "NEE" | string;
  thema?: string;
  samenvatting?: string;
  relevantie_score?: number;
  klantkans_score?: number;
  impact?: string[];
}

export interface FitContact {
  rol?: string;
  waarom?: string;
}

export interface FitKans {
  type?: "content" | "event" | "kanaal" | "speech" | "analyse" | "geen" | string;
  omschrijving?: string;
  voor_wie?: string;
  actie?: string;
}

export interface FitPost {
  advies?: "negeren" | "reposten" | "eigen_visie" | "origineel" | string;
  waarom?: string;
  invalshoek?: string;
}

export interface FitRapport {
  taal?: Taal;
  nl_titel?: string;
  bedrijf?: FitBedrijf;
  artikel?: FitArtikel;
  contact?: FitContact;
  kans?: FitKans;
  post?: FitPost;
  waarom_nu?: string;
  P?: PNiveau | string;
  prioriteit?: number;
  deadline?: string;
  actie_nodig?: boolean;
}

export interface Signaal {
  id: number;
  dag: string | null;
  titel: string | null;
  nl_titel: string | null;
  bedrijf_naam: string | null;
  taal: Taal | null;
  tier: Tier | null;
  p_niveau: PNiveau | null;
  prioriteit: number | null;
  deadline: string | null;
  actie_nodig: boolean | null;
  pain_score: number | null;
  relevantie_score: number | null;
  klantkans_score: number | null;
  waarom_nu: string | null;
  bron_naam: string | null;
  url: string | null;
  gepubliceerd_op: string | null;
  fit_rapport: FitRapport | null;
  hash: string | null;
  aangemaakt_op: string | null;
  done: boolean | null;
}

export type BedrijfStatus = "prospect" | "bellen" | "gecontacteerd" | "klant" | string;

export interface Bedrijf {
  id: number;
  naam: string | null;
  naam_norm: string | null;
  sector: string | null;
  status: BedrijfStatus | null;
  pain_score: number | null;
  laatste_tier: Tier | null;
  outcome: string | null;
  aangemaakt_op: string | null;
}

export interface Outcome {
  id: number;
  bedrijf_id: number | null;
  signaal_id: number | null;
  soort: string | null;
  notitie: string | null;
  datum: string | null;
}

export interface Bron {
  id: number;
  naam: string | null;
  url: string | null;
  taal: Taal | null;
  toegevoegd_op: string | null;
}
