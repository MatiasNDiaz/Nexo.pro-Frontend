"use client";

import { useEffect } from "react";

/**
 * Activa la aparición al hacer scroll para todos los elementos con `data-reveal` (estilos en
 * globals.css). Un único IntersectionObserver para toda la página, en vez de un componente cliente
 * por bloque: el contenido sigue siendo de servidor y el costo en JavaScript es mínimo.
 *
 * - Cada elemento se anima una sola vez, cuando entra en pantalla.
 * - Un MutationObserver incorpora el contenido de las páginas a las que se navega después.
 * - Con `prefers-reduced-motion: reduce` no hace nada: todo se ve directamente.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          intersection.unobserve(entry.target);
        }
      },
      // Se dispara un poco antes de que el elemento esté entero en pantalla.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const observeWithin = (node: ParentNode) => {
      node.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((element) => intersection.observe(element));
    };

    observeWithin(document);
    root.classList.add("reveal-on");

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]:not([data-revealed])")) intersection.observe(node);
          observeWithin(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      intersection.disconnect();
      root.classList.remove("reveal-on");
    };
  }, []);

  return null;
}
