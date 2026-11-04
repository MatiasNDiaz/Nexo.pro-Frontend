/**
 * Teléfonos tal como los guarda el backend: `+` opcional y 8 a 15 dígitos (RegisterDto.phone).
 * La plataforma hoy opera en Córdoba (Argentina): un número sin `+` se interpreta como argentino.
 */

const digitsOnly = (phone: string) => phone.replace(/\D/g, "");

/** Para `tel:`: el número como se cargó, sin espacios ni separadores. */
export function telHref(phone: string): string | null {
  const normalized = phone.trim().replace(/[^\d+]/g, "");
  return /^\+?\d{8,15}$/.test(normalized) ? `tel:${normalized}` : null;
}

/**
 * Número internacional para WhatsApp (solo dígitos), o null si no se puede armar con certeza.
 * - Con `+`: ya es internacional.
 * - 10 dígitos (característica + número, sin 0 ni 15): celular argentino → 54 9 + número.
 * - Con 0 o 15 al principio, u otra longitud: ambiguo → null (no se ofrece WhatsApp).
 */
export function whatsappNumber(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = digitsOnly(trimmed);
  if (trimmed.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? digits : null;
  if (digits.length === 10 && !digits.startsWith("0") && !digits.startsWith("15")) return `549${digits}`;
  return null;
}
