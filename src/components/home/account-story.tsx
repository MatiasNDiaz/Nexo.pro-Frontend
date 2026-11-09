"use client";

import { BadgeCheck, Check, Star } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { customerBenefits } from "@/content/home";
import { cn } from "@/lib/cn";

const STEPS = customerBenefits.length;

function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

/**
 * "Lo que tenés con tu cuenta gratis": cada beneficio es un paso, y un celular arma la conversación
 * real del producto a medida que avanza (mensajes, presupuesto, seguimiento, reseña).
 * - Escritorio: el celular queda fijo y el paso lo marca el scroll (la relación con el scroll ES el
 *   contenido: la conversación avanza).
 * - Celular: el celular avanza solo cuando está a la vista; se puede tocar cada paso.
 * - Movimiento reducido: el estado final, quieto.
 * Es una ilustración del producto: sin personas, montos ni reseñas reales.
 */
export function AccountStory({ cta }: { cta: ReactNode }) {
  const wide = useMedia("(min-width: 1024px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [scrollStep, setScrollStep] = useState(0);
  const [autoStep, setAutoStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Escritorio: el paso que cruza el centro de la pantalla es el activo.
  useEffect(() => {
    if (!wide) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setScrollStep(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of stepRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [wide]);

  // Celular: avanza solo mientras el celular está a la vista.
  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (wide || reduced || !visible) return;
    const timer = window.setInterval(() => setAutoStep((value) => (value + 1) % (STEPS + 1)), 2200);
    return () => window.clearInterval(timer);
  }, [wide, reduced, visible]);

  const step = reduced ? STEPS - 1 : wide ? scrollStep : Math.min(autoStep, STEPS - 1);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-20">
      <div className="flex flex-col">
        <ol className="flex flex-col gap-2 lg:gap-0">
          {customerBenefits.map((benefit, index) => (
            <li
              key={benefit.title}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-step={index}
              className="lg:flex lg:min-h-[62vh] lg:items-center"
            >
              <button
                type="button"
                onClick={() => setAutoStep(index)}
                aria-pressed={index === step}
                className={cn(
                  "flex w-full flex-col gap-2 rounded-2xl p-4 text-left transition-[opacity,background-color] duration-300 ease-out-soft lg:pointer-events-none lg:p-0",
                  index === step ? "bg-surface lg:bg-transparent" : "opacity-60 lg:opacity-30",
                )}
              >
                <span className="font-display text-2xl leading-tight font-bold text-brand-900 sm:text-3xl lg:text-5xl lg:leading-[1.02]">
                  {benefit.title}
                </span>
                <span className="max-w-[42ch] text-lg leading-relaxed text-muted-strong">{benefit.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-8 lg:mt-0 lg:mb-[20vh]">{cta}</div>
      </div>

      <div className="order-first lg:order-none">
        <div ref={phoneRef} className="mx-auto w-full max-w-[22rem] lg:sticky lg:top-[calc(50vh-17rem)]">
          <Phone step={step} />
        </div>
      </div>
    </div>
  );
}

/** Elemento que aparece empujando lo anterior hacia arriba (filas de grilla: anima su alto). */
function Reveal({ on, children, className }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,filter,translate] duration-500 ease-out-soft",
        on ? "grid-rows-[1fr] translate-y-0 opacity-100 blur-none" : "grid-rows-[0fr] translate-y-3 opacity-0 blur-sm",
      )}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}

function Phone({ step }: { step: number }) {
  return (
    <div aria-hidden="true" className="rounded-[2.5rem] bg-brand-950 p-2.5 shadow-raised">
      <div className="flex h-[34rem] flex-col overflow-hidden rounded-[2rem] bg-canvas">
        <div className="flex items-center gap-3 border-b border-line bg-surface px-4 pt-5 pb-3">
          <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">EL</span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-ink">Electricista</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <BadgeCheck className="size-3.5 text-electric-500" />
              Identidad verificada
            </span>
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 pb-4">
          <Reveal on className="flex justify-end">
            <p className="mt-2.5 max-w-[80%] rounded-2xl rounded-br-md bg-brand-700 px-3 py-2 text-sm text-white">
              Hola, se me corta la luz cuando prendo el horno. ¿Podés venir a verlo?
            </p>
          </Reveal>
          <Reveal on>
            <p className="max-w-[80%] rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 text-sm text-ink">
              ¡Hola! Sí, mañana a la tarde paso. Te mando el presupuesto.
            </p>
          </Reveal>
          <Reveal on={step >= 1}>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-xs font-medium text-muted">Presupuesto</p>
              <p className="font-display text-2xl font-bold text-ink">$ 45.000</p>
              <p className="text-sm text-muted-strong">Revisión del tablero y cambio de la térmica.</p>
              <p
                className={cn(
                  "mt-2 grid h-9 place-items-center rounded-lg text-sm font-semibold transition-colors duration-300",
                  step >= 2 ? "bg-success-50 text-success-800" : "bg-amber-400 text-brand-900",
                )}
              >
                {step >= 2 ? "Presupuesto aceptado" : "Aceptar presupuesto"}
              </p>
            </div>
          </Reveal>
          <Reveal on={step >= 2}>
            <ol className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-3 text-sm">
              {["Acordado", "Agendado para mañana", step >= 3 ? "Terminado" : "En curso"].map((label, index) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full",
                      index < 2 || step >= 3 ? "bg-brand-700 text-white" : "border-2 border-amber-400",
                    )}
                  >
                    {(index < 2 || step >= 3) && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="text-ink">{label}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal on={step >= 3}>
            <div className="rounded-2xl border border-line bg-surface p-3">
              <p className="text-sm font-semibold text-ink">¿Cómo te fue con el trabajo?</p>
              <p className="mt-1 flex gap-1">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    className="size-6 text-amber-400 transition-[fill] duration-300"
                    style={{ transitionDelay: `${star * 90}ms` }}
                    fill={step >= 3 ? "currentColor" : "none"}
                  />
                ))}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
