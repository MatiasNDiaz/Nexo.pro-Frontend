import { Check, Crown, Minus, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { planFeatures, plans } from "@/content/home";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

/**
 * Planes de los profesionales, con estilo que sube junto con el precio:
 * - Basic: sobrio, translúcido sobre el fondo oscuro.
 * - Medium: degradado azul con borde eléctrico y resplandor al pasar el mouse.
 * - Premium: borde dorado que gira, fondo cálido, brillo que la cruza, resplandor y destellos, y un
 *   botón dorado que brilla. Con movimiento reducido, todo queda quieto.
 */
export function PlansTable() {
  return (
    <ul className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
      {plans.map((plan, index) => (
        <li key={plan.code} data-reveal style={revealDelay(index, 110)} className="flex">
          <PlanShell tier={index}>
            <div className="flex items-start justify-between gap-3">
              <h3
                className={cn(
                  "font-serif text-5xl leading-none italic",
                  index === 2 ? "text-amber-400" : "text-white",
                )}
              >
                {plan.name}
              </h3>
              {index === 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-electric-500/20 px-2.5 py-1 text-xs font-semibold text-electric-100 ring-1 ring-electric-400/40">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Más visibilidad
                </span>
              )}
              {index === 2 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/40">
                  <Crown className="size-3.5" aria-hidden="true" />
                  Todo incluido
                </span>
              )}
            </div>
            <p className={cn("mt-3", index === 2 ? "text-amber-100/80" : "text-brand-100")}>{plan.pitch}</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold tracking-tight text-white font-stretch-[112%]">{formatMoney(plan.price)}</span>
              <span className={index === 2 ? "text-amber-100/70" : "text-brand-200"}>por mes</span>
            </p>
            <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-white/10 pt-6">
              {planFeatures.map((feature) => {
                const value = feature.values[index]!;
                const included = value !== false;
                return (
                  <li key={feature.label} className={cn("flex items-start gap-2.5", !included && "opacity-45")}>
                    {included ? (
                      <Check
                        className={cn("mt-0.5 size-4 shrink-0", index === 2 ? "text-amber-400" : index === 1 ? "text-electric-400" : "text-brand-200")}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    ) : (
                      <Minus className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden="true" />
                    )}
                    <span className="text-sm leading-snug text-white">
                      {feature.label}
                      {typeof value === "string" && <span className="font-semibold">: {value}</span>}
                      {!included && <span className="sr-only"> (no incluido)</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8">
              {index === 2 ? (
                // Botón dorado con brillo que lo cruza y halo que respira; al pasar el mouse sube y se aclara.
                <Link
                  href="/registro?rol=profesional"
                  className="group/cta relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-amber-100 via-amber-400 to-amber-500 font-semibold text-brand-900 transition-[translate,filter] duration-200 ease-out-soft [animation:glow-pulse_2.6s_ease-in-out_infinite] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.97]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-transparent via-white/70 to-transparent [animation:shine-sweep_2.8s_var(--ease-in-out-strong)_infinite]"
                  />
                  {/*
                    Brillo instantáneo al entrar a la tarjeta y otra vez al llegar al botón (otra
                    duración: un valor de animación distinto la hace arrancar de nuevo).
                  */}
                  <span
                    aria-hidden="true"
                    className="shine-hover bg-linear-to-r from-transparent via-white/90 to-transparent group-hover/premium:[animation:shine-once_600ms_var(--ease-out-soft)] group-hover/cta:[animation:shine-once_550ms_var(--ease-out-soft)] group-focus-visible/cta:[animation:shine-once_600ms_var(--ease-out-soft)]"
                  />
                  <Crown className="relative size-4 transition-transform duration-300 ease-out-soft group-hover/cta:-rotate-12" aria-hidden="true" />
                  <span className="relative">Probar 30 días</span>
                </Link>
              ) : (
                <ButtonLink href="/registro?rol=profesional" variant={index === 1 ? "accent" : "inverse"} fullWidth size="lg">
                  Probar 30 días
                </ButtonLink>
              )}
            </div>
          </PlanShell>
        </li>
      ))}
    </ul>
  );
}

export function PlanShell({ tier, children }: { tier: number; children: ReactNode }) {
  const lift = "transition-[translate,box-shadow] duration-300 ease-out-soft hover:-translate-y-1.5";

  if (tier === 0) {
    return <div className={cn("flex w-full flex-col rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/12 hover:ring-white/25 sm:p-8", lift)}>{children}</div>;
  }

  if (tier === 1) {
    return (
      <div
        className={cn(
          "flex w-full flex-col rounded-3xl bg-linear-to-br from-brand-500 via-brand-700 to-brand-900 p-7 ring-1 ring-electric-400/40 sm:p-8",
          "hover:shadow-[0_24px_60px_-20px_rgb(59_130_246/0.65)]",
          lift,
        )}
      >
        {children}
      </div>
    );
  }

  /*
   * Premium, la que más se mueve:
   * - borde dorado que gira (padding de 2 px sobre un degradado cónico con ángulo animable);
   * - un brillo que la cruza entera cada pocos segundos;
   * - un resplandor cálido que flota y destellos que titilan;
   * - al pasar el mouse sube más, se agranda apenas y el resplandor se enciende.
   * Con movimiento reducido todo queda quieto (globals.css).
   */
  return (
    <div
      className={cn(
        "group/premium relative flex w-full rounded-3xl p-[2px] [animation:plan-spin_5s_linear_infinite]",
        "[background:conic-gradient(from_var(--plan-angle),#f4a340,#ffe1a8,#3b82f6,#f4a340)]",
        "shadow-[0_20px_60px_-28px_rgb(244_163_64/0.55)] transition-[translate,scale,box-shadow] duration-300 ease-out-soft",
        "hover:-translate-y-2.5 hover:scale-[1.015] hover:shadow-[0_34px_80px_-24px_rgb(244_163_64/0.75)]",
      )}
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-[calc(var(--radius-3xl)-2px)] bg-[radial-gradient(120%_80%_at_100%_0%,#3a2a12_0%,#14100c_45%,#07152a_100%)] p-7 sm:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/4 -right-1/4 size-[70%] rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.35),transparent)] opacity-70 transition-opacity duration-500 [animation:glow-drift_9s_ease-in-out_infinite] group-hover/premium:opacity-100"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-linear-to-r from-transparent via-amber-100/20 to-transparent [animation:shine-sweep_4.5s_var(--ease-in-out-strong)_infinite]"
        />
        {/* Al pasar el mouse, un brillo fuerte cruza al instante (sin esperar el ciclo de arriba). */}
        <span
          aria-hidden="true"
          className="shine-hover z-1 bg-linear-to-r from-transparent via-amber-50/45 to-transparent group-hover/premium:[animation:shine-once_750ms_var(--ease-out-soft)]"
        />
        {[
          "top-6 right-[38%] size-3 [animation-delay:0s]",
          "top-[42%] right-6 size-2.5 [animation-delay:1.1s]",
          "bottom-28 left-5 size-2 [animation-delay:2.3s]",
        ].map((place) => (
          <Sparkle key={place} className={cn("absolute text-amber-100 opacity-0 [animation:twinkle_3.4s_ease-in-out_infinite]", place)} />
        ))}
        <div className="relative flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={cn("pointer-events-none", className)}>
      <path d="M6 0c.5 3.2 2.8 5.5 6 6-3.2.5-5.5 2.8-6 6-.5-3.2-2.8-5.5-6-6 3.2-.5 5.5-2.8 6-6Z" fill="currentColor" />
    </svg>
  );
}
