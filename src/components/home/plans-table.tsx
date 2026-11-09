"use client";

import { Check, Minus } from "lucide-react";
import { useId, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { planFeatures, plans } from "@/content/home";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

const FEATURED = 1; // Medium

function Value({ value, dark }: { value: string | boolean; dark?: boolean }) {
  if (value === true) return <Check className={cn("size-5", dark ? "text-amber-400" : "text-brand-600")} strokeWidth={2.5} aria-label="Incluido" />;
  if (value === false) return <Minus className="size-5 text-line-strong" aria-label="No incluido" />;
  return <span className="font-medium">{value}</span>;
}

/**
 * Planes de los profesionales. Escritorio: tabla comparativa (filas = qué incluye, columnas = plan).
 * Celular: pestañas para elegir el plan y ver su lista (una tabla de tres columnas no entra).
 */
export function PlansTable() {
  const id = useId();
  const [selected, setSelected] = useState(FEATURED);
  const plan = plans[selected]!;

  return (
    <>
      {/* Escritorio */}
      <table className="hidden w-full border-separate border-spacing-0 text-left lg:table">
        <caption className="sr-only">Comparación de planes para profesionales</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[34%] pb-6 align-bottom text-sm font-medium text-brand-300">
              Precio por mes, en pesos
            </th>
            {plans.map((item, index) => (
              <th
                key={item.code}
                scope="col"
                className={cn("rounded-t-2xl px-6 pt-6 pb-6 align-bottom font-normal", index === FEATURED && "bg-white text-brand-900")}
              >
                <span className={cn("block font-display text-2xl font-bold", index === FEATURED ? "text-brand-900" : "text-white")}>
                  {item.name}
                </span>
                <span className={cn("mt-1 block text-sm", index === FEATURED ? "text-muted-strong" : "text-brand-200")}>{item.pitch}</span>
                <span
                  className={cn(
                    "mt-4 block font-display text-4xl font-bold font-stretch-85%",
                    index === FEATURED ? "text-brand-900" : "text-white",
                  )}
                >
                  {formatMoney(item.price)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {planFeatures.map((feature) => (
            <tr key={feature.label}>
              <th scope="row" className="border-t border-white/10 py-4 pr-6 font-normal text-brand-100">
                {feature.label}
              </th>
              {feature.values.map((value, index) => (
                <td
                  key={plans[index]!.code}
                  className={cn("border-t px-6 py-4", index === FEATURED ? "border-line bg-white text-ink" : "border-white/10 text-white")}
                >
                  <Value value={value} dark={index !== FEATURED} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td />
            {plans.map((item, index) => (
              <td key={item.code} className={cn("rounded-b-2xl px-6 pt-4 pb-6", index === FEATURED && "bg-white")}>
                <ButtonLink href="/registro?rol=profesional" variant={index === FEATURED ? "accent" : "inverse"} fullWidth>
                  Probar 30 días
                </ButtonLink>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Celular y tablet */}
      <div className="lg:hidden">
        <div role="tablist" aria-label="Planes" className="grid grid-cols-3 gap-1 rounded-2xl bg-white/10 p-1">
          {plans.map((item, index) => (
            <button
              key={item.code}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === selected}
              aria-controls={`${id}-panel`}
              onClick={() => setSelected(index)}
              className={cn(
                "h-11 rounded-xl text-sm font-semibold transition-colors duration-200",
                index === selected ? "bg-white text-brand-900" : "text-brand-100 hover:bg-white/10",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selected}`} className="mt-4 rounded-2xl bg-white p-5 text-ink">
          <p className="text-muted-strong">{plan.pitch}</p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold font-stretch-85%">{formatMoney(plan.price)}</span>
            <span className="text-muted">por mes</span>
          </p>
          <dl className="mt-5 flex flex-col">
            {planFeatures.map((feature) => (
              <div key={feature.label} className="flex items-center justify-between gap-4 border-t border-line py-3">
                <dt className="text-sm text-muted-strong">{feature.label}</dt>
                <dd className="shrink-0 text-sm">
                  <Value value={feature.values[selected]!} />
                </dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/registro?rol=profesional" variant="accent" fullWidth className="mt-4">
            Probar 30 días
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
