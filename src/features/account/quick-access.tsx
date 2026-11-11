import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { revealDelay } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";
import type { PanelGroup, PanelLink } from "./panel-nav";

/** Lo que muestra un acceso además de su descripción: cuántas cosas lo esperan. */
export interface AccessStatus {
  count: number | undefined;
  /** "sin leer", "en curso"… */
  detail: string;
  /** Pide atención (fondo ámbar): mensajes sin leer, pedidos sin responder, reportes… */
  highlight?: boolean;
  loading?: boolean;
}

export type AccessStatuses = Partial<Record<string, AccessStatus>>;

/**
 * Accesos rápidos del inicio del panel: las mismas secciones del menú, agrupadas por tarea, cada una
 * con lo que se puede hacer ahí y, si corresponde, cuántas cosas esperan. Sin el acceso al inicio.
 */
export function QuickAccess({ groups, statuses = {} }: { groups: PanelGroup[]; statuses?: AccessStatuses }) {
  const visible = groups.map((group) => ({ ...group, links: group.links.filter((link) => link.href !== "/panel") })).filter((group) => group.links.length > 0);
  return (
    <div className="flex flex-col gap-10">
      {visible.map((group) => {
        const id = `accesos-${group.label.toLowerCase().replaceAll(" ", "-")}`;
        return (
          <section key={group.label} aria-labelledby={id} className="flex flex-col gap-4">
            <h2 id={id} className="text-xl font-semibold text-brand-900">
              {group.label}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
              {group.links.map((link, index) => (
                <li key={link.href} data-reveal style={revealDelay(index % 4, 60)}>
                  <AccessCard link={link} status={statuses[link.href]} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Celular: ícono a la izquierda, el texto al lado y el contador debajo (tarjetas bajas, la lista se
 * recorre rápido). Desde sm: ícono arriba con el contador o la flecha a la derecha, y el texto abajo.
 * Cada parte se dibuja una sola vez: solo cambia su lugar en la grilla.
 */
function AccessCard({ link, status }: { link: PanelLink; status: AccessStatus | undefined }) {
  const Icon = link.icon;
  const highlight = !!status?.highlight && (status.count ?? 0) > 0;
  return (
    <Link
      href={link.href}
      className={cn(
        "group grid h-full grid-cols-[auto_minmax(0,1fr)] content-start items-start gap-x-4 gap-y-2 rounded-2xl border p-4 transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-raised sm:gap-y-4 sm:p-5",
        "[grid-template-areas:'icon_text'_'icon_status'] sm:[grid-template-areas:'icon_status'_'text_text']",
        highlight ? "border-amber-400/70 bg-amber-50" : "border-line bg-surface shadow-card hover:border-brand-200",
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-xl transition-transform duration-300 ease-out-soft [grid-area:icon] group-hover:scale-105",
          highlight ? "bg-amber-400 text-brand-900" : "bg-brand-50 text-brand-700",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col gap-1 [grid-area:text]">
        <span className="text-lg font-semibold text-ink group-hover:text-brand-800">{link.label}</span>
        <span className="text-sm text-muted-strong">{link.description}</span>
      </span>
      {status ? (
        <span className="[grid-area:status] sm:justify-self-end">
          {status.loading ? (
            <span className="block h-7 w-24 animate-pulse rounded-full bg-brand-100" aria-hidden="true" />
          ) : (
            <span
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap tabular-nums",
                highlight ? "bg-amber-400 text-brand-950" : "bg-canvas text-muted-strong ring-1 ring-line",
              )}
            >
              <span className="font-display text-base font-bold">{status.count ?? 0}</span>
              {status.detail}
            </span>
          )}
        </span>
      ) : (
        <ArrowUpRight
          className="hidden size-5 text-muted transition-[translate,color] duration-200 ease-out-soft [grid-area:status] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700 sm:block sm:justify-self-end"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
