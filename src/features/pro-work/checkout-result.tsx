"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { useViewer } from "@/features/session/viewer";
import { cn } from "@/lib/cn";
import { listPayments, workKeys } from "./api";

/** Hasta cuándo se espera el aviso de Mercado Pago que aplica el plan. */
const WAIT_MS = 45_000;

/**
 * Vuelta desde Mercado Pago (`/suscripcion/resultado`, configurada en el backend). Lo que dice la URL
 * es solo orientativo: el plan lo aplica el aviso firmado de Mercado Pago al backend. Por eso, si el
 * pago volvió aprobado, se consulta el historial hasta ver el pago aplicado.
 */
export function CheckoutResult() {
  const params = useSearchParams();
  const viewer = useViewer();
  const raw = params.get("status") ?? params.get("collection_status") ?? "";
  const outcome = raw === "approved" ? "approved" : raw === "pending" || raw === "in_process" ? "pending" : raw ? "failed" : "unknown";
  const [started] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const signedIn = viewer.status === "authenticated" && viewer.user.role === "PROFESSIONAL";

  const payments = useQuery({
    queryKey: workKeys.payments,
    queryFn: listPayments,
    enabled: signedIn && outcome === "approved",
    refetchInterval: (query) => (query.state.data?.[0]?.applied || timedOut ? false : 3000),
  });
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), Math.max(0, WAIT_MS - (Date.now() - started)));
    return () => clearTimeout(timer);
  }, [started]);
  const applied = payments.data?.[0]?.applied ?? false;

  const view =
    outcome === "approved"
      ? applied
        ? { icon: CheckCircle2, tone: "bg-success-600", title: "¡Listo! Tu plan está activo", text: "Ya podés aprovechar todo lo que incluye." }
        : timedOut
          ? { icon: Clock3, tone: "bg-amber-500", title: "Recibimos tu pago", text: "Mercado Pago todavía nos está avisando. Tu plan se activa en unos minutos; te mandamos una notificación." }
          : { icon: Loader2, tone: "bg-brand-700", title: "Confirmando tu pago…", text: "Esperamos el aviso de Mercado Pago. Es cuestión de segundos.", spin: true }
      : outcome === "pending"
        ? { icon: Clock3, tone: "bg-amber-500", title: "Tu pago está pendiente", text: "Mercado Pago lo está procesando. Cuando se apruebe, tu plan se activa solo y te avisamos." }
        : outcome === "failed"
          ? { icon: XCircle, tone: "bg-danger-600", title: "El pago no se completó", text: "No se cobró nada. Podés intentar de nuevo con otro medio de pago." }
          : { icon: Clock3, tone: "bg-brand-700", title: "Volviste de Mercado Pago", text: "Fijate el estado de tu plan en el panel." };
  const Icon = view.icon;

  return (
    <div className="container-page flex max-w-xl flex-col items-center gap-6 py-16 text-center sm:py-24">
      <span className={cn("grid size-20 place-items-center rounded-full text-white shadow-raised animate-[pop-in_320ms_var(--ease-out-soft)]", view.tone)}>
        <Icon className={cn("size-10", "spin" in view && view.spin && "animate-spin")} aria-hidden="true" />
      </span>
      <h1 className="text-4xl leading-tight font-bold text-brand-900" aria-live="polite">
        {view.title}
      </h1>
      <p className="text-lg text-muted-strong">{view.text}</p>
      <ButtonLink href={"/panel/plan" as Route} variant={outcome === "failed" ? "accent" : "primary"} size="lg">
        {outcome === "failed" ? "Volver a intentar" : "Ir a mi plan"}
      </ButtonLink>
    </div>
  );
}
