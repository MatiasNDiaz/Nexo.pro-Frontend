import type { AttentionStatus, PublicAvailability, RateMode } from "./types";

export const attentionLabel: Record<AttentionStatus, string> = {
  AVAILABLE: "Disponible ahora",
  WORKING: "Trabajando",
  RESTING: "Descansando",
};

export const rateModeLabel: Record<RateMode, string> = {
  PER_VISIT: "por visita",
  PER_HOUR: "por hora",
  PER_JOB: "por trabajo",
};

/** 1 = lunes … 7 = domingo (como el backend). */
export const weekdayLabel: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export const exceptionLabel: Record<PublicAvailability["exceptions"][number]["type"], string> = {
  DAY_OFF: "Día libre",
  HOLIDAY: "Feriado",
  VACATION: "Vacaciones",
};

export const socialLabel: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  WEBSITE: "Sitio web",
};

/** "Ana Pérez" o el nombre comercial con la persona entre paréntesis. */
export function displayName(item: { firstName: string; lastName: string; businessName: string | null }): string {
  return `${item.firstName} ${item.lastName}`;
}

export function primaryProfession(item: { professions: { name: string; isPrimary: boolean }[] }): string | null {
  return (item.professions.find((profession) => profession.isPrimary) ?? item.professions[0])?.name ?? null;
}

/** Resumen corto de zonas: "Córdoba (Nueva Córdoba, Alberdi) y 2 más". */
export function areasSummary(areas: { localityName: string; neighborhoodName: string | null }[], max = 2): string {
  const labels = areas.map((area) => (area.neighborhoodName ? `${area.neighborhoodName}, ${area.localityName}` : `Toda ${area.localityName}`));
  if (labels.length <= max) return labels.join(" · ");
  return `${labels.slice(0, max).join(" · ")} y ${labels.length - max} más`;
}
