import type { CSSProperties } from "react";

/*
 * Ayudas para la aparición al hacer scroll (la activa <ScrollReveal />). Archivo sin "use client":
 * lo usan componentes de servidor.
 *
 * Uso: <section data-reveal> · <li data-reveal="scale" style={revealDelay(i)}>
 */

/** Estilo para escalonar los elementos de una lista (el n-ésimo espera n × paso, con tope). */
export function revealDelay(index: number, stepMs = 90, maxMs = 450): CSSProperties {
  return { "--reveal-delay": `${Math.min(index * stepMs, maxMs)}ms` } as CSSProperties;
}
