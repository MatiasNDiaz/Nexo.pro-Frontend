import { ApiError, NETWORK_ERROR } from "./client";

/**
 * Mensajes propios para los códigos donde el texto del backend es genérico o conviene orientar mejor.
 * Para el resto se usa el `message` del backend, que ya está en español y pensado para mostrarse.
 */
const messages: Record<string, string> = {
  [NETWORK_ERROR]: "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.",
  TOO_MANY_REQUESTS: "Hiciste demasiados intentos seguidos. Esperá un momento y volvé a probar.",
  INTERNAL_ERROR: "Ocurrió un error inesperado. Intentá de nuevo en unos minutos.",
  SERVICE_UNAVAILABLE: "El servicio no está disponible en este momento. Intentá de nuevo en unos minutos.",
  INVALID_CREDENTIALS: "El email o la contraseña no son correctos.",
  INVALID_MFA: "El código no es válido o ya venció.",
  INVALID_TOKEN: "El enlace no es válido o ya venció.",
  CAPTCHA_REQUIRED: "Completá la verificación para seguir.",
  ORIGIN_NOT_ALLOWED: "No pudimos validar el origen del pedido. Recargá la página e intentá de nuevo.",
  CSRF_INVALID: "Tu sesión necesita actualizarse. Recargá la página e intentá de nuevo.",
  VALIDATION_FAILED: "Revisá los datos marcados.",
};

/** Mensaje para mostrarle a la persona (nunca el detalle técnico). */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return messages[error.code] ?? error.message;
  return messages.INTERNAL_ERROR!;
}

export function isApiError(error: unknown, ...codes: string[]): error is ApiError {
  return error instanceof ApiError && (codes.length === 0 || codes.includes(error.code));
}

/**
 * Campos con error según el backend. Los detalles de validación del backend vienen en inglés técnico
 * ("password must be longer than..."), así que no se muestran: se marca el campo con un texto propio.
 * Los nombres anidados (`neighborhood.name`) se devuelven tal cual.
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_FAILED") return {};
  return Object.fromEntries(error.details.map((detail) => [detail.field, "Revisá este dato."]));
}
