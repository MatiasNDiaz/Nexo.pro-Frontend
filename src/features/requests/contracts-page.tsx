"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, ChevronRight, FileText, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { chatKeys, counterpartName } from "@/features/chat/api";
import { CounterpartAvatar } from "@/features/chat/counterpart-avatar";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { cancelContract, contractKeys, getContract, listContracts, OPEN_CONTRACT_STATUSES, requestKeys, type Contract } from "./api";
import { contractStatus } from "./labels";
import { QuoteSummary, ReasonDialog } from "./shared";
import { useCounterparts } from "./use-counterparts";

/** Mis trabajos (contrataciones), el más reciente primero. */
export function ContractsPage() {
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts });
  const { byConversation } = useCounterparts();

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Trabajos" description="Los profesionales que elegiste y en qué quedó cada trabajo." />
      {contracts.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : contracts.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus trabajos">
          {errorMessage(contracts.error)}
        </Alert>
      ) : contracts.data.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Todavía no tenés trabajos"
          description="Cuando elijas a un profesional en uno de tus pedidos, el trabajo aparece acá."
          action={
            <ButtonLink href="/panel/pedidos" variant="secondary">
              Ver mis pedidos
            </ButtonLink>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {contracts.data.map((contract) => {
            const conversation = byConversation.get(contract.conversationId);
            const status = contractStatus[contract.status];
            const amount = formatMoney(contract.acceptedQuote?.amount);
            return (
              <li key={contract.id}>
                <Link
                  href={`/panel/trabajos/${contract.id}` as Route}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand-200 sm:p-5"
                >
                  {conversation && <CounterpartAvatar conversation={conversation} />}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-ink">{conversation ? counterpartName(conversation) : "Profesional"}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted">
                      {contract.scheduledAt && contract.status === "SCHEDULED"
                        ? `Agendado para el ${formatDateTime(contract.scheduledAt)}`
                        : `Desde el ${formatDate(contract.createdAt)}`}
                      {amount && ` · ${amount}`}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ContractDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const contract = useQuery({ queryKey: contractKeys.detail(id), queryFn: () => getContract(id) });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/trabajos" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Todos los trabajos
      </Link>
      {contract.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      ) : contract.isError ? (
        <EmptyState
          headingLevel={1}
          icon={Briefcase}
          title={isApiError(contract.error, "CONTRACT_NOT_FOUND", "VALIDATION_FAILED") ? "No encontramos ese trabajo" : "No pudimos cargar el trabajo"}
          description={isApiError(contract.error, "CONTRACT_NOT_FOUND", "VALIDATION_FAILED") ? "Puede que el enlace esté mal o que no sea tuyo." : errorMessage(contract.error)}
        />
      ) : (
        <ContractDetail contract={contract.data} />
      )}
    </div>
  );
}

function ContractDetail({ contract }: { contract: Contract }) {
  const queryClient = useQueryClient();
  const { byConversation } = useCounterparts();
  const [cancelling, setCancelling] = useState(false);
  const conversation = byConversation.get(contract.conversationId);
  const name = conversation ? counterpartName(conversation) : "el profesional";
  const status = contractStatus[contract.status];
  const open = OPEN_CONTRACT_STATUSES.includes(contract.status);

  const cancel = useMutation({
    mutationFn: (reason: string) => cancelContract(contract.id, reason),
    onSuccess: (updated) => {
      setCancelling(false);
      queryClient.setQueryData(contractKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: contractKeys.all, exact: true });
      void queryClient.invalidateQueries({ queryKey: requestKeys.all });
      void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });

  // Solo los pasos que ocurrieron: se puede terminar sin pasar por "en curso" (FI §11.4).
  const steps = [
    { label: "Acordado", date: contract.createdAt },
    { label: "Fecha agendada", date: contract.scheduledAt },
    { label: "Empezó", date: contract.startedAt },
    { label: "Terminado", date: contract.completedAt },
    { label: "Cancelado", date: contract.cancelledAt },
  ].filter((step): step is { label: string; date: string } => step.date !== null);

  return (
    <>
      <header className="flex flex-col gap-3 animate-fade-up">
        <div className="flex flex-wrap items-center gap-3">
          {conversation && <CounterpartAvatar conversation={conversation} size="lg" />}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-brand-900">Trabajo con {name}</h1>
            <span>
              <Badge tone={status.tone}>{status.label}</Badge>
            </span>
          </div>
        </div>
      </header>

      {contract.status === "CANCELLED_BY_PRO" && (
        <Alert tone="warning" title={`${name} canceló el trabajo`}>
          {contract.cancelReason ? `Motivo: ${contract.cancelReason}` : "No dejó un motivo. Podés escribirle por el chat."}
        </Alert>
      )}

      <SettingsSection title="Detalle" description="El profesional agenda, empieza y termina el trabajo; te avisamos en cada paso.">
        {contract.acceptedQuote && <QuoteSummary quote={contract.acceptedQuote} title="Presupuesto aceptado" />}
        <ol className="flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.label} className="flex flex-wrap justify-between gap-2 rounded-xl bg-canvas px-4 py-3 text-sm">
              <span className="font-medium text-ink">{step.label}</span>
              <span className="text-muted">{formatDateTime(step.date)}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href={`/panel/mensajes/${contract.conversationId}` as Route} variant="secondary">
            <MessageCircle className="size-4" aria-hidden="true" />
            Ir al chat
          </ButtonLink>
          <ButtonLink href={`/panel/pedidos/${contract.requestId}` as Route} variant="ghost">
            <FileText className="size-4" aria-hidden="true" />
            Ver el pedido
          </ButtonLink>
        </div>
      </SettingsSection>

      {open && (
        <>
          <Button variant="ghost" className="self-start text-danger-600 hover:bg-danger-50" onClick={() => setCancelling(true)}>
            Cancelar el trabajo
          </Button>
          <ReasonDialog
            open={cancelling}
            onClose={() => setCancelling(false)}
            title="¿Cancelar el trabajo?"
            description={`Le avisamos a ${name} por el chat. Contarle el motivo ayuda a que quede claro.`}
            confirmLabel="Cancelar el trabajo"
            pending={cancel.isPending}
            error={
              cancel.isError
                ? isApiError(cancel.error, "INVALID_STATE_TRANSITION")
                  ? "El trabajo cambió mientras lo mirabas (por ejemplo, ya terminó). Recargá la página."
                  : errorMessage(cancel.error)
                : null
            }
            onConfirm={(reason) => cancel.mutate(reason)}
          />
        </>
      )}
    </>
  );
}
