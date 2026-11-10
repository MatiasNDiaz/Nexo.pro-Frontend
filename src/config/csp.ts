/**
 * Content-Security-Policy del sitio (FRONTEND_DECISIONES: "CSP sin nonce").
 *
 * Por qué sin nonce: con `cacheComponents` las partes estáticas de cada página se arman al compilar
 * y no pueden llevar el nonce de cada visita (la guía de CSP de Next 16 lo marca como incompatible
 * con el prerender parcial). Los scripts en línea de Next (y el de popstate-gate.ts) quedan
 * permitidos con 'unsafe-inline'; todo lo demás se limita a orígenes conocidos:
 * - un script inyectado no puede mandar datos a otro servidor (connect-src, img-src, form-action);
 * - el sitio no se puede mostrar dentro de un marco ajeno (frame-ancestors);
 * - no se cargan scripts de otros orígenes salvo Turnstile.
 *
 * Es una función pura (sin leer el entorno) para poder probarla; next.config.ts le pasa los valores.
 */
export interface CspOptions {
  /** Origen de la API (NEXT_PUBLIC_API_URL). */
  apiUrl: string;
  /** `next dev`: React necesita eval para reconstruir errores del servidor. */
  dev: boolean;
}

const CLOUDINARY_UPLOAD = "https://api.cloudinary.com";
const CLOUDINARY_DELIVERY = "https://res.cloudinary.com";
const TURNSTILE = "https://challenges.cloudflare.com";

/** El mismo origen con ws:/wss: (Socket.IO pasa de pedidos comunes a WebSocket). */
function webSocketOrigin(origin: string): string | null {
  if (origin.startsWith("https://")) return `wss://${origin.slice("https://".length)}`;
  if (origin.startsWith("http://")) return `ws://${origin.slice("http://".length)}`;
  return null;
}

export function buildCsp({ apiUrl, dev }: CspOptions): string {
  const api = apiUrl.replace(/\/+$/, "");
  const apiSocket = webSocketOrigin(api);
  const https = api.startsWith("https://");

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", TURNSTILE, ...(dev ? ["'unsafe-eval'"] : [])],
    // Estilos en línea: los usa React (prop `style`), next/image y el widget de Turnstile.
    "style-src": ["'self'", "'unsafe-inline'"],
    // La API entrega los archivos del almacenamiento local (solo desarrollo); Cloudinary, los de producción.
    "img-src": ["'self'", "data:", "blob:", CLOUDINARY_DELIVERY, api],
    "media-src": ["'self'", "blob:", CLOUDINARY_DELIVERY, api],
    "font-src": ["'self'"],
    "connect-src": ["'self'", api, ...(apiSocket ? [apiSocket] : []), CLOUDINARY_UPLOAD],
    "frame-src": [TURNSTILE],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  // Solo con HTTPS: en http (desarrollo, red local) pasaría los pedidos a https y romperían.
  if (https) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}
