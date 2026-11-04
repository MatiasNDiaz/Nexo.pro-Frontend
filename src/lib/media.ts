import { env } from "@/config/env";

/**
 * URL utilizable de un archivo público del backend:
 * - Cloudinary (producción): URL https absoluta.
 * - Almacenamiento local (solo desarrollo): ruta de la API (`/api/v1/uploads/:id/content`), a la que
 *   hay que anteponer el origen de la API (contrato §8).
 * Cualquier otra cosa (otro esquema, `javascript:`, datos vacíos) se descarta.
 */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/") && !url.startsWith("//")) return `${env.apiUrl}${url}`;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** ¿Se puede optimizar con next/image? Solo los hosts permitidos en next.config.ts (Cloudinary). */
export function isOptimizable(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

/**
 * Enlace externo cargado por un usuario (redes del profesional). Solo http(s): un `javascript:` o
 * `data:` en un href sería un XSS aunque React escape el texto.
 */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
