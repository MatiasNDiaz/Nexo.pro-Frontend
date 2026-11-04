/**
 * Une clases condicionales. No resuelve conflictos entre utilidades de Tailwind (no hay
 * tailwind-merge): las variantes de cada componente están pensadas para no pisarse, y las clases
 * extra que recibe un componente son de layout (márgenes, ancho), no de color ni de tamaño.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
