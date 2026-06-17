"use client";

import { useState } from "react";
import type { Signaal } from "@/lib/types";
import {
  fitOf,
  displayTitle,
  companyName,
  tierOf,
  pNiveauOf,
  painOf,
  relevantieOf,
  klantkansOf,
  themeOf,
  needsTranslationNote,
  isUncertain,
} from "@/lib/fit";
import { TierBadge, PChip, PainChip, Chip, UncertainFlag } from "./Chips";

function tierBorder(tier: string | null): string {
  switch (tier) {
    case "JA":
      return "border-l-green";
    case "MONITOR":
      return "border-l-amber";
    case "NEE":
      return "border-l-muted";
    default:
      return "border-l-line";
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value || !value.trim()) return null;
  return (
    <div>
      <div className="mono-label mb-0.5 text-[10px] text-muted">{label}</div>
      <div className="text-sm leading-relaxed text-txt">{value}</div>
    </div>
  );
}

export default function DetailCard({
  signaal,
  defaultOpen = false,
}: {
  signaal: Signaal;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const fit = fitOf(signaal);
  const tier = tierOf(signaal);
  const company = companyName(signaal);
  const taal = (signaal.taal || fit.taal || "nl").toLowerCase();

  const artikel = fit.artikel || {};
  const bedrijf = fit.bedrijf || {};
  const contact = fit.contact || {};
  const kans = fit.kans || {};
  const post = fit.post || {};

  return (
    <div
      className={`panel border-l-[3px] ${tierBorder(
        tier
      )} overflow-hidden transition-colors`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-panel2/40"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <TierBadge tier={tier} />
            <PChip p={pNiveauOf(signaal)} />
            <PainChip score={painOf(signaal)} />
            {isUncertain(signaal) && <UncertainFlag />}
            {company && <Chip title="Bedrijf">{company}</Chip>}
          </div>
          <div className="heading-serif text-[15px] leading-snug text-txt">
            {displayTitle(signaal)}
          </div>
          {themeOf(signaal) && (
            <div className="mono-label mt-1 text-[10px] text-txt2">
              {themeOf(signaal)}
            </div>
          )}
        </div>
        <span
          className={`mono-label mt-0.5 shrink-0 text-[11px] text-muted transition-transform ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          ▶
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4">
          {needsTranslationNote(signaal) && (
            <div className="rounded-md border border-line bg-panel2 px-3 py-2 text-xs text-txt2">
              <span className="mono-label text-[10px] text-amber">
                vertaalnoot
              </span>{" "}
              — origineel in{" "}
              <span className="uppercase">{taal}</span>. Getoonde titel is de
              NL-vertaling{signaal.titel ? `; origineel: “${signaal.titel}”` : ""}.
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            <Chip title="Relevantie">REL {relevantieOf(signaal)}</Chip>
            <Chip title="Klantkans">KANS {klantkansOf(signaal)}</Chip>
            {typeof fit.prioriteit === "number" && (
              <Chip title="Prioriteit (1 hoog – 5 laag)">
                PRIO {fit.prioriteit}
              </Chip>
            )}
            {signaal.deadline && <Chip title="Deadline">{signaal.deadline}</Chip>}
            {Array.isArray(artikel.impact) &&
              artikel.impact.map((i) => <Chip key={i}>{i}</Chip>)}
          </div>

          <Field label="Waarom nu" value={signaal.waarom_nu || fit.waarom_nu} />
          <Field label="Samenvatting" value={artikel.samenvatting} />

          {(bedrijf.behoefte ||
            bedrijf.fit ||
            bedrijf.timing ||
            bedrijf.opening ||
            bedrijf.invalshoek ||
            bedrijf.voorstel_rol) && (
            <div className="panel-2 space-y-3 p-3">
              <div className="mono-label text-[10px] text-txt2">Bedrijf</div>
              <Field label="Behoefte" value={bedrijf.behoefte} />
              <Field label="Fit" value={bedrijf.fit} />
              <Field label="Timing" value={bedrijf.timing} />
              <Field label="Voorgestelde rol" value={bedrijf.voorstel_rol} />
              <Field label="Invalshoek" value={bedrijf.invalshoek} />
              <Field label="Openingszin" value={bedrijf.opening} />
            </div>
          )}

          {(contact.rol || contact.waarom) && (
            <div className="panel-2 space-y-3 p-3">
              <div className="mono-label text-[10px] text-txt2">
                Contact (rol-niveau)
              </div>
              <Field label="Rol" value={contact.rol} />
              <Field label="Waarom deze rol" value={contact.waarom} />
            </div>
          )}

          {kans.type && kans.type.toLowerCase() !== "geen" && (
            <div className="panel-2 space-y-3 p-3">
              <div className="mono-label text-[10px] text-txt2">
                Kans · {kans.type}
              </div>
              <Field label="Omschrijving" value={kans.omschrijving} />
              <Field label="Voor wie" value={kans.voor_wie} />
              <Field label="Actie" value={kans.actie} />
            </div>
          )}

          {post.advies && (
            <div className="panel-2 space-y-3 p-3">
              <div className="mono-label text-[10px] text-txt2">
                Postadvies · {post.advies}
              </div>
              <Field label="Waarom" value={post.waarom} />
              <Field label="Invalshoek" value={post.invalshoek} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
