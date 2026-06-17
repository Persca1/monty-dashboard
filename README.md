# Monty · Pulse — Dashboard

Intern admin-dashboard voor Montisoro Pulse. Leest de signalen uit Supabase en
toont ze doorzoekbaar. Eén uitzondering schrijft: de Copywriter roept de Claude
API aan. De data wordt door een n8n-workflow gevuld; dit dashboard leest enkel
(behalve het afvinken van acties en het bewerken van bedrijfsstatus/uitkomst).

## Tech
Next.js 14 (App Router) · TypeScript · Tailwind CSS · @supabase/supabase-js ·
@anthropic-ai/sdk.

## Opzet

1. Installeer dependencies:

   ```bash
   npm install
   ```

2. Maak `.env.local` aan (kopieer `.env.local.example`) en vul je waarden in:

   ```
   SUPABASE_URL=...        # project URL, zonder slash op het einde
   SUPABASE_SERVICE_KEY=... # service_role sleutel — SERVER-SIDE ONLY
   ANTHROPIC_API_KEY=...    # alleen voor de Copywriter
   ```

   > Deze sleutels worden **uitsluitend server-side** gebruikt (Server Components
   > en Route Handlers) en komen nooit in de browser terecht. `.env.local` staat
   > in `.gitignore`.

3. Voer eenmalig de schema-aanvulling uit in de Supabase SQL editor
   (zie `supabase.sql`):

   ```sql
   alter table signaal add column if not exists done boolean default false;
   ```

4. Plaats `logo-montisoro-wit.png` in `public/` (optioneel — anders verschijnt
   een plaatshouder).

5. Start lokaal:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Schermen
- **Ochtend** — dagelijkse briefing (top trends, leads, artikels, kansen, pijn) + kopieer/download.
- **Vandaag** — signalen van vandaag, gesorteerd op tier, uitklapbaar.
- **Bedrijven** — lijst met statusfilter; status/uitkomst bewerkbaar; detail per bedrijf.
- **Kansen** — alle signalen met een contentkans.
- **Acties** — signalen die actie vragen; afvinkbaar (`done = true`).
- **Trends** — staafdiagram van thema's.
- **Copywriter** — Claude schrijft LinkedIn-content (reageren of 3 eigen ideeën).
- **Archief** — alle signalen, filter op tier + zoekveld.

## Beveiliging
Service-sleutel alleen server-side. Geen persoonsdossiers: contact op rol-niveau.
Bij latere online-deployment: voeg login toe (Supabase Auth).
