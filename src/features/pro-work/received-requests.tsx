"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Inbox, MessageCircle, Send, Undo2, XCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { counterpartName } from "@/features/chat/api";
import { CounterpartAvatar } from "@/features/chat/counterpart-avatar";
import { urgencyLabel } from "@/features/requests/labels";
import { QuoteSummary, ReasonDialog } from "@/features/requests/shared";
import { useCounterparts, useProfessionNames } from "@/features/requests/use-counterparts";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatListDate } from "@/lib/format";
import { declineTarget, getRequest, listReceived, QUOTE_DESCRIPTION_MAX, sendQuote, withdrawQuote, workKeys, type ServiceRequest } from "./api";

type Tone = "neutral" | "electric" | "amber" | "success" | "danger";

/** Estado de MI negociación dentro del pedido (visto por el profesional). */
const myStatus: Record<ServiceRequest["targets"][number]["status"], { label: string; tone: Tone }> = {
  PENDING: { label: "Nuevo: sin responder", tone: "amber" },
  IN_DISCUSSION: { label: "Conversando", tone: "electric" },
  QUOTED: { label: "Presupuesto enviado", tone: "electric" },
  SELECTED: { label: "¡Te eligieron!", tone: "success" },
  NOT_SELECTED: { label: "Eligió a otro", tone: "neutral" },
  DECLINED: { label: "No lo tomaste", tone: "neutral" },
  CANCELLED: { label: "Pedido cancelado", tone: "neutral" },
};

const urgencyTone = { CAN_WAIT: "neutral", IMPATIENT: "amber", URGENT: "danger" } as const;

/** Pedidos recibidos: lo nuevo primero (sin responder), después el resto por fecha. */
export function ReceivedRequestsPage() {
  const requests = useQuery({ queryKey: workKeys.received, queryFn: listReceived });
  const { byConversation } = useCounterparts();
  const professionNames = useProfessionNames();
  const [filter, setFilter] = useState<"open" | "all">("open");

  const list = (requests.data ?? [])
    .filter((r) => filter === "all" || (r.status === "OPEN" && ["PENDING", "IN_DISCUSSION", "QUOTED"].includes(r.targets[0]?.status ?? "")))
    .sort((a, b) => Number(b.targets[0]?.status === "PENDING") - Number(a.targets[0]?.status === "PENDING") || b.createdAt.localeCompare(a.createdAt));
  const fresh = (requests.data ?? []).filter((r) => r.targets[0]?.status === "PENDING" && r.status === "OPEN").length;

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Pedidos recibidos" description="Clientes que te pidieron presupuesto. Respondé rápido: es lo que más suma para que te elijan." />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Qué pedidos mostrar">
        {(["open", "all"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
              filter === value ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-50",
            )}
          >
            {value === "open" ? "Para responder" : "Todos"}
            {value === "open" && fresh > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-brand-900">{fresh}</span>}
          </button>
        ))}
      </div>

      {requests.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando pedidos">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : requests.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus pedidos">
          {errorMessage(requests.error)}
        </Alert>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === "open" ? "No tenés pedidos para responder" : "Todavía no te llegaron pedidos"}
          description="Cuando un cliente te pida presupuesto, te avisamos y aparece acá. Un perfil completo con fotos recibe más pedidos."
          action={
            <ButtonLink href="/panel/perfil" variant="secondary">
              Mejorar mi perfil
            </ButtonLink>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((request, index) => {
            const target = request.targets[0];
            const conversation = target ? byConversation.get(target.conversationId) : undefined;
            const status = target ? myStatus[target.status] : null;
            return (
              <li key={request.id} data-reveal style={revealDelay(index % 4, 60)}>
                <Link
                  href={`/panel/solicitudes/${request.id}` as Route}
                  className={cn(
                    "group flex items-start gap-4 rounded-2xl border bg-surface p-4 shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-raised sm:p-5",
                    target?.status === "PENDING" ? "border-amber-400/60" : "border-line hover:border-brand-200",
                  )}
                >
                  {conversation && <CounterpartAvatar conversation={conversation} />}
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{conversation ? counterpartName(conversation) : "Cliente"}</span>
                      {status && <Badge tone={status.tone}>{status.label}</Badge>}
                      <Badge tone={urgencyTone[request.urgency]}>{urgencyLabel[request.urgency]}</Badge>
                    </span>
                    <span className="text-sm font-medium text-brand-700">{professionNames.get(request.professionId) ?? "Pedido de presupuesto"}</span>
                    <span className="line-clamp-2 text-sm text-muted-strong">{request.description}</span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-muted sm:block">{formatListDate(request.createdAt)}</span>
                  <ChevronRight className="size-5 shrink-0 self-center text-muted transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Un pedido recibido: qué necesita, el chat, y mandar, cambiar o retirar el presupuesto, o no tomarlo. */
export function ReceivedRequestScreen() {
  const { id } = useParams<{ id: string }>();
  const request = useQuery({ queryKey: workKeys.request(id), queryFn: () => getRequest(id) });
  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/solicitudes" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Todos los pedidos
      </Link>
      {request.isPending ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : request.isError ? (
        <EmptyState
          headingLevel={1}
          icon={Inbox}
          title={isApiError(request.error, "REQUEST_NOT_FOUND", "VALIDATION_FAILED") ? "No encontramos ese pedido" : "No pudimos cargar el pedido"}
          description={errorMessage(request.error)}
        />
      ) : (
        <RequestDetail request={request.data} />
      )}
    </div>
  );
}

function RequestDetail({ request }: { request: ServiceRequest }) {
  const id = useId();
  const queryClient = useQueryClient();
  const { byConversation } = useCounterparts();
  const professionNames = useProfessionNames();
  const target = request.targets[0]!;
  const conversation = byConversation.get(target.conversationId);
  const name = conversation ? counterpartName(conversation) : "el cliente";
  const quote = target.currentQuote?.status === "SENT" ? target.currentQuote : null;
  const canAct = request.status === "OPEN" && ["PENDING", "IN_DISCUSSION", "QUOTED"].includes(target.status);
  const [amount, setAmount] = useState(quote ? String(Math.round(Number(quote.amount))) : "");
  const [description, setDescription] = useState(quote?.description ?? "");
  const [date, setDate] = useState(quote?.proposedDate?.slice(0, 10) ?? "");
  const [declining, setDeclining] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const status = myStatus[target.status];

  const update = (updated: ServiceRequest) => {
    queryClient.setQueryData(workKeys.request(request.id), updated);
    void queryClient.invalidateQueries({ queryKey: workKeys.received });
    void queryClient.invalidateQueries({ queryKey: ["chat"] });
  };
  const send = useMutation({
    mutationFn: () =>
      sendQuote(target.id, {
        amount: Math.round(Number(amount)),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(date ? { proposedDate: date } : {}),
      }),
    onSuccess: update,
  });
  const withdraw = useMutation({ mutationFn: () => withdrawQuote(quote!.id), onSuccess: (updated) => { update(updated); setWithdrawing(false); } });
  const decline = useMutation({ mutationFn: (reason: string) => declineTarget(target.id, reason), onSuccess: (updated) => { update(updated); setDeclining(false); } });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <header className="flex flex-wrap items-center gap-4 animate-fade-up">
        {conversation && <CounterpartAvatar conversation={conversation} size="lg" />}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold text-brand-900">Pedido de {name}</h1>
          <span className="flex flex-wrap gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            <Badge tone={urgencyTone[request.urgency]}>{urgencyLabel[request.urgency]}</Badge>
            <Badge tone="neutral">{professionNames.get(request.professionId) ?? "Oficio"}</Badge>
          </span>
        </div>
      </header>

      {target.status === "SELECTED" && request.contractId && (
        <Alert tone="success" title={`¡${name} te eligió!`}>
          <Link href={`/panel/trabajos/${request.contractId}` as Route} className="font-semibold underline underline-offset-4">
            Ir al trabajo para agendarlo
          </Link>
        </Alert>
      )}

      <SettingsSection title="Lo que necesita" description={`Pedido del ${formatListDate(request.createdAt)}.`}>
        <p className="text-lg leading-relaxed whitespace-pre-line text-ink">{request.description}</p>
        <ButtonLink href={`/panel/mensajes/${target.conversationId}` as Route} variant="secondary" className="self-start">
          <MessageCircle className="size-4" aria-hidden="true" />
          Conversar por el chat
        </ButtonLink>
      </SettingsSection>

      {quote && (
        <div className="flex flex-col gap-3">
          <QuoteSummary quote={quote} title="Tu presupuesto vigente" />
          {canAct && (
            <Button variant="ghost" className="self-start" onClick={() => setWithdrawing(true)}>
              <Undo2 className="size-4" aria-hidden="true" />
              Retirar el presupuesto
            </Button>
          )}
        </div>
      )}

      {canAct && (
        <SettingsSection
          id="presupuesto"
          title={quote ? "Mandar un presupuesto nuevo" : "Mandá tu presupuesto"}
          description={quote ? "Reemplaza al que mandaste. Le avisamos por el chat." : "Le llega por el chat y lo puede aceptar con un toque."}
        >
          <form
            noValidate
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (Number(amount) > 0) send.mutate();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${id}-monto`} label="Monto total" required hint="En pesos, sin puntos.">
                {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$" />}
              </Field>
              <Field id={`${id}-fecha`} label="Fecha que proponés (opcional)">
                {(a11y) => <Input {...a11y} type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />}
              </Field>
            </div>
            <Field id={`${id}-detalle`} label="Qué incluye (opcional)" hint={`Materiales, mano de obra, garantía… ${description.length}/${QUOTE_DESCRIPTION_MAX}`}>
              {(a11y) => <Textarea {...a11y} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={QUOTE_DESCRIPTION_MAX} rows={4} />}
            </Field>
            {send.isError && <Alert tone="danger">{errorMessage(send.error)}</Alert>}
            {send.isSuccess && (
              <p role="status" className="text-sm font-semibold text-success-800 animate-[pop-in_220ms_var(--ease-out-soft)]">
                Presupuesto enviado. Te avisamos cuando responda.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="accent" loading={send.isPending} disabled={!(Number(amount) > 0)}>
                <Send className="size-4" aria-hidden="true" />
                {quote ? "Mandar el nuevo" : "Mandar presupuesto"}
              </Button>
              <Button variant="ghost" className="text-danger-600 hover:bg-danger-50" onClick={() => setDeclining(true)}>
                <XCircle className="size-4" aria-hidden="true" />
                No puedo tomarlo
              </Button>
            </div>
          </form>
        </SettingsSection>
      )}

      <ConfirmDialog
        open={withdrawing}
        onClose={() => setWithdrawing(false)}
        title="¿Retirar el presupuesto?"
        description={`${name} ya no lo va a poder aceptar. Podés mandar otro cuando quieras.`}
        confirmLabel="Retirar"
        pending={withdraw.isPending}
        error={withdraw.isError ? errorMessage(withdraw.error) : null}
        onConfirm={() => withdraw.mutate()}
      />
      <ReasonDialog
        open={declining}
        onClose={() => setDeclining(false)}
        title="¿No podés tomar este pedido?"
        description={`Le avisamos a ${name} por el chat para que busque a otra persona.`}
        confirmLabel="No lo tomo"
        pending={decline.isPending}
        error={decline.isError ? errorMessage(decline.error) : null}
        onConfirm={(reason) => decline.mutate(reason)}
      />
    </>
  );
}
