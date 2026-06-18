"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TABS = [
  { href: "/", label: "Ochtend" },
  { href: "/vandaag", label: "Vandaag" },
  { href: "/bedrijven", label: "Bedrijven" },
  { href: "/kansen", label: "Kansen" },
  { href: "/opvolgen", label: "Opvolgen" },
  { href: "/acties", label: "Acties" },
  { href: "/trends", label: "Trends" },
  { href: "/copywriter", label: "Copywriter" },
  { href: "/archief", label: "Archief" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 py-3.5">
          {!logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo-montisoro-wit.png"
              alt="Montisoro"
              height={26}
              className="h-[26px] w-auto"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span
              className="grid h-[26px] w-[26px] place-items-center rounded bg-accent text-[13px] font-bold text-bg"
              aria-hidden
            >
              M
            </span>
          )}
          <span className="mono-label text-[13px] text-txt">
            Monty · Pulse
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto py-2">
          {TABS.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-panel2 text-txt"
                    : "text-txt2 hover:bg-panel2/60 hover:text-txt"
                }`}
              >
                <span className="relative">
                  {t.label}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-accent" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
