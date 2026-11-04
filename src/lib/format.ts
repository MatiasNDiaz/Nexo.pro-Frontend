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

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
