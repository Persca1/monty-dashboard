-- Eenmalig uitvoeren in de Supabase SQL editor.
-- Voegt de 'done'-kolom toe die het Acties-scherm gebruikt om af te vinken.

alter table signaal add column if not exists done boolean default false;
