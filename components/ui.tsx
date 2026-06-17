import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="heading-serif text-2xl text-txt">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-txt2">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function Counter({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "green" | "amber" | "accent";
}) {
  const toneCls = {
    default: "text-txt",
    green: "text-green",
    amber: "text-amber",
    accent: "text-accent",
  }[tone];
  return (
    <div className="panel px-4 py-3">
      <div className={`heading-serif text-2xl ${toneCls}`}>{value}</div>
      <div className="mono-label mt-0.5 text-[10px] text-muted">{label}</div>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel px-5 py-10 text-center text-sm text-txt2">
      {children}
    </div>
  );
}

export function ConfigNotice() {
  return (
    <div className="panel border-amber/40 px-5 py-6">
      <h2 className="heading-serif mb-2 text-lg text-amber">
        Supabase nog niet geconfigureerd
      </h2>
      <p className="mb-3 text-sm text-txt2">
        Maak een bestand <code className="text-txt">.env.local</code> aan in de
        projectmap (kopieer <code className="text-txt">.env.local.example</code>)
        en vul je eigen waarden in:
      </p>
      <pre className="panel-2 overflow-x-auto p-3 text-xs text-txt2">
        {`SUPABASE_URL=...        (project URL, zonder slash op het einde)
SUPABASE_SERVICE_KEY=... (service_role sleutel, server-side only)
ANTHROPIC_API_KEY=...    (alleen voor de Copywriter)`}
      </pre>
      <p className="mt-3 text-sm text-txt2">
        Herstart daarna <code className="text-txt">npm run dev</code>.
      </p>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="panel border-accent/40 px-5 py-6">
      <h2 className="heading-serif mb-2 text-lg text-accent">
        Kon data niet laden
      </h2>
      <p className="text-sm text-txt2">{message}</p>
      <p className="mt-3 text-xs text-muted">
        Controleer je Supabase-sleutels in <code>.env.local</code> en of de
        tabellen bestaan.
      </p>
    </div>
  );
}

export function PanelLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="mono-label rounded-md border border-line bg-panel2 px-3 py-1.5 text-[11px] text-txt2 transition-colors hover:border-muted hover:text-txt"
    >
      {children}
    </Link>
  );
}
