"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, LifeBuoy, Paperclip, Plus, Send } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { MediaPicker } from "@/components/ui/media-picker";
import { PanelTitle } from "@/features/account/settings-section";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDateTime, formatListDate } from "@/lib/format";
import {
  addTicketMessage,
  categoryName,
  createTicket,
  evidenceUrl,
  getTicket,
  listTickets,
  MESSAGE_MAX,
  supportKeys,
  TICKET_MAX,
  TICKET_MIN,
  ticketCategories,
  ticketStatus,
  type Ticket,
  type TicketCategory,
} from "./api";

/** Consultas de soporte: nueva consulta arriba y la lista (la más reciente primero). */
export function SupportPage() {
  const tickets = useQuery({ queryKey: supportKeys.all, queryFn: listTickets });
  const [composing, setComposing] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelTitle title="Soporte" description="Escribinos lo que necesites: te respondemos por acá y te avisamos." />
        {!composing && (
          <Button variant="accent" onClick={() => setComposing(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Nueva consulta
          </Button>
        )}
      </div>

      {composing && <NewTicket onClose={() => setComposing(false)} />}

      {tickets.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando consultas">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : tickets.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus consultas">
          {errorMessage(tickets.error)}
        </Alert>
      ) : tickets.data.length === 0 ? (
        !composing && <EmptyState icon={LifeBuoy} title="No tenés consultas" description="Si algo no funciona o tenés una duda, escribinos." />
      ) : (
        <ul className="flex flex-col gap-3">
          {tickets.data.map((ticket, index) => {
            const status = ticketStatus[ticket.status];
            const last = ticket.messages.at(-1);
            return (
              <li key={ticket.id} data-reveal style={revealDelay(index % 4, 60)}>
                <Link
                  href={`/panel/soporte/${ticket.id}` as Route}
                  className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised sm:p-5"
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", ticket.status === "ANSWERED" ? "bg-success-600 text-white" : "bg-brand-50 text-brand-700")}>
                    <LifeBuoy className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{categoryName(ticket.category)}</span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </span>
                    {last && <span className="truncate text-sm text-muted-strong">{last.fromStaff ? "Repara Ya: " : "Vos: "}{last.body}</span>}
                  </span>
                  <span className="hidden text-sm text-muted sm:block">{formatListDate(ticket.updatedAt)}</span>
                  <ChevronRight className="size-5 shrink-0 text-muted transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NewTicket({ onClose }: { onClose: () => void }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<{ fileIds: string[]; busy: boolean }>({ fileIds: [], busy: false });
  const [touched, setTouched] = useState(false);
  const create = useMutation({
    mutationFn: () => createTicket(category as TicketCategory, body.trim(), photo.fileIds[0]),
    meta: { success: { title: "Recibimos tu consulta", description: "Te respondemos acá y te avisamos con una notificación." } },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supportKeys.all });
      onClose();
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-raised animate-[pop-in_220ms_var(--ease-out-soft)] sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (!category || body.trim().length < TICKET_MIN || photo.busy) return;
        create.mutate();
      }}
    >
      <h2 className="text-lg font-semibold text-brand-900">Nueva consulta</h2>
      <Field id={`${id}-motivo`} label="Motivo" required error={touched && !category ? "Elegí el motivo." : undefined}>
        {(a11y) => (
          <Listbox {...a11y} value={category} onChange={(value) => setCategory(value as TicketCategory)} placeholder="Elegí el motivo" options={ticketCategories} />
        )}
      </Field>
      <Field
        id={`${id}-texto`}
        label="Contanos"
        required
        error={touched && body.trim().length < TICKET_MIN ? `Escribí al menos ${TICKET_MIN} caracteres.` : undefined}
        hint={`${body.length}/${TICKET_MAX}`}
      >
        {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={TICKET_MAX} rows={5} />}
      </Field>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">Captura (opcional)</span>
        <MediaPicker purpose="EVIDENCE" maxImages={1} onChange={setPhoto} label="Agregar captura" />
      </div>
      {create.isError && <Alert tone="danger">{errorMessage(create.error)}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={create.isPending} disabled={photo.busy}>
          Enviar consulta
        </Button>
      </div>
    </form>
  );
}

/** Una consulta: la conversación con el equipo y la respuesta (reabre la consulta si estaba cerrada). */
export function TicketScreen() {
  const { id } = useParams<{ id: string }>();
  const ticket = useQuery({ queryKey: supportKeys.detail(id), queryFn: () => getTicket(id) });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/soporte" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Todas las consultas
      </Link>
      {ticket.isPending ? (
        <Skeleton className="h-80 w-full rounded-3xl" />
      ) : ticket.isError ? (
        <EmptyState
          headingLevel={1}
          icon={LifeBuoy}
          title={isApiError(ticket.error, "TICKET_NOT_FOUND", "VALIDATION_FAILED") ? "No encontramos esa consulta" : "No pudimos cargar la consulta"}
          description={errorMessage(ticket.error)}
        />
      ) : (
        <TicketThread ticket={ticket.data} />
      )}
    </div>
  );
}

function TicketThread({ ticket }: { ticket: Ticket }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<{ fileIds: string[]; busy: boolean }>({ fileIds: [], busy: false });
  const [pickerKey, setPickerKey] = useState(0);
  const status = ticketStatus[ticket.status];
  const reply = useMutation({
    mutationFn: () => addTicketMessage(ticket.id, body.trim(), photo.fileIds[0]),
    meta: { success: "Enviamos tu mensaje" },
    onSuccess: (updated) => {
      queryClient.setQueryData(supportKeys.detail(ticket.id), updated);
      void queryClient.invalidateQueries({ queryKey: supportKeys.all, exact: true });
      setBody("");
      setPickerKey((k) => k + 1);
    },
  });

  return (
    <>
      <header className="flex flex-col gap-2 animate-fade-up">
        <h1 className="text-3xl font-bold text-brand-900">{categoryName(ticket.category)}</h1>
        <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Badge tone={status.tone}>{status.label}</Badge>
          Abierta el {formatDateTime(ticket.createdAt)}
        </span>
      </header>

      <ol className="flex flex-col gap-3 rounded-3xl border border-line bg-canvas/60 p-4 sm:p-6" aria-label="Conversación">
        {ticket.messages.map((message) => (
          <li key={message.id} className={cn("flex flex-col gap-1 animate-fade-up", message.fromStaff ? "items-start" : "items-end")}>
            <span className="px-1 text-xs font-semibold text-muted">{message.fromStaff ? "Equipo de Repara Ya" : "Vos"}</span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed sm:max-w-[75%]",
                message.fromStaff ? "rounded-bl-md border border-line bg-surface text-ink" : "rounded-br-md bg-brand-700 text-white",
              )}
            >
              <p className="whitespace-pre-line [overflow-wrap:anywhere]">{message.body}</p>
              {/* Solo las fotos propias: el archivo privado lo puede abrir quien lo subió. */}
              {message.fileId && !message.fromStaff && (
                <a
                  href={evidenceUrl(message.fileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline underline-offset-4"
                >
                  <Paperclip className="size-3.5" aria-hidden="true" />
                  Ver la captura
                </a>
              )}
            </div>
            <time dateTime={message.createdAt} className="px-1 text-[0.6875rem] text-muted">
              {formatListDate(message.createdAt)}
            </time>
          </li>
        ))}
      </ol>

      <form
        className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim() && !photo.busy) reply.mutate();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{ticket.status === "CLOSED" ? "Escribí para reabrir la consulta" : "Tu respuesta"}</span>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={MESSAGE_MAX} rows={3} />
        </label>
        <MediaPicker key={pickerKey} purpose="EVIDENCE" maxImages={1} onChange={setPhoto} label="Captura" />
        {reply.isError && <Alert tone="danger">{errorMessage(reply.error)}</Alert>}
        <div className="flex justify-end">
          <Button type="submit" loading={reply.isPending} disabled={!body.trim() || photo.busy}>
            <Send className="size-4" aria-hidden="true" />
            Enviar
          </Button>
        </div>
      </form>
    </>
  );
}
