import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, NETWORK_ERROR, onSessionLost, setCsrfToken } from "./client";
import { errorMessage, fieldErrors } from "./errors";

const API = "http://localhost:3001/api/v1";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const expired = () => json(401, { statusCode: 401, code: "ACCESS_TOKEN_EXPIRED", message: "La sesión expiró." });

describe("api", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setCsrfToken(null);
  });
  afterEach(() => vi.unstubAllGlobals());

  const requestAt = (index: number) => {
    const [url, init] = fetchMock.mock.calls[index]!;
    return { url: String(url), init: init!, headers: init!.headers as Record<string, string> };
  };

  it("manda cookies, y en las escrituras X-Requested-With y el token CSRF en memoria", async () => {
    setCsrfToken("token-csrf");
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));

    await api("/favoritos", { method: "PUT", body: { a: 1 } });

    const { url, init, headers } = requestAt(0);
    expect(url).toBe(`${API}/favoritos`);
    expect(init.credentials).toBe("include");
    expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
    expect(headers["X-CSRF-Token"]).toBe("token-csrf");
    expect(init.body).toBe('{"a":1}');
  });

  it("los GET no llevan encabezados de escritura y omiten parámetros vacíos", async () => {
    setCsrfToken("token-csrf");
    fetchMock.mockResolvedValueOnce(json(200, []));

    await api("/catalog/professionals", { query: { page: 2, professionId: undefined, availableNow: true, q: "" } });

    const { url, headers } = requestAt(0);
    expect(url).toBe(`${API}/catalog/professionals?page=2&availableNow=true`);
    expect(headers["X-Requested-With"]).toBeUndefined();
    expect(headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("devuelve undefined en respuestas sin cuerpo (204 y 200 vacío)", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    fetchMock.mockResolvedValueOnce(new Response("", { status: 200 }));
    await expect(api("/a", { method: "POST" })).resolves.toBeUndefined();
    await expect(api("/b")).resolves.toBeUndefined();
  });

  it("convierte el formato de error del backend en ApiError", async () => {
    fetchMock.mockResolvedValueOnce(
      json(409, { statusCode: 409, code: "REVIEW_WINDOW_CLOSED", message: "Ya pasaron los 30 días.", requestId: "r-1" }),
    );
    const error = await api("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, code: "REVIEW_WINDOW_CLOSED", requestId: "r-1" });
  });

  it("sin respuesta del servidor lanza NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(api("/x")).rejects.toMatchObject({ code: NETWORK_ERROR, status: 0 });
  });

  it("ante ACCESS_TOKEN_EXPIRED renueva una vez y reintenta con el token nuevo", async () => {
    setCsrfToken("viejo");
    fetchMock
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(json(200, { csrfToken: "nuevo" }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await api("/x", { method: "POST" });

    expect(requestAt(1).url).toBe(`${API}/auth/refresh`);
    expect(requestAt(1).headers["X-CSRF-Token"]).toBe("viejo");
    expect(requestAt(2).headers["X-CSRF-Token"]).toBe("nuevo");
  });

  it("varios pedidos vencidos a la vez comparten UN solo refresh", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/auth/refresh")) return json(200, { csrfToken: "nuevo" });
      const already = fetchMock.mock.calls.some(([u]) => String(u).endsWith("/auth/refresh"));
      return already ? json(200, { ok: true }) : expired();
    });

    await Promise.all([api("/a"), api("/b"), api("/c")]);

    const refreshes = fetchMock.mock.calls.filter(([u]) => String(u).endsWith("/auth/refresh"));
    expect(refreshes).toHaveLength(1);
  });

  it("si la renovación falla, avisa que la sesión terminó y no reintenta", async () => {
    const lost = vi.fn();
    const unsubscribe = onSessionLost(lost);
    fetchMock.mockResolvedValueOnce(expired()).mockResolvedValueOnce(json(401, { code: "INVALID_REFRESH_TOKEN" }));

    await expect(api("/x")).rejects.toMatchObject({ code: "ACCESS_TOKEN_EXPIRED" });
    expect(lost).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("un 401 que no es de vencimiento no intenta renovar", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { code: "UNAUTHORIZED", message: "Iniciá sesión." }));
    await expect(api("/auth/me")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("mensajes de error", () => {
  it("usa mensajes propios para códigos genéricos y el del backend para el resto", () => {
    expect(errorMessage(new ApiError(429, "TOO_MANY_REQUESTS", "Too Many Requests"))).toMatch(/demasiados intentos/);
    expect(errorMessage(new ApiError(409, "REVIEW_WINDOW_CLOSED", "Ya pasaron los 30 días."))).toBe(
      "Ya pasaron los 30 días.",
    );
    expect(errorMessage(new Error("boom"))).toMatch(/error inesperado/);
  });

  it("no muestra los detalles técnicos en inglés del backend", () => {
    const error = new ApiError(400, "VALIDATION_FAILED", "Los datos enviados no son válidos.", [
      { field: "password", errors: ["password must be longer than or equal to 8 characters"] },
      { field: "neighborhood.name", errors: ["name must be longer than or equal to 2 characters"] },
    ]);
    expect(fieldErrors(error)).toEqual({ password: "Revisá este dato.", "neighborhood.name": "Revisá este dato." });
  });
});
