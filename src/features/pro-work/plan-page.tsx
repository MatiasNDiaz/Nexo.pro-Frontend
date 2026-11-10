"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Crown, ExternalLink, Minus, Receipt } from "lucide-react";
import { PlanShell } from "@/components/home/plans-table";
import { revealDelay } from "@/components/motion/reveal";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { planDifferences } from "@/content/home";
import { getSubscription, proKeys } from "@/features/pro-profile/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney } from "@/lib/format";
import { checkout, listPayments, listPlans, paymentStatus, workKeys, type PlanOption } from "./api";
import { PlanComparison } from "./plan-comparison";

const TIERS = ["BASIC", "MEDIUM", "PREMIUM"];

const unavailableReason: Record<NonNullable<PlanOption["reason"]>, string> = {
  RENEWAL_NOT_YET: "Podés renovar en los últimos días de tu mes",
  UPGRADE_WINDOW_CLOSED: "Para cambiar de plan, esperá a que termine tu mes",
  FREE_PLAN: "Plan gratuito",
};

/**
 * Plan y pagos (ADR 0017/0026): cómo está la suscripción, los planes con lo que costaría hoy cada uno
 * (el mes o la diferencia para subir) y el historial. El pago se hace en Mercado Pago: al volver,
 * /suscripcion/resultado confirma que se aplicó (lo aplica el aviso de Mercado Pago, no la vuelta).
 */
export function PlanPage() {
  const subscription = useQuery({ queryKey: proKeys.subscription, queryFn: getSubscription });
  const plans = useQuery({ queryKey: workKeys.plans, queryFn: listPlans });
  const payments = useQuery({ queryKey: workKeys.payments, queryFn: listPayments });
  const pay = useMutation({
    mutationFn: (code: string) => checkout(code),
    onSuccess: (session) => window.location.assign(session.checkoutUrl),
  });
  const sub = subscription.data;

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Tu plan" description="Sin permanencia: pagás mes a mes y cambiás cuando quieras." />

      {subscription.isPending ? (
        <Skeleton className="h-32 w-full rounded-3xl" />
      ) : sub ? (
        <section className="relative isolate flex flex-col gap-2 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white animate-fade-up sm:p-8">
          <span aria-hidden="true" className="absolute -top-24 -right-20 -z-1 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.3),transparent)]" />
          <p className="text-brand-200">{sub.status === "TRIAL" ? "Prueba gratis" : sub.live ? "Plan vigente" : "Sin plan vigente"}</p>
          <p className="font-serif text-5xl leading-none text-amber-400 italic">{sub.plan?.name ?? "—"}</p>
          <p className="text-brand-100">
            {sub.status === "TRIAL" && sub.trialDaysLeft !== null
              ? `Te quedan ${sub.trialDaysLeft} ${sub.trialDaysLeft === 1 ? "día" : "días"} de prueba${sub.trialEndsAt ? ` (hasta el ${formatDate(sub.trialEndsAt)})` : ""}.`
              : sub.live && sub.periodDaysLeft !== null
                ? `Te quedan ${sub.periodDaysLeft} ${sub.periodDaysLeft === 1 ? "día" : "días"}${sub.currentPeriodEnd ? ` (hasta el ${formatDate(sub.currentPeriodEnd)})` : ""}.`
                : "Tu perfil no aparece en el catálogo hasta que elijas un plan."}
          </p>
          {/* ADR 0026: pagando durante la prueba, el plan rige ya y el mes se cuenta desde que termina la prueba. */}
          {sub.status === "TRIAL" && <p className="text-sm text-brand-200">Si pagás ahora no perdés los días de prueba: tu mes empieza cuando termina.</p>}
        </section>
      ) : null}

      {pay.isError && (
        <Alert tone="danger">
          {isApiError(pay.error, "PAYMENTS_UNAVAILABLE", "PAYMENT_PROVIDER_ERROR")
            ? "Mercado Pago no está respondiendo. Probá de nuevo en unos minutos."
            : isApiError(pay.error, "SAME_PLAN")
              ? "Ya tenés ese plan."
              : errorMessage(pay.error)}
        </Alert>
      )}

      {plans.isPending ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[30rem] rounded-3xl" />
          ))}
        </div>
      ) : plans.isError ? (
        <Alert tone="danger" title="No pudimos cargar los planes">
          {errorMessage(plans.error)}
        </Alert>
      ) : (
        // Fondo noche como en el inicio: las tarjetas (sobre todo la Basic, translúcida) están pensadas para él.
        <ul className="grid gap-5 rounded-3xl bg-brand-950 p-3 sm:p-5 lg:grid-cols-3 lg:items-stretch">
          {[...plans.data]
            .sort((a, b) => TIERS.indexOf(a.code) - TIERS.indexOf(b.code))
            .map((plan, index) => {
              const tier = Math.max(0, TIERS.indexOf(plan.code));
              const price = formatMoney(plan.amount ?? plan.price);
              return (
                <li key={plan.code} data-reveal style={revealDelay(index, 110)} className="flex">
                  <PlanShell tier={tier}>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className={cn("font-serif text-5xl leading-none italic", tier === 2 ? "text-amber-400" : "text-white")}>{plan.name}</h2>
                      {plan.current && <Badge tone="success">Tu plan</Badge>}
                    </div>
                    <p className="mt-6 flex flex-col">
                      <span className="font-display text-5xl font-bold tracking-tight text-white font-stretch-[112%]">{price}</span>
                      <span className={tier === 2 ? "text-amber-100/70" : "text-brand-200"}>
                        {plan.purpose === "UPGRADE_DIFFERENCE" ? "la diferencia hasta fin de tu mes" : "por mes"}
                      </span>
                    </p>
                    <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-white/10 pt-6">
                      {/* En la tarjeta solo lo que cambia entre planes; el detalle y lo común, en la tabla de abajo. */}
                      {planDifferences.map((feature) => {
                        const value = feature.values[tier]!;
                        const included = value !== false;
                        return (
                          <li key={feature.label} className={cn("flex items-start gap-2.5", !included && "opacity-45")}>
                            {included ? (
                              <Check className={cn("mt-0.5 size-4 shrink-0", tier === 2 ? "text-amber-400" : tier === 1 ? "text-electric-400" : "text-brand-200")} strokeWidth={3} aria-hidden="true" />
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
                      <button
                        type="button"
                        disabled={!plan.available || pay.isPending}
                        onClick={() => pay.mutate(plan.code)}
                        className={cn(
                          "group/cta relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold transition-[translate,filter,background-color] duration-200 ease-out-soft enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
                          tier === 2
                            ? "bg-linear-to-r from-amber-100 via-amber-400 to-amber-500 text-brand-900 enabled:hover:brightness-110"
                            : tier === 1
                              ? "bg-amber-400 text-brand-900 enabled:hover:bg-amber-500"
                              : "bg-white text-brand-900 enabled:hover:bg-brand-50",
                        )}
                      >
                        {tier === 2 && plan.available && (
                          <span aria-hidden="true" className="shine-hover bg-linear-to-r from-transparent via-white/80 to-transparent group-hover/cta:[animation:shine-once_600ms_var(--ease-out-soft)]" />
                        )}
                        {tier === 2 && <Crown className="relative size-4" aria-hidden="true" />}
                        <span className="relative">
                          {!plan.available
                            ? plan.reason
                              ? unavailableReason[plan.reason]
                              : plan.current
                                ? "Es tu plan"
                                : "No disponible"
                            : plan.current
                              ? sub?.status === "TRIAL"
                                ? `Pagar ${plan.name}`
                                : "Renovar"
                              : plan.purpose === "UPGRADE_DIFFERENCE"
                                ? `Pasar a ${plan.name}`
                                : `Elegir ${plan.name}`}
                        </span>
                        {plan.available && <ExternalLink className="relative size-4 opacity-70" aria-hidden="true" />}
                      </button>
                    </div>
                  </PlanShell>
                </li>
              );
            })}
        </ul>
      )}
      <p className="-mt-4 text-sm text-muted-strong">El pago se hace en Mercado Pago. Al volver, tu plan se activa en unos segundos.</p>

      <SettingsSection title="Qué incluye cada plan" description="El detalle de cada cosa, y lo que tenés en cualquier plan.">
        <PlanComparison currentCode={sub?.plan?.code} />
      </SettingsSection>

      <SettingsSection title="Tus pagos" description="Los pagos de tus planes, el más reciente primero.">
        {payments.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : payments.isError ? (
          <Alert tone="danger">{errorMessage(payments.error)}</Alert>
        ) : payments.data.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Receipt className="size-4" aria-hidden="true" />
            Todavía no hiciste pagos.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {payments.data.map((payment) => {
              const status = paymentStatus[payment.status];
              return (
                <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="flex flex-1 flex-col">
                    <span className="font-medium text-ink">
                      {payment.planCode.charAt(0) + payment.planCode.slice(1).toLowerCase()} · {payment.purpose === "UPGRADE_DIFFERENCE" ? "diferencia por cambio de plan" : "mes"}
                    </span>
                    <span className="text-sm text-muted">
                      {formatDate(payment.createdAt)}
                      {payment.grantedUntil && ` · vigente hasta el ${formatDate(payment.grantedUntil)}`}
                    </span>
                  </span>
                  <span className="font-display text-lg font-bold text-ink">{formatMoney(payment.amount)}</span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsSection>
    </div>
  );
}
