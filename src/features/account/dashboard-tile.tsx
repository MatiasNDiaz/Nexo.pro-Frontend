import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface TileProps {
  /** Sin enlace, la tarjeta solo muestra el número (sección que todavía no existe). */
  href?: Route;
  icon: LucideIcon;
  title: string;
  count: number | undefined;
  detail: string;
  highlight?: boolean;
  loading?: boolean;
}

/** Acceso del tablero: el número grande, qué cuenta y el ícono; con enlace, se levanta al pasar el mouse. */
export function Tile({ href, icon: Icon, title, count, detail, highlight = false, loading = false }: TileProps) {
  const content = (
    <>
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-2xl transition-transform duration-300 ease-out-soft",
            href && "group-hover:scale-110 group-hover:-rotate-6",
            highlight ? "bg-amber-400 text-brand-900" : "bg-brand-50 text-brand-700",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {href && (
          <ArrowUpRight
            className="size-5 text-muted transition-[translate,color] duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-700"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="flex flex-col">
        <span className="font-display text-4xl leading-none font-bold text-brand-900 font-stretch-[112%]">
          {loading ? <span className="inline-block h-9 w-10 animate-pulse rounded-lg bg-brand-100 align-middle" /> : (count ?? 0)}
        </span>
        <span className="mt-2 font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted-strong">{detail}</span>
      </span>
    </>
  );
  const box = cn(
    "flex h-full flex-col gap-4 rounded-3xl border p-4 sm:p-5",
    highlight ? "border-amber-400/60 bg-amber-50" : "border-line bg-surface shadow-card",
  );
  if (!href) return <div className={box}>{content}</div>;
  return (
    <Link
      href={href}
      className={cn(box, "group transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-raised", !highlight && "hover:border-brand-200")}
    >
      {content}
    </Link>
  );
}
