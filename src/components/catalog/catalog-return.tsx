"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { PHOTO_NAV } from "./profile-photo-transition";

/*
 * Volver del perfil al catálogo con el botón "atrás" del navegador, con la foto volando de vuelta a
 * su tarjeta (ProfilePhotoTransition).
 *
 * React resuelve en forma síncrona las navegaciones que nacen de un evento popstate (para restaurar
 * el scroll al instante), y así no corren las View Transitions. Por eso, cuando el "atrás" lleva al
 * catálogo, el perfil frena ese evento antes que Next (script de src/lib/popstate-gate.ts) y pide la
 * misma URL como una navegación común, fuera del evento: React la anima.
 *
 * El scroll del catálogo se repone dentro de la transición, después de que el navegador captura el
 * perfil y antes de que React mida la página nueva: React solo hace volar las fotos que quedan a la
 * vista, y la tarjeta tiene que estar ya en su lugar en ese momento.
 */

const scrollKey = (url: string) => `catalog-scroll:${url}`;
const here = () => `${location.pathname}${location.search}`;

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null; // Navegación privada o almacenamiento bloqueado: se vuelve sin reponer el scroll.
  }
}

/** En el perfil: convierte el "atrás" hacia el catálogo en una navegación animada. */
export function CatalogBackTransition() {
  const router = useRouter();
  useEffect(() => {
    // Scroll propio del perfil. Al tocar "atrás" el navegador repone en el acto el scroll del catálogo
    // sobre el perfil todavía visible; se lo devuelve antes de la captura, con su foto a la vista.
    let profileScroll = window.scrollY;
    const onScroll = () => {
      profileScroll = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onPopState = () => {
      if (location.pathname !== "/profesionales") return false; // Otro destino: lo maneja Next.
      window.removeEventListener("scroll", onScroll);
      window.scrollTo({ top: profileScroll, behavior: "instant" });
      const url = here();
      const saved = Number(storage()?.getItem(scrollKey(url))) || 0;
      setTimeout(() => {
        // El navegador repone el scroll del catálogo después del popstate: se corrige otra vez acá.
        window.scrollTo({ top: profileScroll, behavior: "instant" });
        window.__reparaVtUpdate = () => {
          // El perfil puede ser más corto que el catálogo: sin este alto mínimo el navegador recortaría
          // el scroll. Lo quita CatalogScrollMemory al montar el catálogo.
          document.documentElement.style.minHeight = `${saved + window.innerHeight}px`;
          window.scrollTo({ top: saved, behavior: "instant" });
        };
        router.replace(url as Route, { scroll: false, transitionTypes: [PHOTO_NAV] });
      }, 0);
      return true;
    };
    window.__reparaPopstate = onPopState;
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (window.__reparaPopstate === onPopState) delete window.__reparaPopstate;
    };
  }, [router]);
  return null;
}

/** En el catálogo: recuerda el scroll de cada búsqueda (para volver desde un perfil al mismo lugar). */
export function CatalogScrollMemory() {
  useLayoutEffect(() => {
    document.documentElement.style.minHeight = "";
    const store = storage();
    if (!store) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => store.setItem(scrollKey(here()), String(Math.round(window.scrollY))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}
