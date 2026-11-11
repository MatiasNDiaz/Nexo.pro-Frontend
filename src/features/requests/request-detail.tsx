"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, FileX, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { SettingsSection } from "@/features/account/settings-section";
import { chatKeys, counterpartName, type Conversation } from "@/features/chat/api";
import { CounterpartAvatar } from "@/features/chat/counterpart-avatar";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate, formatMoney } from "@/lib/format";
import {
  cancelRequest,
  canSelect,
  contractKeys,
  getRequest,
  requestKeys,
  selectTarget,
  type RequestTarget,
  type ServiceRequest,
} from "./api";
import { requestStatus, targetStatus, urgencyLabel } from "./labels";
import { QuoteSummary, ReasonDialog } from "./shared";
import { useCounterparts, useProfessionNames } from "./use-counterparts";

export function RequestDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const request = useQuery({ queryKey: requestKeys.detail(id), queryFn: () => getRequest(id) });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/pedidos" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Todos los pedidos
      </Link>
      {request.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      ) : request.isError ? (
        <EmptyState
          headingLevel={1}
          icon={FileX}
          title={isApiError(request.error, "REQUEST_NOT_FOUND", "VALIDATION_FAILED") ? "No encontramos ese pedido" : "No pudimos cargar el pedido"}
          description={isApiError(request.error, "REQUEST_NOT_FOUND", "VALIDATION_FAILED") ? "Puede que el enlace esté mal o que no sea tuyo." : errorMessage(request.error)}
        />
      ) : (
        <RequestDetail request={request.data} />
      )}
    </div>
  );
}

function RequestDetail({ request }: { request: ServiceRequest }) {
  const queryClient = useQueryClient();
  const professionNames = useProfessionNames();
  const { byConversation } = useCounterparts();
  const [cancelling, setCancelling] = useState(false);
  const status = requestStatus[request.status];
  const open = request.status === "OPEN";

  /** El pedido cambió: se guarda la respuesta y se refresca lo que depende de él. */
  const applyUpdate = (updated: ServiceRequest) => {
    queryClient.setQueryData(requestKeys.detail(updated.id), updated);
    void queryClient.invalidateQueries({ queryKey: requestKeys.all, exact: true });
    void queryClient.invalidateQueries({ queryKey: contractKeys.all });
    void queryClient.invalidateQueries({ queryKey: chatKeys.all });
  };

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelRequest(request.id, reason),
    meta: { success: { title: "Cancelaste el pedido", description: "Les avisamos a los profesionales por el chat." } },
    onSuccess: (updated) => {
      setCancelling(false);
      applyUpdate(updated);
    },
  });

  return (
    <>
      <header className="flex flex-col gap-3 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold text-brand-900">{professionNames.get(request.professionId) ?? "Pedido de presupuesto"}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="text-sm text-muted">
          Pedido el {formatDate(request.createdAt)} · {urgencyLabel[request.urgency]}
        </p>
        <p className="leading-relaxed whitespace-pre-line text-ink [overflow-wrap:anywhere]">{request.description}</p>
      </header>

      {request.status === "SELECTED" && request.contractId && (
        <Alert tone="success" title="Ya elegiste un profesional">
          <span className="flex flex-col gap-2">
            Seguí el trabajo desde “Trabajos”. Ahí ves cuándo lo agenda, cuándo empieza y cuándo termina.
            <ButtonLink href={`/panel/trabajos/${request.contractId}` as Route} variant="secondary" size="sm" className="self-start">
              Ver el trabajo
            </ButtonLink>
          </span>
        </Alert>
      )}

      <SettingsSection
        title={request.targets.length === 1 ? "Profesional" : "Profesionales"}
        description={open ? "Cuando un profesional te responde o te manda un presupuesto, podés elegirlo." : undefined}
      >
        <ul className="flex flex-col gap-4">
          {request.targets.map((target) => (
            <li key={target.id}>
              <TargetCard target={target} conversation={byConversation.get(target.conversationId)} requestOpen={open} />
            </li>
          ))}
        </ul>
      </SettingsSection>

      {open && (
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="self-start text-danger-600 hover:bg-danger-50" onClick={() => setCancelling(true)}>
            Cancelar el pedido
          </Button>
          <ReasonDialog
            open={cancelling}
            onClose={() => setCancelling(false)}
            title="¿Cancelar el pedido?"
            description="Les avisamos a los profesionales por el chat. Si nadie te respondió todavía, el aviso dice que ya lo solucionaste."
            confirmLabel="Cancelar el pedido"
            pending={cancel.isPending}
            error={cancel.isError ? errorMessage(cancel.error) : null}
            onConfirm={(reason) => cancel.mutate(reason)}
          />
        </div>
      )}
    </>
  );
}

interface TargetCardProps {
  target: RequestTarget;
  conversation: Conversation | undefined;
  requestOpen: boolean;
}

function TargetCard({ target, conversation, requestOpen }: TargetCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [choosing, setChoosing] = useState(false);
  const status = targetStatus[target.status];
  const name = conversation ? counterpartName(conversation) : "Profesional";
  const quote = target.currentQuote?.status === "SENT" ? target.currentQuote : null;

  const select = useMutation({
    mutationFn: () => selectTarget(target.id, quote?.id),
    meta: { success: { title: `¡Elegiste a ${name}!`, description: "Seguí el trabajo desde acá: vas a ver cuándo lo agenda, empieza y termina." } },
    onSuccess: async (contract) => {
      queryClient.setQueryData(contractKeys.detail(contract.id), contract);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: requestKeys.all }),
        queryClient.invalidateQueries({ queryKey: contractKeys.all, exact: true }),
        queryClient.invalidateQueries({ queryKey: chatKeys.all }),
      ]);
      router.push(`/panel/trabajos/${contract.id}` as Route);
    },
  });

  const selectError = select.error
    ? isApiError(select.error, "PROFESSIONAL_UNAVAILABLE")
      ? `${name} no está disponible ahora. Podés seguir hablando por el chat o elegir a otro.`
      : isApiError(select.error, "INVALID_STATE_TRANSITION", "INVALID_QUOTE")
        ? "El pedido cambió mientras lo mirabas. Recargá la página para ver cómo quedó."
        : errorMessage(select.error)
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center gap-3">
        {conversation && <CounterpartAvatar conversation={conversation} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-ink">{name}</span>
          <span>
            <Badge tone={status.tone}>
              {target.status === "SELECTED" && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
              {status.label}
            </Badge>
          </span>
        </div>
      </div>

      {target.currentQuote && target.currentQuote.status !== "WITHDRAWN" && target.currentQuote.status !== "SUPERSEDED" && (
        <QuoteSummary quote={target.currentQuote} title={target.currentQuote.status === "ACCEPTED" ? "Presupuesto aceptado" : "Presupuesto"} />
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink href={`/panel/mensajes/${target.conversationId}` as Route} variant="secondary">
          <MessageCircle className="size-4" aria-hidden="true" />
          Ir al chat
        </ButtonLink>
        {requestOpen && canSelect(target) && (
          <Button variant="accent" onClick={() => setChoosing(true)}>
            {quote ? "Aceptar presupuesto" : `Elegir a ${name}`}
          </Button>
        )}
      </div>

      <Dialog
        open={choosing}
        onClose={() => setChoosing(false)}
        title={quote ? `¿Aceptar el presupuesto de ${name}?` : `¿Elegir a ${name}?`}
        description="Se arma el trabajo con este profesional. A los demás les avisamos que ya elegiste."
      >
        <div className="flex flex-col gap-4">
          {selectError && <Alert tone="danger">{selectError}</Alert>}
          {quote ? (
            <QuoteSummary quote={quote} />
          ) : (
            <p className="text-sm text-muted">Todavía no te mandó un presupuesto: lo pueden acordar por el chat.</p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setChoosing(false)}>
              Volver
            </Button>
            <Button variant="accent" loading={select.isPending} onClick={() => select.mutate()}>
              {quote ? `Aceptar ${formatMoney(quote.amount) ?? ""}`.trim() : "Elegir"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
