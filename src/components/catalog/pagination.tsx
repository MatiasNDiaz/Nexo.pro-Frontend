import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Números a mostrar: siempre la primera y la última, la actual y sus vecinas; "…" en los saltos. */
export function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1]! > 1) result.push("gap");
    result.push(page);
  });
  return result;
}

const itemClass =
  "inline-grid h-11 min-w-11 place-items-center rounded-xl px-3 text-sm font-semibold transition-colors";

/**
 * Paginación con enlaces reales: funciona sin JavaScript y la recorren los buscadores. Cambiar de
 * página reemplaza la lista sin mover la pantalla (scroll={false}), como el resto de los filtros.
 */
export function Pagination({ page, total, hrefFor }: { page: number; total: number; hrefFor: (page: number) => string }) {
  if (total <= 1) return null;
  const link = (target: number) => hrefFor(target) as Route;
  return (
    <nav aria-label="Páginas de resultados" className="flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={link(page - 1)} rel="prev" scroll={false} className={cn(itemClass, "text-brand-800 hover:bg-brand-50")}>
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="sr-only">Página anterior</span>
        </Link>
      ) : (
        <span className={cn(itemClass, "text-line-strong")} aria-hidden="true">
          <ChevronLeft className="size-5" />
        </span>
      )}
      <ul className="flex items-center gap-1.5">
        {pageWindow(page, total).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span aria-current="page" className={cn(itemClass, "bg-brand-700 text-white")}>
                  <span className="sr-only">Página </span>
                  {item}
                </span>
              ) : (
                <Link href={link(item)} scroll={false} className={cn(itemClass, "text-ink hover:bg-brand-50")}>
                  <span className="sr-only">Página </span>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>
      {page < total ? (
        <Link href={link(page + 1)} rel="next" scroll={false} className={cn(itemClass, "text-brand-800 hover:bg-brand-50")}>
          <ChevronRight className="size-5" aria-hidden="true" />
          <span className="sr-only">Página siguiente</span>
        </Link>
      ) : (
        <span className={cn(itemClass, "text-line-strong")} aria-hidden="true">
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}
