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

// ---- Estilo por sección (ADR 0034 del backend) ----

export type ThemeSections = NonNullable<ProfileTheme["sections"]>;
export type SectionKey = keyof ThemeSections;
export type SectionStyle = Schemas["SectionStyleDto"];
export type SectionAnimation = NonNullable<SectionStyle["animation"]>;
export type SectionSize = NonNullable<SectionStyle["size"]>;

/** Las secciones de la página en el orden en que aparecen, con su nombre para el editor. */
export const sectionLabels: Record<SectionKey, string> = {
  pagina: "Fondo de la página",
  presentacion: "Presentación",
  datos: "Datos",
  sobre: "Sobre vos",
  trabajos: "Trabajos",
  certificados: "Certificados",
  resenas: "Reseñas",
  contacto: "Contacto",
  zonas: "Zonas de trabajo",
  horarios: "Horarios",
  redes: "Redes y sitio web",
};

export const sectionAnimations: Record<SectionAnimation, { label: string; detail: string }> = {
  aparecer: { label: "Aparecer", detail: "Se funde de a poco" },
  subir: { label: "Subir", detail: "Entra desde abajo" },
  costado: { label: "Desde el costado", detail: "Entra desde la izquierda" },
  zoom: { label: "Zoom", detail: "Crece hasta su tamaño" },
  rebote: { label: "Rebote", detail: "Sube y rebota" },
  girar: { label: "Girar", detail: "Gira hacia adelante" },
};

export const SECTION_SIZES: readonly SectionSize[] = [85, 90, 95, 100, 105, 110, 115, 120, 125];
export const HEX_COLOR = /^#[0-9a-f]{6}$/;

/** Secciones que no son una caja: con fondo propio necesitan relleno y bordes redondeados. */
const OPEN_SECTIONS: ReadonlySet<SectionKey> = new Set(["presentacion", "sobre", "trabajos", "certificados", "resenas"]);

/**
 * Atributos de una sección con su estilo: fondo (o degradé), color de letra, tamaño y animación.
 * - La letra se aplica redefiniendo los colores del sistema dentro de la sección (`--color-ink`, los
 *   grises y las cajas internas), así el texto y las tarjetas de adentro siguen el color elegido.
 * - El tamaño escala todo el contenido (`zoom`).
 * - La animación usa la aparición al hacer scroll (`data-reveal="anim-…"`, estilos en globals.css).
 * Los valores vienen validados del backend (#rrggbb) y van en atributos `style` de React.
 */
export function sectionAttributes(
  sections: ThemeSections | undefined,
  key: SectionKey,
  /** Aparición sin animación propia: "" (la común) o null (ninguna, para lo que se ve al cargar). */
  fallbackReveal: string | null = "",
): { style: CSSProperties; className?: string; "data-reveal"?: string; "data-section": SectionKey } {
  const style = sections?.[key] ?? {};
  const css: Record<string, string | number> = {};
  if (style.background && HEX_COLOR.test(style.background)) {
    css.background = style.backgroundTo && HEX_COLOR.test(style.backgroundTo) ? `linear-gradient(135deg, ${style.background}, ${style.backgroundTo})` : style.background;
  }
  if (style.text && HEX_COLOR.test(style.text)) {
    const text = style.text;
    Object.assign(css, {
      color: text,
      "--color-ink": text,
      "--color-brand-900": text,
      // brand-800 no: es la letra de las etiquetas con fondo claro propio (p. ej. el estado "Ahora").
      "--color-muted": `color-mix(in srgb, ${text} 72%, transparent)`,
      "--color-muted-strong": `color-mix(in srgb, ${text} 84%, transparent)`,
      "--color-surface": `color-mix(in srgb, ${text} 7%, transparent)`,
      "--color-canvas": `color-mix(in srgb, ${text} 10%, transparent)`,
      "--color-line": `color-mix(in srgb, ${text} 22%, transparent)`,
    });
    // El nombre (h1) usa el tono más oscuro; en reseñas ese tono es el fondo del promedio.
    if (key === "presentacion" || key === "pagina") css["--color-brand-950"] = text;
  }
  if (style.size && style.size !== 100) css.zoom = style.size / 100;
  const reveal = style.animation ? `anim-${style.animation}` : fallbackReveal;
  return {
    style: css as CSSProperties,
    className: css.background && OPEN_SECTIONS.has(key) ? "rounded-3xl p-5 sm:p-7" : undefined,
    ...(reveal !== null ? { "data-reveal": reveal } : {}),
    "data-section": key,
  };
}

export type ThemeLevel = "NONE" | "STANDARD" | "EXTENDED";

/** Campos de cada sección según el plan (mismas reglas que el backend, profile-theme.ts). */
export const sectionFieldsFor: Record<ThemeLevel, ReadonlyArray<keyof SectionStyle>> = {
  NONE: [],
  STANDARD: ["background", "text"],
  EXTENDED: ["background", "backgroundTo", "text", "size", "animation"],
};

/**
 * El tema sin lo que el plan no incluye, para mandarlo al backend (que reemplaza el tema entero y
 * rechaza con 403 lo que el plan no admite). Copia la regla de themeForPlan del backend.
 */
export function themeForLevel(theme: ProfileTheme, level: ThemeLevel): ProfileTheme {
  if (level === "NONE") return {};
  const { animation, sections, ...rest } = theme;
  const fields = new Set<string>(sectionFieldsFor[level]);
  const kept = Object.fromEntries(
    Object.entries(sections ?? {})
      .map(([key, style]) => {
        const clean = Object.fromEntries(Object.entries(style ?? {}).filter(([field, value]) => value !== undefined && value !== null && fields.has(field))) as SectionStyle;
        if (clean.backgroundTo && !clean.background) delete clean.backgroundTo;
        return [key, clean] as const;
      })
      .filter(([, style]) => Object.keys(style).length > 0),
  ) as ThemeSections;
  return {
    ...rest,
    ...(level === "EXTENDED" && animation ? { animation } : {}),
    ...(Object.keys(kept).length ? { sections: kept } : {}),
  };
}

/** Contraste WCAG entre dos colores #rrggbb (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}
