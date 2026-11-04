import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Encabezado de página interna: título, bajada y acciones, con el mismo ritmo en todo el sitio. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line bg-linear-to-b from-brand-50 to-canvas", className)}>
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
        <div className="flex max-w-2xl flex-col gap-3 animate-fade-up">
          {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">{eyebrow}</p>}
          <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">{title}</h1>
          {description && <p className="text-lg leading-relaxed text-muted-strong">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
      </div>
    </div>
  );
}
