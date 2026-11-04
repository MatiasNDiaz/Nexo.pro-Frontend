import { api, setCsrfToken, type Schemas } from "@/lib/api/client";

/*
 * Cuenta propia: datos personales, foto, identidad, seguridad y baja (docs E-058 a E-082, E-101,
 * E-102, E-124, E-125, E-194 a E-197). Todas exigen sesión; el backend valida cada permiso.
 */

export type PersonalData = Schemas["PersonalDataDto"];
export type Verification = Schemas["VerificationResponseDto"];
export type StartVerification = Schemas["StartVerificationResponseDto"];
export type Device = Schemas["SessionSummaryDto"];
export type AvatarResult = Schemas["AvatarResponseDto"];

/**
 * El OpenAPI declara `extraInfo` como objeto (anotación incompleta); el backend recibe y devuelve
 * texto de hasta 300 caracteres (UpdateCustomerProfileDto). Se tipa según el código.
 */
export interface CustomerProfile {
  extraInfo: string | null;
}

export const accountKeys = {
  personal: ["account", "personal"] as const,
  customer: ["account", "customer"] as const,
  verification: ["account", "verification"] as const,
  devices: ["account", "devices"] as const,
};

export const getPersonalData = () => api<PersonalData>("/users/me");

export function updatePersonalData(input: Schemas["UpdatePersonalDataDto"]) {
  return api<PersonalData>("/users/me", { method: "PATCH", body: input });
}

export const getCustomerProfile = () => api<CustomerProfile>("/customers/me");

export function updateCustomerProfile(extraInfo: string | null) {
  return api<CustomerProfile>("/customers/me", { method: "PATCH", body: { extraInfo } });
}

/** Usa como foto un archivo AVATAR ya confirmado. Con la identidad aprobada queda en revisión (ADR 0019). */
export function setAvatar(fileId: string) {
  return api<AvatarResult>("/users/me/avatar", { method: "PUT", body: { fileId } });
}

export const getVerification = () => api<Verification>("/identity-verification/me");

export function startVerification() {
  return api<StartVerification>("/identity-verification", { method: "POST" });
}

export const getDevices = () => api<Device[]>("/auth/sessions");

export function closeDevice(id: string) {
  return api(`/auth/sessions/${id}`, { method: "DELETE" });
}

/**
 * Cierra la sesión en todos los dispositivos, incluido este: el token CSRF deja de servir. Se borra
 * solo si salió bien (si falla, la sesión sigue y el token también).
 */
export async function closeAllDevices() {
  await api("/auth/logout-all", { method: "POST" });
  setCsrfToken(null);
}

/** Cambia la contraseña: el backend cierra los demás dispositivos y conserva este. */
export function changePassword(currentPassword: string, newPassword: string) {
  return api("/auth/password/change", { method: "POST", body: { currentPassword, newPassword } });
}

/** Primera contraseña de una cuenta creada con Google (exige un ingreso de hace menos de 10 minutos). */
export function setPassword(newPassword: string) {
  return api("/auth/password/set", { method: "POST", body: { newPassword } });
}

export function unlinkGoogle() {
  return api("/auth/google/link", { method: "DELETE" });
}

/**
 * Baja de la cuenta (30 días para arrepentirse; ADR 0016). Cierra todas las sesiones. Con una
 * contraseña incorrecta falla y la sesión sigue: el token CSRF se borra solo si salió bien.
 */
export async function deleteOwnAccount(password: string | undefined) {
  await api("/users/me", { method: "DELETE", body: password ? { password } : {} });
  setCsrfToken(null);
}
