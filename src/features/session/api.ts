import { api, ApiError, hasCsrfToken, setCsrfToken, type Schemas } from "@/lib/api/client";

export type Me = Schemas["MeDto"];
export type SessionResponse = Schemas["SessionResponseDto"];
export type RegisterInput = Schemas["RegisterDto"];
export type GoogleRegisterInput = Schemas["GoogleRegisterDto"];
export type GooglePending = Schemas["GooglePendingDto"];

/** Toda respuesta que abre una sesión trae el token CSRF del dispositivo: se guarda en memoria. */
function keepCsrf<T extends { csrfToken: string }>(response: T): T {
  setCsrfToken(response.csrfToken);
  return response;
}

const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

/**
 * ¿Hay sesión? Las cookies son HttpOnly: no se pueden leer, hay que preguntar.
 * 1. Sin token CSRF en memoria (página recién cargada): `GET /auth/csrf`, que funciona con la cookie
 *    de refresh aunque el access haya vencido. `{ csrfToken: null }` = sin sesión (backend etapa 18;
 *    antes respondía 401, que se sigue aceptando).
 * 2. `GET /auth/me` (si el access venció, el cliente HTTP renueva y reintenta solo).
 */
export async function fetchSession(): Promise<Me | null> {
  try {
    if (!hasCsrfToken()) {
      const { csrfToken } = await api<Schemas["SessionCsrfDto"]>("/auth/csrf");
      if (!csrfToken) {
        setCsrfToken(null);
        return null;
      }
      setCsrfToken(csrfToken);
    }
    return await api<Me>("/auth/me");
  } catch (error) {
    if (isUnauthorized(error)) {
      setCsrfToken(null);
      return null;
    }
    throw error;
  }
}

/**
 * Para el admin, el login responde `{ mfaRequired: true }` (MfaRequiredDto, docs E-069). Ese DTO no
 * figura en el OpenAPI del backend (declara solo la respuesta con sesión), por eso se tipa acá.
 */
type MfaRequired = { mfaRequired: true };

export async function login(input: Schemas["LoginDto"]): Promise<SessionResponse | MfaRequired> {
  const response = await api<SessionResponse | MfaRequired>("/auth/login", { method: "POST", body: input });
  return "csrfToken" in response ? keepCsrf(response) : { mfaRequired: true };
}

export async function verifyMfa(input: Schemas["MfaVerifyDto"]): Promise<SessionResponse> {
  return keepCsrf(await api<SessionResponse>("/auth/mfa/verify", { method: "POST", body: input }));
}

/** Tolerante: aunque la sesión ya no exista, el backend borra las cookies. */
export async function logout(): Promise<void> {
  try {
    await api("/auth/logout", { method: "POST" });
  } finally {
    setCsrfToken(null);
  }
}

/** Responde siempre lo mismo, exista o no el email (no revela cuentas). No inicia sesión. */
export function register(input: RegisterInput): Promise<Schemas["MessageDto"]> {
  return api<Schemas["MessageDto"]>("/auth/register", { method: "POST", body: input });
}

export function verifyEmail(token: string): Promise<void> {
  return api("/auth/email/verify", { method: "POST", body: { token } });
}

export function resendVerificationEmail(): Promise<void> {
  return api("/auth/email/resend", { method: "POST" });
}

export function resetPassword(token: string, newPassword: string): Promise<void> {
  return api("/auth/password/reset", { method: "POST", body: { token, newPassword } });
}

export function closeSessionByLink(token: string): Promise<Schemas["SessionClosedDto"]> {
  return api<Schemas["SessionClosedDto"]>("/auth/sessions/close-by-link", { method: "POST", body: { token } });
}

// ---- Google (ADR 0015 y 0023) ----

export function fetchGooglePending(): Promise<GooglePending> {
  return api<GooglePending>("/auth/google/pending");
}

export async function linkGoogleWithPassword(password: string): Promise<SessionResponse> {
  return keepCsrf(await api<SessionResponse>("/auth/google/link", { method: "POST", body: { password } }));
}

export function requestGoogleLinkEmail(): Promise<void> {
  return api("/auth/google/link/email", { method: "POST" });
}

export async function confirmGoogleLink(token: string): Promise<SessionResponse> {
  return keepCsrf(await api<SessionResponse>("/auth/google/link/confirm", { method: "POST", body: { token } }));
}

export async function registerWithGoogle(input: GoogleRegisterInput): Promise<SessionResponse> {
  return keepCsrf(await api<SessionResponse>("/auth/google/register", { method: "POST", body: input }));
}
