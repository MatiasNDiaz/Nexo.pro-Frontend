"use client";

import { MessageSquarePlus, PenSquare } from "lucide-react";
import type { Route } from "next";
import { ShineLink } from "@/components/home/shine-link";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { useViewer } from "@/features/session/viewer";
import { cn } from "@/lib/cn";

/**
 * Participar en el foro (publicar, responder, "me gusta") requiere sesión: clientes activos y
 * profesionales con plan (E-109). Sin sesión invita a ingresar; con la cuenta por activar explica qué
 * falta; al admin no se le muestra (modera desde su panel).
 */
export function ParticipateCta({
  returnTo,
  text,
  showPublish = false,
  stacked = false,
}: {
  returnTo: string;
  text: string;
  showPublish?: boolean;
  /** Siempre en columna (para una columna angosta, como la de la lista del foro). */
  stacked?: boolean;
}) {
  const viewer = useViewer();
  const row = stacked ? "" : "sm:flex-row sm:items-center sm:justify-between";
  if (viewer.status === "loading") return <Skeleton className="h-20 w-full rounded-2xl" />;
  if (viewer.status === "authenticated" && viewer.user.role === "ADMIN") return null;

  if (viewer.status === "authenticated" && viewer.user.status === "ACTIVE") {
    if (!showPublish) return null;
    return (
      <div className={cn("relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl bg-brand-950 p-5 text-white sm:p-6", row)}>
        <span aria-hidden="true" className="absolute -top-20 -right-10 -z-1 size-60 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.35),transparent)]" />
        <div className="flex items-start gap-3">
          <PenSquare className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden="true" />
          <p>
            <span className="block font-display text-xl font-bold">¿Tenés una duda o buscás a alguien?</span>
            <span className="text-brand-200">Preguntale a la comunidad o publicá lo que necesitás.</span>
          </p>
        </div>
        <ShineLink href="/foro/nueva" className="shrink-0">
          Publicar en el foro
        </ShineLink>
      </div>
    );
  }

  const pending = viewer.status === "authenticated";
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5", row)}>
      <div className="flex items-start gap-3">
        <MessageSquarePlus className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
        <p className="text-sm text-brand-900">{pending ? "Para publicar y responder, primero activá tu cuenta." : text}</p>
      </div>
      {pending ? (
        <ButtonLink href="/panel" size="sm" variant="secondary" className="shrink-0">
          Ver cómo activarla
        </ButtonLink>
      ) : (
        <ButtonLink href={`/ingresar?siguiente=${encodeURIComponent(returnTo)}` as Route} size="sm" className="shrink-0">
          Ingresar
        </ButtonLink>
      )}
    </div>
  );
}
