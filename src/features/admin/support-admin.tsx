"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, LifeBuoy, Megaphone, Paperclip, Send, Sparkles, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form-controls";
import { plans } from "@/content/home";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { useProfessions } from "@/features/catalogs/queries";
import { categoryName, evidenceUrl } from "@/features/support/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, plural } from "@/lib/format";
import { FilterTabs, Notice, PageControls } from "./admin-ui";
import { adminKeys } from "./api";
import {
  ANNOUNCEMENT_BODY_MAX,
  ANNOUNCEMENT_MIN,
  ANNOUNCEMENT_TITLE_MAX,
  businessKeys,
  closeTicket,
  getTicket,
  listAnnouncements,
  listPlatformReviews,
  listTickets,
  PAGE_SIZE,
  publishAnnouncement,
  REPLY_MAX,
  replyTicket,
  setReviewPublished,
  ticketStatusLabel,
  type AnnouncementInput,
  type TicketStatus,
} from "./business-api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ======================================================================================
// Soporte (E-039 a E-042)

export function TicketsPage() {
  const [status, setStatus] = useState<TicketStatus | "">("OPEN");
  const [page, setPage] = useState(1);
  const tickets = useQuery({ queryKey: businessKeys.tickets(status, page), queryFn: () => listTickets(status, page), placeholderData: keepPreviousData });
  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Soporte" description="Consultas de los usuarios y del formulario de contacto, la que espera hace más primero." />
      <FilterTabs
        label="Estado"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "OPEN", label: "Abiertas" },
          { value: "ANSWERED", label: "Respondidas" },
          { value: "CLOSED", label: "Cerradas" },
          { value: "", label: "Todas" },
        ]}
      />
      {tickets.isPending ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : tickets.isError ? (
        <Alert tone="danger">{errorMessage(tickets.error)}</Alert>
      ) : tickets.data.data.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No hay consultas acá" description={status === "OPEN" ? "No hay consultas esperando respuesta." : "Probá con otro filtro."} />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", tickets.isPlaceholderData && "opacity-60")}>
          <p className="text-sm font-medium text-muted-strong" aria-live="polite">
            {plural(tickets.data.total, "consulta")}
          </p>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            {tickets.data.data.map((ticket) => {
              const state = ticketStatusLabel[ticket.status];
              const last = ticket.messages.at(-1);
              return (
                <li key={ticket.id}>
                  <Link href={`/panel/admin/soporte/${ticket.id}` as Route} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/60 sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{categoryName(ticket.category)}</span>
                        <Badge tone={state.tone}>{state.label}</Badge>
                        {!ticket.userId && <Badge>Formulario de contacto</Badge>}
                      </span>
                      <span className="truncate text-sm text-muted-strong">
                        {ticket.name ?? ticket.email} · {formatDate(ticket.updatedAt)}
                        {last && ` · ${last.fromStaff ? "Vos: " : ""}${last.body}`}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <PageControls page={page} total={tickets.data.total} pageSize={PAGE_SIZE} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

export function TicketScreen() {
  const { id } = useParams<{ id: string }>();
  const valid = UUID.test(id);
  const queryClient = useQueryClient();
  const formId = useId();
  const ticket = useQuery({ queryKey: businessKeys.ticket(id), queryFn: () => getTicket(id), enabled: valid, retry: (count, error) => !isApiError(error) && count < 2 });
  const [body, setBody] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const after = (message: string) => {
    setNotice(message);
    void queryClient.invalidateQueries({ queryKey: businessKeys.ticketsAll });
    void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
  };
  const reply = useMutation({
    mutationFn: () => replyTicket(id, body.trim()),
    onSuccess: (updated) => {
      queryClient.setQueryData(businessKeys.ticket(id), updated);
      setBody("");
      after("Respondiste la consulta.");
    },
  });
  const close = useMutation({
    mutationFn: () => closeTicket(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(businessKeys.ticket(id), updated);
      setConfirmClose(false);
      after("Cerraste la consulta.");
    },
  });

  if (!valid || (ticket.isError && isApiError(ticket.error) && ticket.error.status === 404)) {
    return <EmptyState icon={LifeBuoy} headingLevel={1} title="No encontramos esa consulta" action={<ButtonLink href="/panel/admin/soporte">Volver a soporte</ButtonLink>} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/admin/soporte" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Soporte
      </Link>
      {ticket.isPending ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : ticket.isError ? (
        <Alert tone="danger">{errorMessage(ticket.error)}</Alert>
      ) : (
        <>
          <header className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
            <span className="flex flex-wrap items-center gap-2">
              <Badge tone={ticketStatusLabel[ticket.data.status].tone}>{ticketStatusLabel[ticket.data.status].label}</Badge>
              {!ticket.data.userId && <Badge>Formulario de contacto</Badge>}
            </span>
            <h1 className="text-3xl font-bold text-brand-900">{categoryName(ticket.data.category)}</h1>
            <p className="text-sm text-muted-strong">
              {ticket.data.userId ? (
                <Link href={`/panel/admin/usuarios/${ticket.data.userId}` as Route} className="font-semibold text-brand-700 hover:underline">
                  {ticket.data.name ?? ticket.data.email}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{ticket.data.name ?? "Sin nombre"}</span>
              )}{" "}
              · {ticket.data.email} · desde el {formatDateTime(ticket.data.createdAt)}
            </p>
          </header>
          <Notice message={notice} />
          <ol aria-label="Mensajes" className="flex flex-col gap-3">
            {ticket.data.messages.map((message) => (
              <li key={message.id} className={cn("flex max-w-[85%] flex-col gap-1 rounded-2xl p-4", message.fromStaff ? "self-end bg-brand-700 text-white" : "self-start border border-line bg-surface")}>
                <span className={cn("text-xs", message.fromStaff ? "text-brand-100" : "text-muted-strong")}>
                  {message.fromStaff ? "Repara Ya" : (ticket.data.name ?? "La persona")} · {formatDateTime(message.createdAt)}
                </span>
                <span className="whitespace-pre-line break-words">{message.body}</span>
                {message.fileId && (
                  <a href={evidenceUrl(message.fileId)} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1 text-sm font-semibold underline", message.fromStaff ? "text-white" : "text-brand-700")}>
                    <Paperclip className="size-4" aria-hidden="true" />
                    Ver la captura
                  </a>
                )}
              </li>
            ))}
          </ol>
          {ticket.data.status !== "CLOSED" ? (
            <SettingsSection title="Responder" description={ticket.data.userId ? "Le llega en su panel y por email." : "Escribió desde el formulario público: la respuesta le llega solo por email."}>
              {!ticket.data.userId && (
                <Alert tone="warning">Mientras no esté conectado el proveedor de email, esta respuesta queda guardada pero no le llega a la persona.</Alert>
              )}
              <form
                noValidate
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (body.trim()) reply.mutate();
                }}
              >
                <Field id={`${formId}-respuesta`} label="Tu respuesta" hint={`${body.length}/${REPLY_MAX}`}>
                  {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={REPLY_MAX} rows={4} />}
                </Field>
                {reply.isError && <Alert tone="danger">{errorMessage(reply.error)}</Alert>}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" onClick={() => setConfirmClose(true)}>
                    Cerrar la consulta
                  </Button>
                  <Button type="submit" loading={reply.isPending} disabled={!body.trim()}>
                    <Send className="size-4" aria-hidden="true" />
                    Responder
                  </Button>
                </div>
              </form>
            </SettingsSection>
          ) : (
            <Alert tone="info">La consulta está cerrada.</Alert>
          )}
          <ConfirmDialog
            open={confirmClose}
            onClose={() => setConfirmClose(false)}
            title="Cerrar la consulta"
            description="Queda como resuelta. Si la persona vuelve a escribir, se abre otra vez."
            confirmLabel="Cerrar la consulta"
            tone="primary"
            pending={close.isPending}
            error={close.isError ? errorMessage(close.error) : null}
            onConfirm={() => close.mutate()}
          />
        </>
      )}
    </div>
  );
}

// ======================================================================================
// Opiniones de la plataforma (E-017 a E-019)

export function PlatformReviewsPage() {
  const queryClient = useQueryClient();
  const [published, setPublished] = useState<"" | "true" | "false">("false");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const reviews = useQuery({ queryKey: businessKeys.platformReviews(published, page), queryFn: () => listPlatformReviews(published, page), placeholderData: keepPreviousData });
  const toggle = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) => setReviewPublished(id, publish),
    onSuccess: (_, { publish }) => {
      setNotice(publish ? "La opinión ya se ve en el inicio." : "La opinión dejó de verse en el inicio.");
      void queryClient.invalidateQueries({ queryKey: businessKeys.platformReviewsAll });
    },
  });
  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Opiniones" description="Lo que los usuarios opinan de Repara Ya. Las que publicás se ven en el inicio." />
      <FilterTabs
        label="Estado"
        value={published}
        onChange={(value) => {
          setPublished(value);
          setPage(1);
        }}
        options={[
          { value: "false", label: "Sin publicar" },
          { value: "true", label: "Publicadas" },
          { value: "", label: "Todas" },
        ]}
      />
      <Notice message={notice} />
      {toggle.isError && <Alert tone="danger">{errorMessage(toggle.error)}</Alert>}
      {reviews.isPending ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : reviews.isError ? (
        <Alert tone="danger">{errorMessage(reviews.error)}</Alert>
      ) : reviews.data.data.length === 0 ? (
        <EmptyState icon={Sparkles} title="No hay opiniones acá" description="Probá con otro filtro." />
      ) : (
        <div className={cn("flex flex-col gap-4 transition-opacity", reviews.isPlaceholderData && "opacity-60")}>
          <ul className="grid gap-3 md:grid-cols-2">
            {reviews.data.data.map((review) => (
              <li key={review.id} className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-5 shadow-card">
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-0.5 text-amber-600" aria-label={`${review.rating} de 5 estrellas`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn("size-4", i < review.rating ? "fill-current" : "opacity-30")} aria-hidden="true" />
                    ))}
                  </span>
                  {review.published && <Badge tone="success">Publicada</Badge>}
                </span>
                <p className="whitespace-pre-line break-words text-ink">{review.comment ?? "Sin comentario."}</p>
                <p className="text-sm text-muted-strong">
                  {review.author.displayName} · {formatDate(review.createdAt)}
                </p>
                <Button
                  size="sm"
                  variant={review.published ? "secondary" : "primary"}
                  className="self-start"
                  loading={toggle.isPending && toggle.variables?.id === review.id}
                  onClick={() => toggle.mutate({ id: review.id, publish: !review.published })}
                >
                  {review.published ? "Dejar de mostrar" : "Publicar en el inicio"}
                </Button>
              </li>
            ))}
          </ul>
          <PageControls page={page} total={reviews.data.total} pageSize={PAGE_SIZE} onPage={setPage} />
        </div>
      )}
    </div>
  );
}

// ======================================================================================
// Novedades (E-001, E-002)

const ROLES = [
  { value: "CUSTOMER", label: "Clientes" },
  { value: "PROFESSIONAL", label: "Profesionales" },
] as const;

export function AnnouncementsPage() {
  const id = useId();
  const queryClient = useQueryClient();
  const professions = useProfessions();
  const list = useQuery({ queryKey: businessKeys.announcements, queryFn: listAnnouncements });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [roles, setRoles] = useState<("CUSTOMER" | "PROFESSIONAL")[]>([]);
  const [professionIds, setProfessionIds] = useState<string[]>([]);
  const [planCodes, setPlanCodes] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  const segment: AnnouncementInput["segment"] = {
    ...(roles.length ? { roles } : {}),
    ...(professionIds.length ? { professionIds } : {}),
    ...(planCodes.length ? { planCodes } : {}),
  };
  const proFilters = professionIds.length > 0 || planCodes.length > 0;
  const audience = [
    roles.length === 1 ? ROLES.find((r) => r.value === roles[0])!.label.toLowerCase() : proFilters ? null : "todas las cuentas activas",
    professionIds.length ? `profesionales de ${professionIds.map((pid) => professions.data?.find((p) => p.id === pid)?.name ?? "").join(", ")}` : null,
    planCodes.length ? `con plan ${planCodes.map((code) => plans.find((p) => p.code === code)?.name ?? code).join(" o ")}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const publish = useMutation({
    mutationFn: () => publishAnnouncement({ title: title.trim(), body: body.trim(), ...(Object.keys(segment).length ? { segment } : {}) }),
    onSuccess: (created) => {
      setConfirm(false);
      setTitle("");
      setBody("");
      setRoles([]);
      setProfessionIds([]);
      setPlanCodes([]);
      setTouched(false);
      setNotice(`Publicaste la novedad: le llegó a ${plural(created.recipients, "persona")}.`);
      void queryClient.invalidateQueries({ queryKey: businessKeys.announcements });
    },
  });
  const titleError = touched && title.trim().length < ANNOUNCEMENT_MIN ? "Escribí un título." : undefined;
  const bodyError = touched && body.trim().length < ANNOUNCEMENT_MIN ? "Escribí el mensaje." : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Novedades" description="Avisos a todos o a un grupo: llegan como notificación (y al celular, a quien activó los avisos)." />
      <Notice message={notice} />
      <SettingsSection title="Nueva novedad">
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
            if (title.trim().length >= ANNOUNCEMENT_MIN && body.trim().length >= ANNOUNCEMENT_MIN) setConfirm(true);
          }}
        >
          <Field id={`${id}-titulo`} label="Título" required error={titleError} hint={`${title.length}/${ANNOUNCEMENT_TITLE_MAX}`}>
            {(a11y) => <Input {...a11y} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={ANNOUNCEMENT_TITLE_MAX} />}
          </Field>
          <Field id={`${id}-cuerpo`} label="Mensaje" required error={bodyError} hint={`${body.length}/${ANNOUNCEMENT_BODY_MAX}`}>
            {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={ANNOUNCEMENT_BODY_MAX} rows={5} />}
          </Field>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium text-ink">A quiénes (sin marcar nada: a todos)</legend>
            <div className="flex flex-wrap gap-x-6">
              {ROLES.map((role) => (
                <Checkbox key={role.value} label={role.label} checked={roles.includes(role.value)} onChange={() => setRoles(toggle(roles, role.value))} />
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium text-ink">Solo profesionales de estos oficios (opcional)</legend>
            <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {professions.data?.map((profession) => (
                <Checkbox key={profession.id} label={profession.name} checked={professionIds.includes(profession.id)} onChange={() => setProfessionIds(toggle(professionIds, profession.id))} />
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium text-ink">Solo profesionales con estos planes vigentes (opcional)</legend>
            <div className="flex flex-wrap gap-x-6">
              {plans.map((plan) => (
                <Checkbox key={plan.code} label={plan.name} checked={planCodes.includes(plan.code)} onChange={() => setPlanCodes(toggle(planCodes, plan.code))} />
              ))}
            </div>
          </fieldset>
          <Button type="submit" className="self-start">
            <Megaphone className="size-4" aria-hidden="true" />
            Publicar
          </Button>
        </form>
      </SettingsSection>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Publicar la novedad?"
        description={`Le llega ahora a ${audience || "todas las cuentas activas"}. No se puede deshacer.`}
        confirmLabel="Publicar"
        tone="primary"
        pending={publish.isPending}
        error={publish.isError ? errorMessage(publish.error) : null}
        onConfirm={() => publish.mutate()}
      />
      <SettingsSection title="Publicadas" description="Las últimas 100, la más nueva primero.">
        {list.isPending ? (
          <Skeleton className="h-32" />
        ) : list.isError ? (
          <Alert tone="danger">{errorMessage(list.error)}</Alert>
        ) : list.data.length === 0 ? (
          <p className="text-sm text-muted-strong">Todavía no publicaste novedades.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {list.data.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 py-3">
                <span className="font-semibold text-ink">{item.title}</span>
                <span className="line-clamp-2 text-sm text-muted-strong">{item.body}</span>
                <span className="text-xs text-muted-strong">
                  {item.publishedAt ? formatDateTime(item.publishedAt) : "Sin publicar"} · le llegó a {plural(item.recipients, "persona")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
    </div>
  );
}
