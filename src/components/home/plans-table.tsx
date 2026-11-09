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
 * - Premium: borde dorado que gira, fondo cálido, nombre en serif cursiva y un destello al pasar
 *   el mouse. Con movimiento reducido, el borde queda quieto.
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
                <Link
                  href="/registro?rol=profesional"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-100 via-amber-400 to-amber-500 font-semibold text-brand-900 shadow-[0_8px_24px_-10px_rgb(244_163_64/0.8)] transition-[transform,filter] duration-200 hover:brightness-105 active:scale-[0.97]"
                >
                  <Crown className="size-4" aria-hidden="true" />
                  Probar 30 días
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

function PlanShell({ tier, children }: { tier: number; children: ReactNode }) {
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

  // Premium: borde dorado giratorio (padding de 1,5 px sobre un degradado cónico) y destello al pasar el mouse.
  return (
    <div
      className={cn(
        "group/premium relative flex w-full rounded-3xl p-[1.5px] [animation:plan-spin_6s_linear_infinite] hover:[animation-duration:2.5s]",
        "[background:conic-gradient(from_var(--plan-angle),#f4a340,#ffe1a8,#3b82f6,#f4a340)]",
        "hover:shadow-[0_28px_70px_-24px_rgb(244_163_64/0.6)]",
        lift,
      )}
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-[radial-gradient(120%_80%_at_100%_0%,#3a2a12_0%,#14100c_45%,#07152a_100%)] p-7 sm:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-amber-100/15 to-transparent opacity-0 group-hover/premium:[animation:plan-sheen_1.1s_var(--ease-out-soft)] group-hover/premium:opacity-100"
        />
        {children}
      </div>
    </div>
  );
}
