import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Server-side aanroep van de Claude API. ANTHROPIC_API_KEY blijft server-side.
// Twee modi:
//  - "react": schrijf een LinkedIn-post/carrousel/reactie voor één signaal
//  - "ideas": genereer 3 postideeën op basis van de top-thema's
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 3000;

const SYSTEM = `Je bent de LinkedIn-copywriter van Montisoro (B2B, NL).
Schrijf in vlot, professioneel Nederlands met een menselijke, scherpe toon.
Geen clichés, geen overdreven emoji's (hooguit één), geen hashtags-spam (max 3 relevante).
Hou het bondig en klaar om te plaatsen. Voeg geen meta-uitleg toe — enkel de tekst zelf.`;

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key, maxRetries: 5 });
}

function reactPrompt(body: any): string {
  const advies = body.advies || "origineel";
  const invalshoek = body.invalshoek || "";
  const titel = body.titel || "";
  const samenvatting = body.samenvatting || "";
  const thema = body.thema || "";
  return `Schrijf een LinkedIn-bijdrage op basis van dit signaal.

Postadvies: ${advies}
Invalshoek: ${invalshoek}
Thema: ${thema}
Titel: ${titel}
Samenvatting: ${samenvatting}

Richtlijnen per advies:
- "reposten": schrijf een korte, krachtige begeleidende tekst (2-4 zinnen) bij het delen.
- "eigen_visie": schrijf een post (120-180 woorden) die het nieuws duidt met Montisoro's standpunt.
- "origineel": schrijf een originele post (120-200 woorden) geïnspireerd op het thema.
Lever enkel de definitieve posttekst.`;
}

function ideasPrompt(themas: string[]): string {
  const lijst = themas.length
    ? themas.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "(geen thema's beschikbaar — kies relevante B2B-thema's)";
  return `Geef 3 concrete LinkedIn-postideeën voor Montisoro op basis van deze top-thema's:

${lijst}

Geef per idee:
- Een pakkende titel/hook
- 2-3 zinnen uitwerking (de kern van de post)
- Het format (korte post / carrousel / poll)

Nummer ze 1, 2, 3. Bondig en direct bruikbaar.`;
}

function top6Prompt(signalen: any[]): string {
  const lijst = signalen.map((s, i) => {
    return `SIGNAAL ${i + 1}
Titel: ${s.titel}
Bedrijf: ${s.bedrijf || "-"}
Thema: ${s.thema || "-"}
Samenvatting: ${s.samenvatting || "-"}
Waarom relevant: ${s.waarom || "-"}`;
  }).join("\n\n");

  return `Hieronder staan de ${signalen.length} sterkste signalen van vandaag uit het Montisoro Pulse-dashboard. Schrijf voor ELK signaal één kant-en-klare LinkedIn-post.

${lijst}

Lever voor elk signaal exact dit formaat (en niets anders ertussen):

=== POST [nummer] ===
tekst:
[de volledige, plaatsbare LinkedIn-post — 120-200 woorden, menselijke scherpe toon, hooguit 1 emoji, max 3 relevante hashtags]

waarom:
[2-3 zinnen: waarom deze post nu werkt, welk signaal en welke invalshoek, voor welke doelgroep]

Schrijf alle ${signalen.length} posts. Begin direct met "=== POST 1 ===".`;
}

export async function POST(req: NextRequest) {
  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ontbreekt in .env.local." },
      { status: 503 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const mode = body?.mode;
  let prompt: string;
  if (mode === "react") {
    prompt = reactPrompt(body);
  } else if (mode === "ideas") {
    prompt = ideasPrompt(Array.isArray(body.themas) ? body.themas : []);
  } else if (mode === "top6") {
    prompt = top6Prompt(Array.isArray(body.signalen) ? body.signalen : []);
  } else {
    return NextResponse.json(
      { error: "Onbekende mode. Gebruik 'react' of 'ideas'." },
      { status: 400 }
    );
  }

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return NextResponse.json({ ok: true, text });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Even te druk (rate limit). Probeer over een halve minuut opnieuw." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `Claude-aanroep mislukt: ${err.message}` },
      { status: 502 }
    );
  }
}
