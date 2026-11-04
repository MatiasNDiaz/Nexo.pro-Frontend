import type { Page, Request, Route } from "@playwright/test";

/**
 * API simulada para las pruebas de punta a punta. Los datos privados se piden desde el navegador,
 * así que se pueden interceptar sin levantar el backend. Las formas de las respuestas siguen el
 * contrato documentado (docs/BACKEND_ENDPOINTS.md); cada prueba define solo lo que usa.
 */
export const API = "http://localhost:3001/api/v1";

export type Handler = (request: Request) => { status: number; body?: unknown } | Promise<{ status: number; body?: unknown }>;

export const json = (status: number, body?: unknown) => ({ status, body });
export const apiError = (status: number, code: string, message = "Error") => ({
  status,
  body: { statusCode: status, code, message, details: [], requestId: "req-test", timestamp: new Date().toISOString() },
});

export const me = (overrides: Record<string, unknown> = {}) => ({
  id: "00000000-0000-4000-8000-000000000001",
  email: "ana@example.com",
  firstName: "Ana",
  lastName: "Pérez",
  role: "CUSTOMER",
  status: "PENDING_VERIFICATION",
  statusReason: null,
  verificationStatus: "NOT_STARTED",
  emailVerified: false,
  avatarUrl: null,
  pendingAvatarUrl: null,
  createdAt: "2026-11-01T12:00:00.000Z",
  hasPassword: true,
  googleLinked: false,
  ...overrides,
});

export const LOCALITY = { id: "11111111-1111-4111-8111-111111111111", name: "Córdoba" };
export const PROFESSION = { id: "22222222-2222-4222-8222-222222222222", name: "Electricista", slug: "electricista" };

/** Catálogos públicos que usan los formularios de registro. */
const catalogs: Record<string, Handler> = {
  "GET /locations/provinces": () => json(200, [{ id: "33333333-3333-4333-8333-333333333333", name: "Córdoba" }]),
  "GET /locations/localities": () => json(200, [LOCALITY]),
  "GET /locations/neighborhoods": () => json(200, [{ id: "44444444-4444-4444-8444-444444444444", name: "Nueva Córdoba" }]),
  "GET /professions": () => json(200, [PROFESSION]),
};

/**
 * Intercepta la API. Las claves son "MÉTODO /ruta" (sin /api/v1 ni query). Sin manejador, la
 * sesión es anónima (`/auth/csrf` → 401) y cualquier otra ruta responde 404, para que una llamada
 * inesperada se note en la prueba. Devuelve los pedidos recibidos para inspeccionarlos.
 */
export async function mockApi(page: Page, handlers: Record<string, Handler> = {}) {
  const calls: { key: string; request: Request }[] = [];
  const all: Record<string, Handler> = {
    "GET /auth/csrf": () => apiError(401, "UNAUTHORIZED", "Iniciá sesión."),
    ...catalogs,
    ...handlers,
  };
  await page.route(`${API}/**`, async (route: Route) => {
    const request = route.request();
    // Mismos encabezados CORS que el backend (app.setup.ts): origen exacto y credenciales.
    const cors = {
      "Access-Control-Allow-Origin": request.headers()["origin"] ?? "http://localhost:3100",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-CSRF-Token",
    };
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }
    const path = new URL(request.url()).pathname.replace("/api/v1", "");
    const key = `${request.method()} ${path}`;
    calls.push({ key, request });
    const handler = all[key];
    const result = handler ? await handler(request) : apiError(404, "NOT_FOUND", `Sin simulación para ${key}`);
    await route.fulfill({
      status: result.status,
      contentType: "application/json",
      headers: cors,
      body: result.body === undefined ? "" : JSON.stringify(result.body),
    });
  });
  return {
    calls,
    find: (key: string) => calls.filter((call) => call.key === key).map((call) => call.request),
  };
}
