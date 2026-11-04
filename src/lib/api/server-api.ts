import { env } from "@/config/env";
import { ApiError, buildUrl, NETWORK_ERROR, parseError, type Query } from "./client";

/**
 * Identificación de los pedidos que hace el SERVIDOR de Next (páginas públicas armadas para SEO).
 * Incluye "bot" a propósito: el backend excluye a los robots de las métricas Premium (ADR 0033,
 * metrics-viewer.service.ts). Así una página en caché no cuenta como una visita de una persona; la
 * visita real la registra el navegador al abrir la página (ver components/catalog/view-beacon.tsx).
 */
export const SERVER_USER_AGENT = `ReparaYaWeb/1.0 (prerender bot; +${env.siteUrl})`;

/**
 * GET público desde el servidor de Next. Sin cookies ni sesión: solo datos que cualquiera puede ver.
 * Se usa dentro de funciones con `"use cache"` (la caché la decide quien llama). Un 404 devuelve null;
 * cualquier otro error se propaga como ApiError.
 */
export async function serverGet<T>(path: string, query?: Query): Promise<T | null> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      headers: { Accept: "application/json", "User-Agent": SERVER_USER_AGENT },
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR, "No pudimos conectarnos con el servidor.");
  }
  if (response.status === 404) return null;
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as T;
}
