"use server";

import { updateTag } from "next/cache";

const SLUG = /^[a-z0-9-]{1,80}$/;
const PER_SLUG_MS = 5_000;
const GLOBAL_PER_MINUTE = 30;

const lastBySlug = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;

/**
 * Vence la caché de la página pública de un profesional para que vea enseguida lo que acaba de
 * guardar (por ejemplo, "Aplicar estilos"). Sin esto, la página puede tardar hasta un minuto.
 *
 * Una Server Action es un punto de entrada público: no confía en quien la llama. Solo vence la caché
 * (no cambia datos) y está limitada (una vez cada 5 s por perfil y 30 por minuto en total) para que
 * nadie la use para hacer que el servidor de Next le pida de más al backend, que limita por IP.
 */
export async function refreshPublicProfile(slug: string): Promise<boolean> {
  if (!allow(slug)) return false;
  updateTag(`profile:${slug}`);
  return true;
}

/** El catálogo es uno solo para todos: se vence como mucho una vez cada 10 s. */
const CATALOG_EVERY_MS = 10_000;
let lastCatalog = 0;

/**
 * Después de un cambio de plan (pago aplicado): el plan cambia el diseño del perfil y el orden y la
 * etiqueta de la tarjeta en el catálogo. Vence las dos cachés con los mismos límites.
 */
export async function refreshAfterPlanChange(slug: string): Promise<boolean> {
  if (!allow(slug)) return false;
  updateTag(`profile:${slug}`);
  const now = Date.now();
  if (now - lastCatalog >= CATALOG_EVERY_MS) {
    lastCatalog = now;
    updateTag("catalog");
  }
  return true;
}

function allow(slug: unknown): slug is string {
  if (typeof slug !== "string" || !SLUG.test(slug)) return false;
  const now = Date.now();
  if (now - (lastBySlug.get(slug) ?? 0) < PER_SLUG_MS) return false;
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= GLOBAL_PER_MINUTE) return false;
  windowCount++;
  lastBySlug.set(slug, now);
  if (lastBySlug.size > 1_000) lastBySlug.clear();
  return true;
}
