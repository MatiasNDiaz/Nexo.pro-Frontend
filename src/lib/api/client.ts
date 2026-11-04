import { env } from "@/config/env";
import type { components } from "./schema";

/** DTOs del backend, generados desde su OpenAPI (ver scripts/generate-api-types.mjs). */
export type Schemas = components["schemas"];

export interface ApiErrorDetail {
  field: string;
  errors: string[];
}

/**
 * Error de la API con el formato único del backend:
 * `{ statusCode, code, message, details, requestId, timestamp }`. Se decide por `code`, nunca por el texto.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: ApiErrorDetail[] = [],
    readonly requestId: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sin conexión, CORS o la API caída: no hubo respuesta HTTP. */
export const NETWORK_ERROR = "NETWORK_ERROR";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Query = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  /** Uso interno: evita el ciclo renovar → reintentar → renovar. */
  skipRefresh?: boolean;
}

/*
 * Token CSRF del dispositivo. SOLO en memoria (contrato §4): se pierde al recargar y se vuelve a pedir
 * con GET /auth/csrf. Nunca va a localStorage ni a una cookie legible.
 */
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function hasCsrfToken(): boolean {
  return csrfToken !== null;
}

/** Avisos de "la sesión terminó" (el refresh falló): el estado de sesión vuelve a anónimo. */
const sessionLostListeners = new Set<() => void>();

export function onSessionLost(listener: () => void): () => void {
  sessionLostListeners.add(listener);
  return () => sessionLostListeners.delete(listener);
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as Partial<{
      code: string;
      message: string;
      details: ApiErrorDetail[];
      requestId: string;
    }>;
    return new ApiError(
      response.status,
      body.code ?? "ERROR",
      body.message ?? "No pudimos completar la operación.",
      Array.isArray(body.details) ? body.details : [],
      body.requestId ?? response.headers.get("X-Request-Id"),
    );
  } catch {
    return new ApiError(response.status, "ERROR", "No pudimos completar la operación.", [], response.headers.get("X-Request-Id"));
  }
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    // Sin este encabezado la API rechaza toda escritura (403 MISSING_REQUESTED_WITH).
    headers["X-Requested-With"] = "XMLHttpRequest";
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }
  try {
    return await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "include", // La sesión viaja solo en cookies HttpOnly de la API.
      cache: "no-store",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, NETWORK_ERROR, "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
  }
}

/*
 * Renovación de sesión de a una: si varios pedidos vencen juntos, esperan el MISMO refresh. Dos
 * refresh con la misma cookie fuera de la gracia de 10 s revocarían el dispositivo (contrato §5).
 */
let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const response = await send("/auth/refresh", { method: "POST", skipRefresh: true });
      if (!response.ok) return false;
      const body = (await response.json()) as Schemas["CsrfTokenDto"];
      setCsrfToken(body.csrfToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * Llamada a la API desde el navegador. Ante `401 ACCESS_TOKEN_EXPIRED` renueva la sesión y reintenta
 * UNA vez; si la renovación falla, avisa que la sesión terminó y propaga el error.
 * Las respuestas sin cuerpo (204, o 200 vacío) devuelven `undefined`.
 */
export async function api<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);

  if (!response.ok) {
    const error = await parseError(response);
    if (error.status === 401 && error.code === "ACCESS_TOKEN_EXPIRED" && !options.skipRefresh) {
      if (await refreshSession()) return api<T>(path, { ...options, skipRefresh: true });
      setCsrfToken(null);
      sessionLostListeners.forEach((listener) => listener());
    }
    throw error;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
