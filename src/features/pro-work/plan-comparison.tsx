import { Check, Minus } from "lucide-react";
import { planDetailGroups, plans, type PlanValue } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Qué incluye cada plan, con el detalle de cada cosa (/panel/plan). Desde `sm` es una tabla de verdad
 * (encabezados de columna y de fila) para que un lector de pantalla diga "Premium, Oficios: hasta 3", con
 * la columna del plan actual marcada. En celular cuatro columnas no entran: cada cosa va con sus tres
 * valores abajo (sin desplazamiento horizontal). Las dos versiones usan display none, así que un lector
 * de pantalla lee solo la visible.
 */
export function PlanComparison({ currentCode }: { currentCode?: string }) {
  return (
    <>
      <PlanComparisonList currentCode={currentCode} />
      <table className="hidden w-full border-collapse text-left text-sm sm:table">
        <caption className="sr-only">Qué incluye cada plan</caption>
        <thead>
          <tr>
            <td className="w-1/2" />
            {plans.map((plan) => (
              <th
                key={plan.code}
                scope="col"
                className={cn("px-3 pb-3 text-center font-semibold text-brand-900", plan.code === currentCode && "rounded-t-xl bg-brand-50")}
              >
                {plan.name}
                {plan.code === currentCode && <span className="block text-xs font-medium text-muted-strong">Tu plan</span>}
              </th>
            ))}
          </tr>
        </thead>
        {planDetailGroups.map((group) => (
          <tbody key={group.title}>
            <tr>
              <th scope="colgroup" colSpan={4} className="pt-6 pb-2 text-xs font-semibold tracking-wide text-muted-strong uppercase">
                {group.title}
              </th>
            </tr>
            {group.items.map((item) => (
              <tr key={item.key} className="border-t border-line">
                <th scope="row" className="py-3 pr-4 align-top font-normal">
                  <span className="block font-medium text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-muted-strong">{item.detail}</span>
                </th>
                {item.values.map((value, tier) => (
                  <td key={plans[tier]!.code} className={cn("px-3 py-3 text-center align-top", plans[tier]!.code === currentCode && "bg-brand-50")}>
                    <PlanCell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </>
  );
}

function PlanComparisonList({ currentCode }: { currentCode?: string }) {
  return (
    <div className="flex flex-col gap-6 sm:hidden">
      {planDetailGroups.map((group) => (
        <section key={group.title} className="flex flex-col">
          <h3 className="pb-2 text-xs font-semibold tracking-wide text-muted-strong uppercase">{group.title}</h3>
          <ul className="flex flex-col divide-y divide-line border-t border-line">
            {group.items.map((item) => (
              <li key={item.key} className="flex flex-col gap-2 py-3 text-sm">
                <span>
                  <span className="block font-medium text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-muted-strong">{item.detail}</span>
                </span>
                <dl className="grid grid-cols-3 gap-1.5">
                  {item.values.map((value, tier) => {
                    const plan = plans[tier]!;
                    return (
                      <div
                        key={plan.code}
                        className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-center", plan.code === currentCode ? "bg-brand-50" : "bg-canvas")}
                      >
                        <dt className="text-xs text-muted-strong">{plan.name}</dt>
                        <dd className="leading-tight">
                          <PlanCell value={value} />
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function PlanCell({ value }: { value: PlanValue }) {
  if (value === true) {
    return (
      <>
        <Check className="mx-auto size-4 text-success-600" strokeWidth={3} aria-hidden="true" />
        <span className="sr-only">Incluido</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="mx-auto size-4 text-brand-300" aria-hidden="true" />
        <span className="sr-only">No incluido</span>
      </>
    );
  }
  return <span className="font-semibold text-ink">{value}</span>;
}
