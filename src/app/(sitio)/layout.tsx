import { Suspense } from "react";
import { BackToTop } from "@/components/layout/back-to-top";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

/** Páginas del sitio con la navegación principal y el footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-brand-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <SiteFooter />
      <ScrollReveal />
      {/* Suspense: lee la URL (para ocultarse en Mensajes), que en rutas con [id] llega al pedirla. */}
      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </>
  );
}
