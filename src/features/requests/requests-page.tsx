"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { errorMessage } from "@/lib/api/errors";
import { formatDate, plural } from "@/lib/format";
import { canSelect, listRequests, requestKeys, type ServiceRequest } from "./api";
import { requestStatus, urgencyLabel } from "./labels";
import { useProfessionNames } from "./use-counterparts";

/** Mis pedidos de presupuesto, el más reciente primero. */
export function RequestsPage() {
  const requests = useQuery({ queryKey: requestKeys.all, queryFn: listRequests });
  const professionNames = useProfessionNames();

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Pedidos" description="Los presupuestos que pediste y las respuestas de cada profesional." />
      {requests.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : requests.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus pedidos">
          {errorMessage(requests.error)}
        </Alert>
      ) : requests.data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Todavía no pediste presupuestos"
          description="Entrá al perfil de un profesional y tocá “Pedir presupuesto”. Te avisamos cuando responda."
          action={
            <ButtonLink href="/profesionales" variant="secondary">
              Buscar profesionales
            </ButtonLink>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.data.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} profession={professionNames.get(request.professionId)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ request, profession }: { request: ServiceRequest; profession: string | undefined }) {
  const status = requestStatus[request.status];
  const answered = request.targets.filter((t) => canSelect(t) || t.status === "SELECTED").length;
  return (
    <Link
      href={`/panel/pedidos/${request.id}` as Route}
      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-200 sm:p-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{profession ?? "Pedido"}</span>
          <Badge tone={status.tone}>{status.label}</Badge>
          {request.urgency === "URGENT" && <Badge tone="danger">{urgencyLabel.URGENT}</Badge>}
        </div>
        <p className="line-clamp-2 text-sm text-muted-strong [overflow-wrap:anywhere]">{request.description}</p>
        <p className="text-xs text-muted">
          {formatDate(request.createdAt)}
          {request.status === "OPEN" && ` · ${answered > 0 ? `${plural(answered, "respuesta")}` : "Sin respuestas todavía"}`}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}
