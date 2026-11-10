import { Caveat } from "next/font/google";
import type { CSSProperties } from "react";
import type { Schemas } from "@/lib/api/client";

/*
 * Personalización de la página del profesional (FI §6.3): el backend guarda SOLO nombres de listas
 * cerradas (nunca CSS del usuario) y acá se traducen a colores, tipografía y animación reales.
 * Lo que su plan no incluye, el backend no lo devuelve.
 */

export type ProfileTheme = Schemas["ProfileThemeDto"];
export type ThemeColor = NonNullable<ProfileTheme["color"]>;
export type ThemeFont = NonNullable<ProfileTheme["font"]>;
export type ThemeAnimation = NonNullable<ProfileTheme["animation"]>;

/** Colores de la lista del backend (THEME_COLORS), todos con contraste ≥ 4,5:1 contra blanco. */
export const themeColors: Record<ThemeColor, { hex: string; label: string }> = {
  azul: { hex: "#1d4ed8", label: "Azul" },
  celeste: { hex: "#0369a1", label: "Celeste" },
  turquesa: { hex: "#0f766e", label: "Turquesa" },
  verde: { hex: "#15803d", label: "Verde" },
  lima: { hex: "#4d7c0f", label: "Lima" },
  amarillo: { hex: "#a16207", label: "Amarillo" },
  naranja: { hex: "#c2410c", label: "Naranja" },
  rojo: { hex: "#b91c1c", label: "Rojo" },
  rosa: { hex: "#be185d", label: "Rosa" },
  violeta: { hex: "#6d28d9", label: "Violeta" },
  gris: { hex: "#475569", label: "Gris" },
  grafito: { hex: "#1f2937", label: "Grafito" },
};

// Solo la usa la página del profesional con la tipografía "manuscrita" (se descarga en esa ruta).
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });

export const themeFonts: Record<ThemeFont, { label: string; className: string }> = {
  moderna: { label: "Moderna", className: "font-display" },
  clasica: { label: "Clásica", className: "font-serif font-normal italic tracking-normal" },
  redondeada: { label: "Redondeada", className: "[font-family:ui-rounded,'SF_Pro_Rounded','Nunito',var(--font-inter),system-ui] tracking-normal" },
  manuscrita: { label: "Manuscrita", className: `${caveat.variable} [font-family:var(--font-caveat),cursive] tracking-normal` },
};

/** Entrada del encabezado según la animación elegida (solo Premium). Con movimiento reducido, nada. */
export const themeAnimations: Record<ThemeAnimation, { label: string; className: string }> = {
  aparecer: { label: "Aparecer", className: "motion-safe:animate-[fade-in_700ms_var(--ease-out-soft)_both]" },
  deslizar: { label: "Deslizar", className: "motion-safe:animate-[pro-slide_700ms_var(--ease-out-soft)_both]" },
  zoom: { label: "Zoom", className: "motion-safe:animate-[pro-zoom_700ms_var(--ease-out-soft)_both]" },
  rebote: { label: "Rebote", className: "motion-safe:animate-[pro-bounce_900ms_var(--ease-out-soft)_both]" },
};

/** Variables CSS del perfil: color de acento y degradé de la portada (por defecto, la identidad). */
export function themeStyle(theme: ProfileTheme): CSSProperties {
  const accent = theme.color ? themeColors[theme.color].hex : "#123b7a";
  const from = theme.gradient ? themeColors[theme.gradient.from].hex : accent;
  const to = theme.gradient ? themeColors[theme.gradient.to].hex : "#07152a";
  return { "--pro-accent": accent, "--pro-from": from, "--pro-to": to } as CSSProperties;
}
