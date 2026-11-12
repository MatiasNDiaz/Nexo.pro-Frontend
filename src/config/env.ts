/*
 * Variables públicas del frontend, validadas al cargar. Sin zod a propósito: este módulo lo usa el
 * cliente de la API, que está en TODAS las páginas, y zod sumaba ~110 KB de JavaScript a cada una
 * (medido el 11/11/2026). Los formularios siguen usando zod desde src/lib/zod.ts.
 */

/** Origen exacto (esquema + host + puerto opcional), sin path ni barra final: igual que FRONTEND_ORIGINS del backend. */
const ORIGIN = /^https?:\/\/[a-z0-9.-]+(:\d{1,5})?$/i;

export interface PublicEnv {
  /** Origen de la API. Las rutas se arman como `${apiUrl}/api/v1/...`. */
  NEXT_PUBLIC_API_URL: string;
  /** Origen público del frontend (canonical, sitemap, Open Graph). */
  NEXT_PUBLIC_SITE_URL: string;
  /** Clave pública del widget de Cloudflare Turnstile. Sin ella no se muestra el CAPTCHA. */
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  /**
   * "true" si el backend tiene el login con Google activado (GOOGLE_PROVIDER distinto de `disabled`).
   * El frontend no puede averiguarlo sin intentarlo: con Google apagado, el botón llevaría a un 404.
   */
  NEXT_PUBLIC_GOOGLE_LOGIN?: "true" | "false";
}

/**
 * Valida las variables públicas. Se exporta aparte para poder probarla sin depender del entorno real.
 * Los mensajes nombran las variables, nunca sus valores.
 */
export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const problems: string[] = [];
  const origin = (name: "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_SITE_URL") => {
    const value = source[name];
    if (!value) problems.push(`${name} (falta)`);
    else if (!ORIGIN.test(value)) problems.push(`${name} (debe ser un origen exacto, p. ej. https://api.dominio.com)`);
    return value ?? "";
  };
  const api = origin("NEXT_PUBLIC_API_URL");
  const site = origin("NEXT_PUBLIC_SITE_URL");
  const turnstile = source.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const google = source.NEXT_PUBLIC_GOOGLE_LOGIN;
  if (google !== undefined && google !== "true" && google !== "false") problems.push('NEXT_PUBLIC_GOOGLE_LOGIN (tiene que ser "true" o "false")');
  if (problems.length) throw new Error(`Configuración inválida. Revisá estas variables de entorno: ${problems.join("; ")}`);
  return {
    NEXT_PUBLIC_API_URL: api,
    NEXT_PUBLIC_SITE_URL: site,
    ...(turnstile ? { NEXT_PUBLIC_TURNSTILE_SITE_KEY: turnstile } : {}),
    ...(google === "true" || google === "false" ? { NEXT_PUBLIC_GOOGLE_LOGIN: google } : {}),
  };
}

// Cada variable se referencia con su nombre literal: Next.js solo reemplaza `process.env.NEXT_PUBLIC_X`
// escrito así (no con accesos dinámicos), al compilar.
const parsed = parsePublicEnv({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
  NEXT_PUBLIC_GOOGLE_LOGIN: process.env.NEXT_PUBLIC_GOOGLE_LOGIN || undefined,
});

export const env = {
  apiUrl: parsed.NEXT_PUBLIC_API_URL,
  /** Base de todas las rutas REST: el backend usa prefijo `api` y versión en la URI. */
  apiBaseUrl: `${parsed.NEXT_PUBLIC_API_URL}/api/v1`,
  siteUrl: parsed.NEXT_PUBLIC_SITE_URL,
  turnstileSiteKey: parsed.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
  googleLogin: parsed.NEXT_PUBLIC_GOOGLE_LOGIN === "true",
} as const;
