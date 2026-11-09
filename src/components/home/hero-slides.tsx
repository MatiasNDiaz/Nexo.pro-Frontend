"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { heroSlides } from "@/content/photos";

/** Cada cuántos segundos cambia la foto (pedido del fundador: 2 s). La transición entra dentro de ese tiempo. */
const SECONDS = 2;

type Gsap = typeof import("gsap").gsap;

/**
 * Transiciones de entrada, una distinta por turno. Solo clip-path, opacidad y escala (sin reflujo),
 * con curvas fuertes de entrada y salida (emil-design-eng). Duran 0,8 s: cabe dentro de los 2 s.
 */
const reveals: ((gsap: Gsap, el: HTMLElement) => gsap.core.Tween)[] = [
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" }),
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "circle(0% at 70% 45%)" }, { clipPath: "circle(150% at 70% 45%)", duration: 0.85, ease: "power3.inOut" }),
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" }),
  (gsap, el) => gsap.fromTo(el, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }),
  (gsap, el) =>
    gsap.fromTo(
      el,
      { clipPath: "polygon(0% 0%, 0% 0%, -40% 100%, -40% 100%)" },
      { clipPath: "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)", duration: 0.85, ease: "expo.inOut" },
    ),
  (gsap, el) =>
    gsap.fromTo(el, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" }),
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
 * Héroe de lado a lado: las fotos de fondo se turnan cada 2 s con transiciones distintas (GSAP) y el
 * contenido (`children`) va encima. En el DOM hay solo dos fotos: la que se ve y la siguiente, ya
 * cargada. Se puede pausar (WCAG 2.2.2) y se detiene sola fuera de pantalla; con movimiento reducido,
 * una sola foto quieta. GSAP se descarga recién cuando hace falta.
 */
export function HeroSlides({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [target, setTarget] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [round, setRound] = useState(0);
  const slides = useRef(new Map<number, HTMLDivElement>());
  const gsapRef = useRef<Gsap | null>(null);

  const count = heroSlides.length;
  const upcoming = reduced ? -1 : (target ?? (current + 1) % count);
  const active = target ?? current;

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

  // Fuera de pantalla no corre (ahorra batería y no cambia nada que nadie ve).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry?.isIntersecting), { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (target !== null || index === current) return;
      if (gsapRef.current) setTarget(index);
      else {
        // GSAP todavía no llegó (conexión lenta): cambio directo.
        setCurrent(index);
        setRound((value) => value + 1);
      }
    },
    [current, target],
  );

  // Versión más reciente de goTo, para llamarla desde un evento que llega después.
  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  /** Pasa a la siguiente cuando ya cargó; si no, espera a que cargue (nunca una foto a medias). */
  const advance = useCallback(() => {
    const next = (current + 1) % count;
    const image = slides.current.get(next)?.querySelector("img");
    if (image && !image.complete) {
      image.addEventListener("load", () => goToRef.current(next), { once: true });
      return;
    }
    goTo(next);
  }, [count, current, goTo]);

  useEffect(() => {
    if (target === null) return;
    const gsap = gsapRef.current;
    const el = slides.current.get(target);
    if (!gsap || !el) return;
    const image = el.querySelector("img");
    gsap.set(el, { visibility: "visible", zIndex: 2 });
    if (image) gsap.fromTo(image, { scale: 1.12 }, { scale: 1.02, duration: SECONDS + 0.8, ease: "sine.out" });
    reveals[round % reveals.length]!(gsap, el).eventCallback("onComplete", () => {
      setCurrent(target);
      setTarget(null);
    });
  }, [target, round]);

  useEffect(() => {
    const nodes = slides.current;
    return () => {
      for (const el of nodes.values()) gsapRef.current?.killTweensOf([el, el.querySelector("img")]);
    };
  }, []);

  const running = !paused && !offscreen;

  return (
    <div ref={root} role="region" aria-roledescription="carrusel" aria-label="Fotos de oficios" className="relative isolate overflow-hidden bg-brand-950">
      <div className="absolute inset-0 -z-10">
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
              <Image src={item.photo.src} alt={item.photo.alt} fill preload={index === 0} sizes="100vw" className="object-cover" />
            </div>
          );
        })}
        {/*
          Velo parejo con el centro más oscuro, donde va el texto blanco centrado (contraste ≥ 4,5:1
          sobre cualquier foto); los bordes dejan ver la foto.
        */}
        <div aria-hidden="true" className="absolute inset-0 z-3 bg-brand-950/50" />
        <div aria-hidden="true" className="absolute inset-0 z-3 bg-[radial-gradient(ellipse_at_center,rgb(7_21_42/0.6)_0%,transparent_70%)]" />
      </div>

      {children}

      {/* Controles: abajo, centrados como el contenido. */}
      <div className="absolute inset-x-0 bottom-0 z-4 flex items-center justify-center gap-3 p-4 sm:p-6">
        <p aria-hidden="true" className="hidden font-display text-sm font-bold tracking-wide text-white/80 uppercase font-stretch-80% sm:block">
          {heroSlides[active]!.trade}
        </p>
        {!reduced && (
          <>
            <ol className="flex items-center gap-1" aria-label="Elegir foto">
              {heroSlides.map((item, index) => (
                <li key={item.photo.src}>
                  <button type="button" onClick={() => goTo(index)} aria-current={index === active ? "true" : undefined} className="grid h-11 w-5 place-items-center sm:w-7">
                    <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-white/30">
                      {index === active ? (
                        <span
                          // Misma key durante y después de la transición: la barra no reinicia (ciclo de 2 s exactos).
                          key={`${round}-${index}`}
                          className="absolute inset-0 origin-left bg-white"
                          style={{ animation: `slide-progress ${SECONDS}s linear both`, animationPlayState: running ? "running" : "paused" }}
                          // La barra arranca con la transición: al llenarse (2 s), pasa la foto siguiente.
                          onAnimationEnd={() => {
                            setRound((value) => value + 1);
                            advance();
                          }}
                        />
                      ) : null}
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
              className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors duration-150 hover:bg-white/15"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              <span className="sr-only">{paused ? "Reanudar las fotos" : "Pausar las fotos"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
