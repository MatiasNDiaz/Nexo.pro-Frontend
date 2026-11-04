import { z } from "zod";

/** Origen exacto (esquema + host + puerto opcional), sin path ni barra final: igual que FRONTEND_ORIGINS del backend. */
const origin = z
  .string()
  .regex(/^https?:\/\/[a-z0-9.-]+(:\d{1,5})?$/i, "debe ser un origen exacto, p. ej. https://api.dominio.com");

const schema = z.object({
  /** Origen de la API. Las rutas se arman como `${apiUrl}/api/v1/...`. */
  NEXT_PUBLIC_API_URL: origin,
  /** Origen público del frontend (canonical, sitemap, Open Graph). */
  NEXT_PUBLIC_SITE_URL: origin,
  /** Clave pública del widget de Cloudflare Turnstile. Sin ella no se muestra el CAPTCHA. */
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  /**
   * "true" si el backend tiene el login con Google activado (GOOGLE_PROVIDER distinto de `disabled`).
   * El frontend no puede averiguarlo sin intentarlo: con Google apagado, el botón llevaría a un 404.
   */
  NEXT_PUBLIC_GOOGLE_LOGIN: z.enum(["true", "false"]).optional(),
});

export type PublicEnv = z.infer<typeof schema>;

/**
 * Valida las variables públicas. Se exporta aparte para poder probarla sin depender del entorno real.
 * Los mensajes nombran las variables, nunca sus valores.
 */
export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join(".")} (${issue.message})`);
    throw new Error(`Configuración inválida. Revisá estas variables de entorno: ${problems.join("; ")}`);
  }
  return result.data;
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
