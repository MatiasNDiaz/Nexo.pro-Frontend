import { Menu } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { mainNavFor } from "@/config/navigation";
import { HeaderNav } from "./header-nav";

/**
 * Header fijo y translúcido. `viewTransitionName` lo deja quieto mientras el contenido cambia de
 * página (ancla visual; ver globals.css).
 *
 * La navegación lee la ruta actual (para marcar la sección) y la sesión: en rutas con parámetros
 * desconocidos eso es dato de la request. Va dentro de <Suspense> para no bloquear el prerender del
 * resto de la página; el sustituto tiene el mismo tamaño (sin saltos de layout).
 */
export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75"
    >
      <div className="site-header-row container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="-m-1 rounded-lg p-1" aria-label="Repara Ya, ir al inicio">
          <Logo />
        </Link>
        <Suspense fallback={<HeaderNavFallback />}>
          <HeaderNav />
        </Suspense>
      </div>
    </header>
  );
}

/** Navegación pública sin sección activa ni datos de sesión (dura lo que tarda en hidratar). */
function HeaderNavFallback() {
  return (
    <>
      <nav aria-label="Principal" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {mainNavFor({ status: "loading" }).map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="inline-flex h-10 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium text-muted">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="hidden h-10 w-44 rounded-lg bg-brand-100/70 md:block" />
        <span aria-hidden="true" className="grid size-11 place-items-center text-brand-800 md:hidden">
          <Menu className="size-6" />
        </span>
      </div>
    </>
  );
}
