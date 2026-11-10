"use client";

import { ArrowLeft, Ban, Check, Crown, EllipsisVertical, Eraser, Maximize2, Paintbrush, Sparkles, Type, TriangleAlert, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  contrastRatio,
  SECTION_SIZES,
  sectionAnimations,
  sectionFieldsFor,
  sectionLabels,
  type SectionAnimation,
  type SectionKey,
  type SectionSize,
  type SectionStyle,
  type ThemeLevel,
} from "@/features/catalog/profile-theme";
import { cn } from "@/lib/cn";

type View = "menu" | "background" | "text" | "size" | "animation";

const DEFAULT_TEXT = "#10213d";
const DEFAULT_BACKGROUND = "#ffffff";

/** Las secciones donde tamaño y animación no tienen sentido (el fondo de toda la página). */
const NO_MOTION: ReadonlySet<SectionKey> = new Set(["pagina"]);

/**
 * Menú ⋮ de una sección en el editor de diseño. Las opciones van en una lista desplegable; cada una
 * abre su control: color de fondo (y degradé en Premium), color de letra, tamaño y animación. Lo que
 * el plan no incluye se ve con la etiqueta "Premium", sin poder elegirlo.
 */
export function SectionStyleMenu({
  section,
  value,
  level,
  pageBackground,
  onChange,
  className,
}: {
  section: SectionKey;
  value: SectionStyle | undefined;
  level: ThemeLevel;
  /** Fondo de la página, para medir el contraste de una sección sin fondo propio. */
  pageBackground?: string;
  onChange: (style: SectionStyle) => void;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const style = value ?? {};
  const allowed = new Set(sectionFieldsFor[level]);
  const label = sectionLabels[section];

  // Se cierra al tocar afuera o con Escape (y el foco vuelve al botón).
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const set = (patch: Partial<SectionStyle>) => {
    const next = { ...style, ...patch };
    for (const key of Object.keys(next) as (keyof SectionStyle)[]) if (next[key] === undefined) delete next[key];
    onChange(next);
  };

  const options: { view: Exclude<View, "menu">; label: string; icon: LucideIcon; field: keyof SectionStyle; hidden?: boolean }[] = [
    { view: "background", label: "Color de fondo", icon: Paintbrush, field: "background" },
    { view: "text", label: "Color de letra", icon: Type, field: "text" },
    { view: "size", label: "Tamaño", icon: Maximize2, field: "size", hidden: NO_MOTION.has(section) },
    { view: "animation", label: "Animación", icon: Sparkles, field: "animation", hidden: NO_MOTION.has(section) },
  ];
  const hasStyle = Object.keys(style).length > 0;
  const textColor = style.text ?? DEFAULT_TEXT;
  const backgrounds = style.background ? [style.background, ...(style.backgroundTo ? [style.backgroundTo] : [])] : [pageBackground ?? DEFAULT_BACKGROUND];
  const contrast = Math.min(...backgrounds.map((bg) => contrastRatio(textColor, bg)));

  return (
    // Sin `className`, el menú va en el flujo (barra del editor); con él, quien lo usa lo ubica (absolute).
    <div ref={root} className={cn(className ?? "relative", open ? "z-40" : "z-20")}>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        onClick={() => {
          setView("menu");
          setOpen((current) => !current);
        }}
        className={cn(
          "relative grid size-10 place-items-center rounded-full border shadow-card transition-[background-color,color,transform] duration-200 ease-out-soft hover:scale-105",
          open ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-brand-900 hover:bg-brand-50",
        )}
      >
        <EllipsisVertical className="size-5" aria-hidden="true" />
        <span className="sr-only">Estilo de “{label}”</span>
        {hasStyle && !open && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-amber-400 ring-2 ring-white" />}
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          className="absolute top-12 right-0 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-line bg-white p-2 text-left text-ink shadow-raised animate-[pop-in_180ms_var(--ease-out-soft)]"
        >
          {view === "menu" ? (
            <>
              <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-strong">{label}</p>
              <ul role="menu" aria-label={`Estilo de ${label}`} className="flex flex-col">
                {options
                  .filter((option) => !option.hidden)
                  .map((option) => {
                    const locked = !allowed.has(option.field);
                    return (
                      <li key={option.view} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          aria-disabled={locked || undefined}
                          onClick={() => !locked && setView(option.view)}
                          className={cn(
                            "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                            locked ? "cursor-not-allowed text-muted" : "text-brand-900 hover:bg-brand-50",
                          )}
                        >
                          <option.icon className="size-4 shrink-0" aria-hidden="true" />
                          <span className="flex-1 text-left">{option.label}</span>
                          {locked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                              <Crown className="size-3" aria-hidden="true" />
                              Premium
                            </span>
                          ) : (
                            style[option.field] !== undefined && <Check className="size-4 text-success-600" aria-label="con estilo" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                {hasStyle && (
                  <li role="none" className="mt-1 border-t border-line pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onChange({});
                        setOpen(false);
                        button.current?.focus();
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-danger-600 hover:bg-danger-50"
                    >
                      <Eraser className="size-4" aria-hidden="true" />
                      Quitar los estilos
                    </button>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <div className="flex flex-col gap-4 p-2">
              <button type="button" onClick={() => setView("menu")} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
                <ArrowLeft className="size-4" aria-hidden="true" />
                {label}
              </button>

              {view === "background" && (
                <>
                  <ColorField
                    id={`${id}-fondo`}
                    label={style.backgroundTo ? "Color de inicio" : "Color de fondo"}
                    value={style.background}
                    fallback={DEFAULT_BACKGROUND}
                    onChange={(background) => set({ background })}
                  />
                  {allowed.has("backgroundTo") ? (
                    <>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
                        <input
                          type="checkbox"
                          className="size-5 accent-brand-700"
                          checked={!!style.backgroundTo}
                          onChange={(event) =>
                            set(event.target.checked ? { background: style.background ?? "#123b7a", backgroundTo: "#0b1f3a" } : { backgroundTo: undefined })
                          }
                        />
                        Degradé
                      </label>
                      {style.backgroundTo && (
                        <ColorField id={`${id}-fondo-hasta`} label="Color final" value={style.backgroundTo} fallback="#0b1f3a" onChange={(backgroundTo) => set({ backgroundTo })} />
                      )}
                    </>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs text-muted-strong">
                      <Crown className="size-3.5 text-amber-500" aria-hidden="true" />
                      Degradés con Premium.
                    </p>
                  )}
                  {style.background && (
                    <button type="button" onClick={() => set({ background: undefined, backgroundTo: undefined })} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
                      <Ban className="size-4" aria-hidden="true" />
                      Sin color de fondo
                    </button>
                  )}
                  <Contrast ratio={contrast} />
                </>
              )}

              {view === "text" && (
                <>
                  <ColorField id={`${id}-letra`} label="Color de letra" value={style.text} fallback={DEFAULT_TEXT} onChange={(text) => set({ text })} />
                  {style.text && (
                    <button type="button" onClick={() => set({ text: undefined })} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
                      <Ban className="size-4" aria-hidden="true" />
                      Color de siempre
                    </button>
                  )}
                  <Contrast ratio={contrast} />
                </>
              )}

              {view === "size" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${id}-tamano`} className="flex items-baseline justify-between text-sm font-medium text-ink">
                    Tamaño
                    <span className="font-display text-lg font-bold text-brand-900 tabular-nums">{style.size ?? 100} %</span>
                  </label>
                  <input
                    id={`${id}-tamano`}
                    type="range"
                    min={SECTION_SIZES[0]}
                    max={SECTION_SIZES[SECTION_SIZES.length - 1]}
                    step={5}
                    value={style.size ?? 100}
                    aria-valuetext={`${style.size ?? 100} por ciento`}
                    onChange={(event) => {
                      const size = Number(event.target.value) as SectionSize;
                      set({ size: size === 100 ? undefined : size });
                    }}
                    className="w-full accent-brand-700"
                  />
                  <span className="flex justify-between text-xs text-muted-strong">
                    <span>Más chico</span>
                    <span>Más grande</span>
                  </span>
                </div>
              )}

              {view === "animation" && (
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-medium text-ink">Cómo entra al aparecer en pantalla</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(sectionAnimations) as [SectionAnimation, { label: string; detail: string }][]).map(([name, option]) => {
                      const active = style.animation === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={active}
                          onClick={() => set({ animation: name })}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
                            active ? "border-brand-700 bg-brand-50" : "border-line hover:border-brand-300",
                          )}
                        >
                          <span aria-hidden="true" className="grid size-12 place-items-center overflow-hidden rounded-lg bg-canvas [perspective:200px]">
                            <span className="anim-demo size-7 rounded-md bg-linear-to-br from-electric-500 to-brand-700" style={{ animationName: `sec-${name}`, transformOrigin: name === "girar" ? "50% 0" : undefined } as CSSProperties} />
                          </span>
                          <span className="text-sm font-semibold text-ink">{option.label}</span>
                          <span className="text-xs text-muted-strong">{option.detail}</span>
                        </button>
                      );
                    })}
                  </div>
                  {style.animation && (
                    <button type="button" onClick={() => set({ animation: undefined })} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
                      <Ban className="size-4" aria-hidden="true" />
                      Sin animación
                    </button>
                  )}
                </fieldset>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Selector de color nativo (el navegador abre su paleta) con el código al lado. */
function ColorField({ id, label, value, fallback, onChange }: { id: string; label: string; value: string | undefined; fallback: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="color"
        value={value ?? fallback}
        onChange={(event) => onChange(event.target.value.toLowerCase())}
        className="h-11 w-14 cursor-pointer rounded-lg border border-line-strong bg-white p-1"
      />
      <label htmlFor={id} className="flex flex-col text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono text-xs text-muted-strong uppercase">{value ?? "Sin elegir"}</span>
      </label>
    </div>
  );
}

/** Aviso de legibilidad: el mínimo recomendado para texto es 4,5:1 (WCAG AA). */
function Contrast({ ratio }: { ratio: number }) {
  const ok = ratio >= 4.5;
  return (
    <p role="status" className={cn("flex items-start gap-2 rounded-xl p-2.5 text-xs", ok ? "bg-success-50 text-success-800" : "bg-amber-50 text-amber-800")}>
      {ok ? <Check className="mt-px size-4 shrink-0" aria-hidden="true" /> : <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden="true" />}
      <span>
        Contraste {ratio.toFixed(1).replace(".", ",")}:1. {ok ? "Se lee bien." : "Puede costar leerlo: probá un fondo más claro o una letra más oscura (o al revés)."}
      </span>
    </p>
  );
}
