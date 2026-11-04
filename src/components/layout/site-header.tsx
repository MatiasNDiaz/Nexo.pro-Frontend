import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { HeaderNav } from "./header-nav";

/**
 * Header fijo y translúcido. `viewTransitionName` lo deja quieto mientras el contenido cambia de
 * página (ancla visual; ver globals.css).
 */
export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b border-line/80 bg-surface/85 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75"
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="-m-1 rounded-lg p-1" aria-label="Repara Ya, ir al inicio">
          <Logo />
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}
