"use client";

import {
  ArrowLeft,
  BatteryMedium,
  BadgeCheck,
  Check,
  CheckCheck,
  EllipsisVertical,
  Paperclip,
  Phone as PhoneIcon,
  SendHorizontal,
  Signal,
  Star,
  Wifi,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { customerBenefits } from "@/content/home";
import { tradePhotos } from "@/content/photos";
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
 * "Lo que tenés con tu cuenta gratis": cada beneficio es un paso, y un celular (al estilo de un
 * Android de gama media, con muesca en gota y botones de navegación) arma la conversación real del
 * producto a medida que avanza: mensajes, foto, presupuesto, seguimiento y reseña.
 * - Escritorio: el celular queda fijo y el paso lo marca el scroll; una barra a la izquierda muestra
 *   el avance.
 * - Celular: avanza solo cuando está a la vista; se puede tocar cada paso.
 * - Movimiento reducido: el estado final, quieto.
 * Es una ilustración del producto: sin personas ni reseñas reales.
 */
export function AccountStory({ cta }: { cta: ReactNode }) {
  const wide = useMedia("(min-width: 1024px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [scrollStep, setScrollStep] = useState(0);
  const [autoStep, setAutoStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const phoneRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (wide || reduced || !visible) return;
    const timer = window.setInterval(() => setAutoStep((value) => (value + 1) % (STEPS + 1)), 2600);
    return () => window.clearInterval(timer);
  }, [wide, reduced, visible]);

  const step = reduced ? STEPS - 1 : wide ? scrollStep : Math.min(autoStep, STEPS - 1);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-20">
      <div className="flex flex-col">
        <ol className="flex flex-col gap-3 lg:gap-0">
          {customerBenefits.map((benefit, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <li
                key={benefit.title}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                data-step={index}
                className="relative lg:flex lg:min-h-[64vh] lg:items-center"
              >
                {/* Barra de avance: se llena con los pasos ya vistos (solo escritorio). */}
                <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 hidden w-0.5 bg-line lg:block">
                  <span
                    className="absolute inset-x-0 top-0 bg-brand-700 transition-[height] duration-700 ease-out-soft"
                    style={{ height: done ? "100%" : active ? "50%" : "0%" }}
                  />
                </span>
                <button
                  type="button"
                  onClick={() => setAutoStep(index)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full flex-col gap-4 rounded-2xl border p-5 text-left transition-[opacity,background-color,border-color] duration-300 ease-out-soft lg:pointer-events-none lg:border-0 lg:bg-transparent lg:py-0 lg:pr-0 lg:pl-10",
                    active ? "border-brand-200 bg-surface opacity-100" : "border-transparent opacity-60 lg:opacity-35",
                  )}
                >
                  <span className="font-display text-2xl leading-tight font-bold text-brand-900 sm:text-3xl lg:text-5xl lg:leading-[1.02]">
                    {benefit.title}
                  </span>
                  <span className="max-w-[46ch] text-lg leading-relaxed text-muted-strong">{benefit.text}</span>
                  <span className="flex flex-wrap gap-2">
                    {benefit.points.map((point) => (
                      <span
                        key={point}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-800"
                      >
                        <Check className="size-3.5 text-brand-600" strokeWidth={3} aria-hidden="true" />
                        {point}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 lg:mt-0 lg:mb-[22vh] lg:pl-10">{cta}</div>
      </div>

      <div className="order-first lg:order-none">
        <div ref={phoneRef} className="mx-auto w-full max-w-[20.5rem] lg:sticky lg:top-[calc(50vh-21rem)]">
          <GalaxyPhone step={step} />
        </div>
      </div>
    </div>
  );
}

/** Aparece empujando lo anterior hacia arriba (filas de grilla: anima su alto). */
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

function Mine({ children, time, seen = true }: { children: ReactNode; time: string; seen?: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <div className="max-w-[82%] rounded-2xl rounded-br-md bg-brand-700 px-3 py-2 text-[0.8125rem] leading-snug text-white">
        {children}
        <span className="mt-0.5 flex items-center justify-end gap-1 text-[0.625rem] text-white/70">
          {time}
          {seen ? <CheckCheck className="size-3 text-electric-400" /> : <Check className="size-3" />}
        </span>
      </div>
    </div>
  );
}

function Theirs({ children, time }: { children: ReactNode; time: string }) {
  return (
    <div className="flex pt-2">
      <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[0.8125rem] leading-snug text-ink shadow-[0_1px_1px_rgb(11_31_58/0.06)]">
        {children}
        <span className="mt-0.5 block text-right text-[0.625rem] text-muted">{time}</span>
      </div>
    </div>
  );
}

/**
 * Celular al estilo de un Samsung Galaxy A16: marcos finos y parejos, muesca en gota con la cámara
 * frontal, botones laterales (volumen y encendido sobre la "isla" de teclas), barra de estado y la
 * navegación de Android (recientes, inicio, volver). Todo decorativo (aria-hidden).
 */
function GalaxyPhone({ step }: { step: number }) {
  return (
    <div aria-hidden="true" className="relative">
      {/* Botones laterales (lado derecho, sobre la isla de teclas). */}
      <span className="absolute top-[8.5rem] -right-[3px] h-24 w-[5px] rounded-r-md bg-[#2a2f36]" />
      <span className="absolute top-[8.75rem] -right-[5px] h-9 w-[3px] rounded-r-sm bg-[#3a4049]" />
      <span className="absolute top-[11.25rem] -right-[5px] h-12 w-[3px] rounded-r-sm bg-[#3a4049]" />

      <div className="rounded-[2.25rem] bg-[#16191d] p-[7px] shadow-[0_2px_2px_rgb(11_31_58/0.1),0_30px_60px_-24px_rgb(11_31_58/0.5)] ring-1 ring-black/40">
        <div className="relative flex h-[42rem] flex-col overflow-hidden rounded-[1.85rem] bg-[#eef2f8]">
          {/* Muesca en gota con la cámara frontal. */}
          <div className="absolute top-0 left-1/2 z-10 h-[1.35rem] w-14 -translate-x-1/2 rounded-b-[1rem] bg-[#16191d]">
            <span className="absolute top-[0.3rem] left-1/2 size-[0.6rem] -translate-x-1/2 rounded-full bg-[#0b0d10] ring-2 ring-[#22262c]">
              <span className="absolute top-[2px] left-[2px] size-[3px] rounded-full bg-[#3b4a6b]" />
            </span>
          </div>

          {/* Barra de estado. */}
          <div className="flex h-7 items-center justify-between bg-brand-900 px-5 text-[0.6875rem] font-semibold text-white">
            <span>10:24</span>
            <span className="flex items-center gap-1">
              <Signal className="size-3" strokeWidth={2.5} />
              <Wifi className="size-3" strokeWidth={2.5} />
              <span className="ml-0.5">78%</span>
              <BatteryMedium className="size-3.5" strokeWidth={2.2} />
            </span>
          </div>

          {/* Barra de la app: la conversación. */}
          <div className="flex items-center gap-2.5 bg-brand-900 px-3 pt-1 pb-3 text-white">
            <ArrowLeft className="size-4 shrink-0" />
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-[0.6875rem] font-bold">MF</span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="flex items-center gap-1 text-[0.8125rem] font-semibold">
                Martín · Electricista
                <BadgeCheck className="size-3.5 text-electric-400" />
              </span>
              <span className="text-[0.625rem] text-brand-200">{step === 0 ? "escribiendo…" : "en línea"}</span>
            </span>
            <PhoneIcon className="size-4 shrink-0" />
            <EllipsisVertical className="size-4 shrink-0" />
          </div>

          {/* Mensajes: anclados abajo, lo nuevo empuja lo anterior hacia arriba. */}
          <div className="flex flex-1 flex-col justify-end overflow-hidden px-3 pb-2">
            <div className="flex justify-center pb-1">
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[0.625rem] font-medium text-muted">Hoy</span>
            </div>
            <Mine time="10:02">Hola Martín, se me corta la luz cuando prendo el horno y el lavarropas juntos. ¿Podés venir a verlo?</Mine>
            <Mine time="10:03">
              <span className="relative -mx-1 -mt-0.5 mb-1 block aspect-[4/3] w-44 overflow-hidden rounded-xl">
                <Image src={tradePhotos.electricista!.src} alt="" fill sizes="176px" className="object-cover" />
              </span>
              Así está el tablero.
            </Mine>
            <Theirs time="10:05">¡Hola! Por la foto parece la térmica, que está quedando chica. Mañana a las 16 puedo pasar.</Theirs>
            <Reveal on={step >= 1}>
              <div className="pt-2">
                <div className="rounded-2xl border border-line bg-white p-3">
                  <p className="flex items-center justify-between text-[0.6875rem] font-medium text-muted">
                    Presupuesto <span>10:09</span>
                  </p>
                  <p className="font-display text-2xl font-bold text-ink">$ 45.000</p>
                  <ul className="mt-1 flex flex-col gap-0.5 text-[0.75rem] text-muted-strong">
                    <li>· Revisión completa del tablero</li>
                    <li>· Cambio de térmica de 32 A</li>
                    <li>· Materiales incluidos</li>
                  </ul>
                  <p
                    className={cn(
                      "mt-2 grid h-8 place-items-center rounded-lg text-[0.75rem] font-semibold transition-colors duration-300",
                      step >= 2 ? "bg-success-50 text-success-800" : "bg-amber-400 text-brand-900",
                    )}
                  >
                    {step >= 2 ? "Presupuesto aceptado" : "Aceptar presupuesto"}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal on={step >= 2}>
              <Mine time="10:12">¡Buenísimo, lo acepto! Te espero mañana.</Mine>
            </Reveal>
            <Reveal on={step >= 2}>
              <div className="pt-2">
                <ol className="flex flex-col gap-1.5 rounded-2xl border border-line bg-white p-3 text-[0.75rem]">
                  {["Acordado", "Agendado: mañana, 16 h", step >= 3 ? "Terminado" : "En curso"].map((label, index) => (
                    <li key={label} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-full",
                          index < 2 || step >= 3 ? "bg-brand-700 text-white" : "border-2 border-amber-400",
                        )}
                      >
                        {(index < 2 || step >= 3) && <Check className="size-2.5" strokeWidth={3.5} />}
                      </span>
                      <span className="text-ink">{label}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
            <Reveal on={step >= 3}>
              <Theirs time="17:40">¡Listo! Quedó funcionando. Cualquier cosa me escribís.</Theirs>
            </Reveal>
            <Reveal on={step >= 3}>
              <div className="pt-2">
                <div className="rounded-2xl border border-line bg-white p-3">
                  <p className="text-[0.75rem] font-semibold text-ink">¿Cómo te fue con el trabajo?</p>
                  <p className="mt-1 flex gap-1">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star
                        key={star}
                        className="size-5 text-amber-400 transition-[fill] duration-300"
                        style={{ transitionDelay: `${star * 90}ms` }}
                        fill={step >= 3 ? "currentColor" : "none"}
                      />
                    ))}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Campo para escribir. */}
          <div className="flex items-center gap-2 bg-[#eef2f8] px-3 pb-2">
            <span className="flex h-9 flex-1 items-center gap-2 rounded-full bg-white px-3 text-[0.75rem] text-muted">
              <Paperclip className="size-3.5" />
              Escribí un mensaje
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-brand-700 text-white">
              <SendHorizontal className="size-4" />
            </span>
          </div>

          {/* Navegación de Android: recientes, inicio y volver (orden de Samsung). */}
          <div className="flex h-11 items-center justify-around bg-white px-8 text-[#3a4049]">
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 4v12M10 4v12M15 4v12" />
            </svg>
            <svg viewBox="0 0 20 20" className="size-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3.5" y="3.5" width="13" height="13" rx="4.5" />
            </svg>
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 4 6.5 10l6 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
