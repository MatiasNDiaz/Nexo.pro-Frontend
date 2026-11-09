"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { heroSlides } from "@/content/photos";
import { cn } from "@/lib/cn";

/** Segundos que se muestra cada foto (lo marca la barra de progreso). */
const SECONDS = 5.5;

type Gsap = typeof import("gsap").gsap;

/**
 * Transiciones de entrada: se turnan para que cada cambio se sienta distinto. Solo clip-path,
 * opacidad y escala (sin reflujo). Curvas fuertes de entrada y salida (emil-design-eng).
 */
const reveals: ((gsap: Gsap, el: HTMLElement) => gsap.core.Tween)[] = [
  // Cortina desde la derecha.
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" }),
  // Círculo que se abre desde el foco de la foto.
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "circle(0% at 68% 42%)" }, { clipPath: "circle(150% at 68% 42%)", duration: 1.25, ease: "power3.inOut" }),
  // Telón de abajo hacia arriba.
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" }),
  // Fundido con acercamiento.
  (gsap, el) => gsap.fromTo(el, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }),
  // Corte diagonal.
  (gsap, el) =>
    gsap.fromTo(
      el,
      { clipPath: "polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)" },
      { clipPath: "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)", duration: 1.15, ease: "expo.inOut" },
    ),
  // Apertura desde el centro.
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" }),
];

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia(reducedQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

/**
 * Fotos del héroe que se turnan con transiciones distintas (GSAP). En el DOM hay solo dos: la que
 * se ve y la siguiente, ya cargada, debajo. Se puede pausar (WCAG 2.2.2); con movimiento reducido
 * queda una sola foto quieta. GSAP se descarga recién cuando hace falta.
 */
export function HeroSlides({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(0);
  const slides = useRef(new Map<number, HTMLDivElement>());
  const gsapRef = useRef<Gsap | null>(null);

  const count = heroSlides.length;
  // Con movimiento reducido no hay cambio de foto: no se precarga la siguiente.
  const upcoming = reduced ? -1 : (target ?? (current + 1) % count);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    void import("gsap").then(({ gsap }) => {
      if (alive) gsapRef.current = gsap;
    });
    return () => {
      alive = false;
    };
  }, [reduced]);

  const goTo = useCallback(
    (index: number) => {
      if (target !== null || index === current) return;
      if (gsapRef.current) {
        setTarget(index);
      } else {
        // GSAP todavía no llegó (conexión lenta): cambio directo, sin transición.
        setCurrent(index);
        setRound((value) => value + 1);
      }
    },
    [current, target],
  );

  // Entrada de la foto elegida: la transición del turno y, debajo, un acercamiento lento.
  useEffect(() => {
    if (target === null) return;
    const gsap = gsapRef.current;
    const el = slides.current.get(target);
    if (!gsap || !el) return;
    const image = el.querySelector("img");
    gsap.set(el, { visibility: "visible", zIndex: 2 });
    if (image) gsap.fromTo(image, { scale: 1.14 }, { scale: 1.02, duration: SECONDS + 1.4, ease: "sine.out" });
    reveals[round % reveals.length]!(gsap, el).eventCallback("onComplete", () => {
      setCurrent(target);
      setTarget(null);
      setRound((value) => value + 1);
    });
    // Sin limpieza acá: el acercamiento sigue después de la transición. Las animaciones de cada
    // foto se cortan cuando sale del DOM (ref) o al desmontar el componente.
  }, [target, round]);

  useEffect(() => {
    const nodes = slides.current;
    return () => {
      for (const el of nodes.values()) gsapRef.current?.killTweensOf([el, el.querySelector("img")]);
    };
  }, []);

  const active = target ?? current;
  const slide = heroSlides[active]!;

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos de oficios"
      className={cn("relative isolate overflow-hidden bg-brand-900", className)}
    >
      {heroSlides.map((item, index) => {
        if (index !== current && index !== upcoming) return null;
        const isCurrent = index === current;
        return (
          <div
            key={item.photo.src}
            ref={(el) => {
              if (el) {
                slides.current.set(index, el);
                return;
              }
              const old = slides.current.get(index);
              if (old) gsapRef.current?.killTweensOf([old, old.querySelector("img")]);
              slides.current.delete(index);
            }}
            aria-hidden={!isCurrent}
            className="absolute inset-0"
            style={isCurrent ? { zIndex: 1 } : { zIndex: 0, visibility: "hidden" }}
          >
            <Image
              src={item.photo.src}
              alt={item.photo.alt}
              fill
              preload={index === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        );
      })}

      {/* Sombra inferior para que el rótulo y los controles se lean sobre cualquier foto. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-32 bg-linear-to-t from-brand-950/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-4 flex items-end justify-between gap-3 p-4 sm:p-5">
        <p aria-hidden="true" className="font-display text-lg font-bold text-white font-stretch-85% sm:text-xl">
          {slide.trade}
        </p>
        {!reduced && (
          <div className="flex items-center gap-3">
            <ol className="flex items-center gap-1.5" aria-label="Elegir foto">
              {heroSlides.map((item, index) => (
                <li key={item.photo.src}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={index === active ? "true" : undefined}
                    className="group grid h-11 w-6 place-items-center sm:w-8"
                  >
                    <span className="relative block h-1 w-full overflow-hidden rounded-full bg-white/35">
                      {index === current && target === null ? (
                        <span
                          key={`${current}-${round}`}
                          className="absolute inset-0 origin-left rounded-full bg-white"
                          style={{
                            animation: `slide-progress ${SECONDS}s linear both`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                          // Al llenarse la barra, pasa la foto siguiente.
                          onAnimationEnd={() => goTo((current + 1) % count)}
                        />
                      ) : (
                        index === active && <span className="absolute inset-0 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="sr-only">
                      Foto {index + 1}: {item.trade}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              <span className="sr-only">{paused ? "Reanudar las fotos" : "Pausar las fotos"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
