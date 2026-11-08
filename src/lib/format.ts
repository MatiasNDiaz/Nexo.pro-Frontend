/** Formatos para mostrar datos en castellano de Argentina. */

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const longDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Cordoba" });
const monthYear = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "America/Argentina/Cordoba" });

/** Montos del backend llegan como texto decimal ("15000.00"). */
export function formatMoney(amount: string | number | null | undefined): string | null {
  if (amount === null || amount === undefined || amount === "") return null;
  const value = typeof amount === "number" ? amount : Number(amount);
  return Number.isFinite(value) ? currency.format(value) : null;
}

export function formatRating(value: number): string {
  return decimal.format(value);
}

export function formatDate(iso: string): string {
  return longDate.format(new Date(iso));
}

export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(iso));
}

/** Fecha AAAA-MM-DD (sin hora) → "15 de marzo de 2027", sin corrimientos por zona horaria. */
export function formatDay(day: string): string {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
}

const ZONE = "America/Argentina/Cordoba";
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: ZONE });
const timeFormat = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONE });
const shortDayFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: ZONE });
const shortDayYearFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: ZONE });
const weekdayFormat = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", timeZone: ZONE });
const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: ZONE,
});

/** Día calendario en Córdoba (AAAA-MM-DD), para comparar fechas sin importar la zona del navegador. */
export function dayKey(iso: string | Date): string {
  return dayKeyFormat.format(typeof iso === "string" ? new Date(iso) : iso);
}

function daysBetween(iso: string, now: Date): number {
  const a = Date.parse(`${dayKey(iso)}T00:00:00Z`);
  const b = Date.parse(`${dayKey(now)}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "14:05" (hora de Córdoba). */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

/** Fecha corta para listas: la hora si es de hoy, "Ayer", "4 nov" o "4 nov 2025". */
export function formatListDate(iso: string, now = new Date()): string {
  const days = daysBetween(iso, now);
  if (days === 0) return formatTime(iso);
  if (days === 1) return "Ayer";
  const sameYear = dayKey(iso).slice(0, 4) === dayKey(now).slice(0, 4);
  // Por partes: así queda "20 dic 2025" y no "20 de dic de 2025".
  const parts = (sameYear ? shortDayFormat : shortDayYearFormat).formatToParts(new Date(iso));
  return parts
    .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
    .map((part) => part.value.replace(/\./g, ""))
    .join(" ");
}

/** Separador de días en una conversación: "Hoy", "Ayer" o "martes, 3 de noviembre". */
export function formatDayHeading(iso: string, now = new Date()): string {
  const days = daysBetween(iso, now);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  return weekdayFormat.format(new Date(iso));
}

/** "4 de noviembre, 14:05" (hora de Córdoba). */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
