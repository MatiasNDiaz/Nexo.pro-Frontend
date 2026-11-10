"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, ChevronRight, FileText, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { useMe } from "@/features/account/use-me";
import { chatKeys, counterpartName } from "@/features/chat/api";
import { CounterpartAvatar } from "@/features/chat/counterpart-avatar";
import { completeContract, scheduleContract, startContract } from "@/features/pro-work/api";
import { ReviewPanel } from "@/features/reviews/review-panel";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { cancelContract, contractKeys, getContract, listContracts, OPEN_CONTRACT_STATUSES, requestKeys, type Contract } from "./api";
import { contractStatus } from "./labels";
import { QuoteSummary, ReasonDialog } from "./shared";
import { useCounterparts } from "./use-counterparts";

/** Estado del trabajo dicho para quien lo mira (las cancelaciones cambian de sujeto). */
function statusFor(isPro: boolean, status: Contract["status"]) {
  if (isPro && status === "CANCELLED_BY_CLIENT") return { label: "Lo canceló el cliente", tone: "danger" as const };
  if (isPro && status === "CANCELLED_BY_PRO") return { label: "Lo cancelaste", tone: "neutral" as const };
  return contractStatus[status];
}

/** Mis trabajos (contrataciones), el más reciente primero. Sirve al cliente y al profesional. */
export function ContractsPage() {
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts });
  const { byConversation } = useCounterparts();
  const isPro = useMe().role === "PROFESSIONAL";

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle
        title="Trabajos"
        description={isPro ? "Los trabajos que te encargaron: agendalos, empezalos y terminalos desde acá." : "Los profesionales que elegiste y en qué quedó cada trabajo."}
      />
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
          description={
            isPro
              ? "Cuando un cliente acepte tu presupuesto, el trabajo aparece acá."
              : "Cuando elijas a un profesional en uno de tus pedidos, el trabajo aparece acá."
          }
          action={
            <ButtonLink href={isPro ? "/panel/solicitudes" : "/panel/pedidos"} variant="secondary">
              {isPro ? "Ver pedidos recibidos" : "Ver mis pedidos"}
            </ButtonLink>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {contracts.data.map((contract) => {
            const conversation = byConversation.get(contract.conversationId);
            const status = statusFor(isPro, contract.status);
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
                      <span className="truncate font-semibold text-ink">{conversation ? counterpartName(conversation) : isPro ? "Cliente" : "Profesional"}</span>
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
  const isPro = useMe().role === "PROFESSIONAL";
  const conversation = byConversation.get(contract.conversationId);
  const name = conversation ? counterpartName(conversation) : isPro ? "el cliente" : "el profesional";
  const status = statusFor(isPro, contract.status);
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

      {contract.status === (isPro ? "CANCELLED_BY_CLIENT" : "CANCELLED_BY_PRO") && (
        <Alert tone="warning" title={`${name} canceló el trabajo`}>
          {contract.cancelReason ? `Motivo: ${contract.cancelReason}` : "No dejó un motivo. Podés escribirle por el chat."}
        </Alert>
      )}

      {isPro && open && <ProActions contract={contract} name={name} />}

      <SettingsSection
        title="Detalle"
        description={isPro ? "Cada paso le llega al cliente por el chat." : "El profesional agenda, empieza y termina el trabajo; te avisamos en cada paso."}
      >
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
          <ButtonLink href={`/panel/${isPro ? "solicitudes" : "pedidos"}/${contract.requestId}` as Route} variant="ghost">
            <FileText className="size-4" aria-hidden="true" />
            Ver el pedido
          </ButtonLink>
        </div>
      </SettingsSection>

      {contract.status === "COMPLETED" && !isPro && <ReviewPanel contractId={contract.id} completedAt={contract.completedAt} name={name} />}

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

/**
 * Avance del trabajo, del lado del profesional: agendar (o cambiar la fecha), empezar y terminar.
 * Terminar no exige pasar por "en curso" (FI §11.4). Cada paso le llega al cliente por el chat.
 */
function ProActions({ contract, name }: { contract: Contract; name: string }) {
  const queryClient = useQueryClient();
  const [when, setWhen] = useState(contract.scheduledAt ? toLocalInput(contract.scheduledAt) : "");
  const [confirm, setConfirm] = useState<"start" | "complete" | null>(null);
  const done = (updated: Contract) => {
    queryClient.setQueryData(contractKeys.detail(updated.id), updated);
    void queryClient.invalidateQueries({ queryKey: contractKeys.all, exact: true });
    void queryClient.invalidateQueries({ queryKey: chatKeys.all });
    setConfirm(null);
    // Al empezar, el backend sugiere ponerse en "Trabajando" (C-30): se refleja en la agenda.
    void queryClient.invalidateQueries({ queryKey: ["professional", "me"] });
  };
  const schedule = useMutation({ mutationFn: () => scheduleContract(contract.id, new Date(when).toISOString()), onSuccess: done });
  const start = useMutation({ mutationFn: () => startContract(contract.id), onSuccess: done });
  const complete = useMutation({ mutationFn: () => completeContract(contract.id), onSuccess: done });
  const minDate = toLocalInput(new Date().toISOString());
  const error = schedule.error ?? start.error ?? complete.error;

  return (
    <section aria-labelledby="avance" className="relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-brand-950 p-5 text-white shadow-raised sm:p-7">
      <span aria-hidden="true" className="absolute -top-20 -right-16 -z-1 size-64 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.28),transparent)]" />
      <h2 id="avance" className="font-display text-2xl font-bold">
        {contract.status === "IN_PROGRESS" ? "¿Terminaste?" : contract.scheduledAt ? "Trabajo agendado" : `Agendá el trabajo con ${name}`}
      </h2>
      {contract.status !== "IN_PROGRESS" && (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            if (when) schedule.mutate();
          }}
        >
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-sm font-medium text-brand-100">{contract.scheduledAt ? "Cambiar la fecha" : "Día y hora"}</span>
            <input
              type="datetime-local"
              min={minDate}
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className="h-11 rounded-xl border border-white/20 bg-white/10 px-3.5 text-base text-white [color-scheme:dark] focus:border-electric-400 focus:outline-none focus:ring-4 focus:ring-electric-500/30"
            />
          </label>
          <Button type="submit" variant="inverse" loading={schedule.isPending} disabled={!when}>
            {contract.scheduledAt ? "Guardar fecha" : "Agendar"}
          </Button>
        </form>
      )}
      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {contract.status !== "IN_PROGRESS" && (
          <Button variant="secondary" onClick={() => setConfirm("start")}>
            Empezar el trabajo
          </Button>
        )}
        <Button variant="accent" onClick={() => setConfirm("complete")}>
          Marcar como terminado
        </Button>
      </div>
      {error && <Alert tone="danger">{isApiError(error, "INVALID_STATE_TRANSITION") ? "El trabajo cambió mientras lo mirabas. Recargá la página." : isApiError(error, "INVALID_DATE") ? "Elegí una fecha y hora futura." : errorMessage(error)}</Alert>}
      <ConfirmDialog
        open={confirm === "start"}
        onClose={() => setConfirm(null)}
        title="¿Empezás el trabajo?"
        description={`Le avisamos a ${name}. Tu estado pasa a “Trabajando”.`}
        confirmLabel="Empezar"
        tone="primary"
        pending={start.isPending}
        onConfirm={() => start.mutate()}
      />
      <ConfirmDialog
        open={confirm === "complete"}
        onClose={() => setConfirm(null)}
        title="¿Terminaste el trabajo?"
        description={`Le avisamos a ${name} y le pedimos que deje su reseña.`}
        confirmLabel="Terminado"
        tone="primary"
        pending={complete.isPending}
        onConfirm={() => complete.mutate()}
      />
    </section>
  );
}

/** ISO → valor de <input type="datetime-local"> en la hora del navegador. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
