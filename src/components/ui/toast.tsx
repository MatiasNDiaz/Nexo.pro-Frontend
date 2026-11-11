"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { FeedbackIcon } from "./feedback-icon";

export type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milisegundos visible (sin contar el tiempo con el mouse o el foco encima). */
  duration?: number;
}

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
  /** Cambia al repetirse el mismo aviso: reinicia el tiempo y la barra. */
  round: number;
  leaving: boolean;
}

/** Tiempo de lectura según el tono: los errores y advertencias quedan más. */
const DURATION: Record<ToastTone, number> = {
  success: 4000,
  info: 5000,
  warning: 6500,
  error: 7000,
};
const MAX_VISIBLE = 3;
const LEAVE_MS = 220;

/*
 * Lista de avisos fuera de React (se puede llamar a `toast()` desde cualquier lado, incluso desde la
 * caché de TanStack Query). El <Toaster /> la lee con useSyncExternalStore.
 */
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];

function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Un modal abierto deja el resto de la página inerte: el aviso espera a que se cierre (hasta 1 s). */
function whenNoModal(run: () => void, waited = 0) {
  if (typeof document === "undefined") return;
  const modalOpen = document.querySelector("dialog:modal") !== null;
  if (modalOpen && waited < 1000) {
    setTimeout(() => whenNoModal(run, waited + 50), 50);
    return;
  }
  run();
}

export function toast(input: ToastInput | string): void {
  const {
    title,
    description,
    tone = "info",
    duration,
  } = typeof input === "string" ? { title: input } : input;
  whenNoModal(() => {
    // El mismo aviso repetido (dos clics seguidos) no se apila: se reinicia.
    const same = items.find(
      (item) =>
        !item.leaving &&
        item.title === title &&
        item.tone === tone &&
        item.description === description,
    );
    if (same) {
      items = items.map((item) =>
        item === same ? { ...item, round: item.round + 1 } : item,
      );
    } else {
      const item: ToastItem = {
        id: nextId++,
        title,
        description,
        tone,
        duration: duration ?? DURATION[tone],
        round: 0,
        leaving: false,
      };
      const visible = items.filter((i) => !i.leaving);
      // Más de 3: el más viejo se va.
      const oldest = visible.length >= MAX_VISIBLE ? visible[0] : undefined;
      items = [...items, item];
      if (oldest) dismissToast(oldest.id);
    }
    emit();
  });
}

toast.success = (title: string, description?: string) =>
  toast({ tone: "success", title, description });
toast.error = (title: string, description?: string) =>
  toast({ tone: "error", title, description });
toast.warning = (title: string, description?: string) =>
  toast({ tone: "warning", title, description });
toast.info = (title: string, description?: string) =>
  toast({ tone: "info", title, description });

export function dismissToast(id: number): void {
  if (!items.some((item) => item.id === id && !item.leaving)) return;
  items = items.map((item) =>
    item.id === id ? { ...item, leaving: true } : item,
  );
  emit();
  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, LEAVE_MS);
}

/** Solo para las pruebas. */
export function resetToasts(): void {
  items = [];
  emit();
}

function ToastCard({ item }: { item: ToastItem }) {
  const paused = useRef(false);
  const remaining = useRef(item.duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bar = useRef<HTMLSpanElement>(null);

  // Temporizador propio (no el fin de la animación): con "menos movimiento" las animaciones duran
  // 0,01 ms y el aviso se cerraría al instante. Se frena con el mouse o el foco encima.
  useEffect(() => {
    remaining.current = item.duration;
    const start = () => {
      startedAt.current = Date.now();
      timer.current = setTimeout(
        () => dismissToast(item.id),
        remaining.current,
      );
    };
    if (!paused.current) start();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [item.id, item.duration, item.round]);

  const pause = () => {
    if (paused.current) return;
    paused.current = true;
    if (timer.current) clearTimeout(timer.current);
    remaining.current = Math.max(
      800,
      remaining.current - (Date.now() - startedAt.current),
    );
    if (bar.current) bar.current.style.animationPlayState = "paused";
  };
  const resume = () => {
    if (!paused.current) return;
    paused.current = false;
    startedAt.current = Date.now();
    timer.current = setTimeout(() => dismissToast(item.id), remaining.current);
    if (bar.current) bar.current.style.animationPlayState = "running";
  };

  const isError = item.tone === "error";
  return (
    <li
      // Los errores se anuncian enseguida; el resto, sin interrumpir al lector de pantalla.
      role={isError ? "alert" : "status"}
      aria-atomic="true"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-4 pr-12 shadow-raised",
        "transition-[opacity,translate,scale] duration-300 ease-out-soft starting:translate-y-3 starting:scale-95 starting:opacity-0",
        item.leaving && "translate-x-6 opacity-0",
      )}
    >
      <FeedbackIcon key={item.round} tone={item.tone} size="sm" />
      <div className="flex min-w-0 flex-col gap-0.5 pt-1">
        <p className="text-[0.9375rem] leading-snug font-semibold text-ink">
          {item.title}
        </p>
        {item.description && (
          <p className="text-sm leading-relaxed text-muted-strong">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-xl text-muted transition-colors hover:bg-brand-50 hover:text-brand-800"
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Cerrar aviso</span>
      </button>
      {/* Cuánto le queda (decorativa; con "menos movimiento" no se muestra). */}
      <span
        key={`bar-${item.round}`}
        ref={bar}
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 origin-left motion-reduce:hidden",
          item.tone === "success" && "bg-success-600/70",
          item.tone === "error" && "bg-danger-600/70",
          item.tone === "warning" && "bg-amber-400",
          item.tone === "info" && "bg-brand-600/70",
        )}
        style={{
          animation: `toast-progress ${item.duration}ms linear forwards`,
        }}
      />
    </li>
  );
}

/**
 * Avisos flotantes del sitio (estilo SweetAlert, con la interfaz de Repara Ya). En celular van
 * abajo, al alcance del pulgar; en pantallas grandes, arriba a la derecha. Se monta una sola vez
 * (app/providers.tsx).
 */
export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => items,
    () => EMPTY,
  );
  return (
    <section
      aria-label="Avisos"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:p-6"
    >
      <ol className="flex w-full max-w-sm flex-col gap-3">
        {list.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </ol>
    </section>
  );
}
