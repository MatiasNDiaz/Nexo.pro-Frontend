"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { FeedbackIcon, type FeedbackTone } from "@/components/ui/feedback-icon";
import { refreshAfterPlanChange } from "@/features/catalog/refresh-profile";
import { getMyProfile, proKeys } from "@/features/pro-profile/api";
import { useViewer } from "@/features/session/viewer";
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

  // Con el plan ya aplicado, la página pública y el catálogo (en caché) se actualizan enseguida: el
  // plan cambia el diseño del perfil y la etiqueta de la tarjeta. Sin esto tardaban hasta un minuto.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!applied) return;
    void queryClient
      .fetchQuery({ queryKey: proKeys.me, queryFn: getMyProfile })
      .then((me) => refreshAfterPlanChange(me.slug))
      .then(() => queryClient.invalidateQueries({ queryKey: proKeys.subscription }))
      .catch(() => undefined);
  }, [applied, queryClient]);

  // `fx`: ícono animado de los avisos (null = todavía confirmando: se ve girando).
  const view: { fx: FeedbackTone | null; title: string; text: string } =
    outcome === "approved"
      ? applied
        ? { fx: "success", title: "¡Listo! Tu plan está activo", text: "Ya podés aprovechar todo lo que incluye." }
        : timedOut
          ? { fx: "info", title: "Recibimos tu pago", text: "Mercado Pago todavía nos está avisando. Tu plan se activa en unos minutos; te mandamos una notificación." }
          : { fx: null, title: "Confirmando tu pago…", text: "Esperamos el aviso de Mercado Pago. Es cuestión de segundos." }
      : outcome === "pending"
        ? { fx: "warning", title: "Tu pago está pendiente", text: "Mercado Pago lo está procesando. Cuando se apruebe, tu plan se activa solo y te avisamos." }
        : outcome === "failed"
          ? { fx: "error", title: "El pago no se completó", text: "No se cobró nada. Podés intentar de nuevo con otro medio de pago." }
          : { fx: "info", title: "Volviste de Mercado Pago", text: "Fijate el estado de tu plan en el panel." };

  return (
    <div className="container-page flex max-w-xl flex-col items-center gap-6 py-16 text-center sm:py-24">
      {view.fx ? (
        <FeedbackIcon key={view.fx} tone={view.fx} size="lg" />
      ) : (
        <span className="grid size-20 place-items-center rounded-full bg-brand-50 text-brand-700">
          <Loader2 className="size-10 animate-spin" aria-hidden="true" />
        </span>
      )}
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
