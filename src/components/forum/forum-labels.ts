import type { ForumType } from "@/features/forum/filters";
import { formatDay, formatDate } from "@/lib/format";

export const forumTypeLabel: Record<ForumType, string> = {
  QUESTION: "Pregunta",
  PROFESSIONAL_WANTED: "Busco profesional",
};

export const forumRoleLabel = { CUSTOMER: "Cliente", PROFESSIONAL: "Profesional" } as const;

/** La fecha límite llega como día (AAAA-MM-DD) o como fecha completa. */
export function formatDeadline(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDay(value) : formatDate(value);
}

/** Primeras palabras del texto para títulos y descripciones (sin cortar palabras). */
export function excerpt(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6))}…`;
}
