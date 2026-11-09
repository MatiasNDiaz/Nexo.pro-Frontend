"use client";

import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** Desde cuántos píxeles de scroll aparece. */
const THRESHOLD = 600;

/**
 * Botón para volver arriba de todo (abajo a la derecha). Sube suave (directo con movimiento
 * reducido) y deja el foco en el contenido, para que el teclado siga desde arriba. No se muestra en
 * Mensajes: ahí taparía el botón de enviar.
 */
export function BackToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > THRESHOLD));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (pathname.startsWith("/panel/mensajes")) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        document.getElementById("contenido")?.focus({ preventScroll: true });
      }}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-brand-900 text-white shadow-raised",
        "transition-[opacity,transform,background-color] duration-200 ease-out-soft hover:bg-brand-700 active:scale-95 sm:right-6 sm:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
      <span className="sr-only">Volver arriba</span>
    </button>
  );
}
