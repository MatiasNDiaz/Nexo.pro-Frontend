import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bloque de configuración del panel: título, descripción y contenido, con el mismo ritmo en todas las páginas. */
export function SettingsSection({
  id,
  title,
  description,
  children,
  tone = "default",
}: {
  id?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  const headingId = id ? `${id}-titulo` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "flex scroll-mt-24 flex-col gap-5 rounded-3xl border bg-surface p-5 shadow-card sm:p-7",
        tone === "danger" ? "border-danger-600/25" : "border-line",
      )}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className={cn("text-lg font-semibold", tone === "danger" ? "text-danger-600" : "text-brand-900")}>
          {title}
        </h2>
        {description && <div className="text-sm text-muted">{description}</div>}
      </div>
      {children}
    </section>
  );
}

/** Título de página del panel. */
export function PanelTitle({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex flex-col gap-2 animate-fade-up">
      <h1 className="text-3xl font-bold text-brand-900">{title}</h1>
      {description && <p className="text-muted-strong">{description}</p>}
    </header>
  );
}
