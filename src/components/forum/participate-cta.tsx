"use client";

import { MessageSquarePlus } from "lucide-react";
import type { Route } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { useViewer } from "@/features/session/viewer";

/**
 * Participar en el foro (publicar, responder, "me gusta") requiere sesión: clientes activos y
 * profesionales con plan (E-109). Esas acciones llegan con el panel; acá no se muestran botones que
 * todavía no funcionan.
 */
export function ParticipateCta({ returnTo, text }: { returnTo: string; text: string }) {
  const viewer = useViewer();
  if (viewer.status === "loading") return <Skeleton className="h-20 w-full rounded-2xl" />;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <MessageSquarePlus className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
        <p className="text-sm text-brand-900">
          {viewer.status === "anonymous" ? text : "Muy pronto vas a poder publicar y responder desde acá con tu cuenta."}
        </p>
      </div>
      {viewer.status === "anonymous" && (
        <ButtonLink href={`/ingresar?siguiente=${encodeURIComponent(returnTo)}` as Route} size="sm" className="shrink-0">
          Ingresar
        </ButtonLink>
      )}
    </div>
  );
}
