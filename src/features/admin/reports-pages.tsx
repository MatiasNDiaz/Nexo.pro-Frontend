"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, EyeOff, Flag, Gavel, MessagesSquare, RotateCcw, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { reasonLabel } from "@/features/reports/api";
import { evidenceUrl } from "@/features/support/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, plural } from "@/lib/format";
import { ActionDialog } from "./action-dialog";
import { FilterTabs, Notice, PageControls } from "./admin-ui";
import { adminKeys, fullName } from "./api";
import {
  getReport,
  getReportConversation,
  HIDE_MAX,
  hideableTarget,
  hideContent,
  listReports,
  moderationKeys,
  NOTE_MIN,
  PAGE_SIZE,
  reportStatusLabel,
  reportTargetLabel,
  resolveReport,
  restoreContent,
  startReview,
  type Report,
  type ReportStatus,
  type ReportTarget,
  type ReportTargetSnapshot,
} from "./moderation-api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ["SUBMITTED", "UNDER_REVIEW", "VALID", "REJECTED", ""] as const;
const TARGETS = Object.keys(reportTargetLabel) as ReportTarget[];

/**
 * Cola de reportes (E-025): los más viejos primero. El filtro vive en la URL para que "volver" desde
 * un reporte deje la lista como estaba. Por defecto, los nuevos.
 */
export function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initialStatus = params.get("estado");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>((STATUSES as readonly string[]).includes(initialStatus ?? "x") ? (initialStatus as ReportStatus) : "SUBMITTED");
  const [target, setTarget] = useState<ReportTarget | "">((TARGETS as string[]).includes(params.get("tipo") ?? "") ? (params.get("tipo") as ReportTarget) : "");
  const [page, setPage] = useState(1);

  const sync = (next: { status: string; target: string }) => {
    const search = new URLSearchParams();
    if (next.status !== "SUBMITTED") search.set("estado", next.status || "todos");
    if (next.target) search.set("tipo", next.target);
    const text = search.toString();
    router.replace(`${pathname}${text ? `?${text}` : ""}` as Route, { scroll: false });
  };

  const query = { ...(status ? { status } : {}), ...(target ? { targetType: target } : {}), page };
  const reports = useQuery({ queryKey: moderationKeys.reports(query), queryFn: () => listReports(query), placeholderData: keepPreviousData });

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Reportes" description="Lo que reportaron los usuarios, el más viejo primero. Revisá el contenido y resolvé." />
      <section aria-label="Filtros" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <FilterTabs
          label="Estado"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
            sync({ status: value, target });
          }}
          options={[
            { value: "SUBMITTED", label: "Nuevos" },
            { value: "UNDER_REVIEW", label: "En revisión" },
            { value: "VALID", label: "Válidos" },
            { value: "REJECTED", label: "Rechazados" },
            { value: "", label: "Todos" },
          ]}
        />
        <Field id="reportes-tipo" label="Qué se reportó" className="sm:w-60">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={target}
              onChange={(value) => {
                setTarget(value as ReportTarget | "");
                setPage(1);
                sync({ status, target: value });
              }}
              options={[{ value: "", label: "Todo" }, ...TARGETS.map((value) => ({ value, label: reportTargetLabel[value] }))]}
            />
          )}
        </Field>
      </section>

      {reports.isPending ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : reports.isError ? (
        <Alert tone="danger" title="No pudimos cargar los reportes">
          {errorMessage(reports.error)}
        </Alert>
      ) : reports.data.data.length === 0 ? (
        <EmptyState icon={Flag} title="No hay reportes acá" description={status === "SUBMITTED" ? "No hay reportes nuevos para revisar." : "Probá con otro filtro."} />
      ) : (
        <section aria-labelledby="reportes-total" className={cn("flex flex-col gap-4 transition-opacity", reports.isPlaceholderData && "opacity-60")}>
          <h2 id="reportes-total" className="text-sm font-medium text-muted-strong" aria-live="polite">
            {plural(reports.data.total, "reporte")}
          </h2>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            {reports.data.data.map((report) => {
              const state = reportStatusLabel[report.status];
              return (
                <li key={report.id}>
                  <Link href={`/panel/admin/reportes/${report.id}` as Route} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/60 sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{reasonLabel[report.reason]}</span>
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </span>
                      <span className="text-sm text-muted-strong">
                        {reportTargetLabel[report.targetType]} de {fullName(report.reportedUser)} · reportó {fullName(report.reporter)} · {formatDate(report.createdAt)}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <PageControls page={page} total={reports.data.total} pageSize={PAGE_SIZE} onPage={setPage} />
        </section>
      )}
    </div>
  );
}

type ReportDialog = "resolve" | "hide" | "restore" | null;

/** Un reporte (E-026): qué se reportó, el contenido como estaba, la evidencia y las acciones. */
export function ReportDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const valid = UUID.test(id);
  const queryClient = useQueryClient();
  const report = useQuery({ queryKey: moderationKeys.report(id), queryFn: () => getReport(id), enabled: valid, retry: (count, error) => !isApiError(error) && count < 2 });
  const [dialog, setDialog] = useState<ReportDialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const refresh = (message: string) => {
    setDialog(null);
    setNotice(message);
    void queryClient.invalidateQueries({ queryKey: moderationKeys.report(id) });
    void queryClient.invalidateQueries({ queryKey: moderationKeys.reportsAll });
    void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
  };
  const review = useMutation({ mutationFn: () => startReview(id), onSuccess: () => refresh("El reporte quedó en revisión.") });

  if (!valid || (report.isError && isApiError(report.error) && report.error.status === 404)) {
    return <EmptyState icon={Flag} headingLevel={1} title="No encontramos ese reporte" action={<ButtonLink href="/panel/admin/reportes">Volver a reportes</ButtonLink>} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/panel/admin/reportes" className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Reportes
      </Link>
      {report.isPending ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : report.isError ? (
        <Alert tone="danger" title="No pudimos cargar el reporte">
          {errorMessage(report.error)}
        </Alert>
      ) : (
        <ReportView
          report={report.data}
          notice={notice}
          onDialog={(next) => {
            setNotice(null);
            setDialog(next);
          }}
          review={review}
          showChat={showChat}
          onShowChat={() => setShowChat(true)}
        />
      )}
      {report.data && dialog && <ReportActionDialog report={report.data} dialog={dialog} onClose={() => setDialog(null)} onDone={refresh} />}
    </div>
  );
}

function ReportView({
  report,
  notice,
  onDialog,
  review,
  showChat,
  onShowChat,
}: {
  report: Report;
  notice: string | null;
  onDialog: (dialog: ReportDialog) => void;
  review: { mutate: () => void; isPending: boolean; isError: boolean; error: unknown };
  showChat: boolean;
  onShowChat: () => void;
}) {
  const state = reportStatusLabel[report.status];
  const open = report.status === "SUBMITTED" || report.status === "UNDER_REVIEW";
  const snapshot = report.target as unknown as ReportTargetSnapshot | null;
  const hideable = hideableTarget[report.targetType];
  const contentStatus = snapshot && "status" in snapshot ? snapshot.status : null;
  const deleted = !!snapshot && "deleted" in snapshot && snapshot.deleted;

  return (
    <>
      <header className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={state.tone}>{state.label}</Badge>
          <Badge>{reportTargetLabel[report.targetType]}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-brand-900">{reasonLabel[report.reason]}</h1>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-strong">Reportado</dt>
            <dd>
              <Link href={`/panel/admin/usuarios/${report.reportedUser.id}` as Route} className="font-semibold text-brand-700 hover:underline">
                {fullName(report.reportedUser)}
              </Link>
              <span className="text-muted-strong"> · {report.reportedUser.email}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-strong">Reportó (el reportado no lo sabe)</dt>
            <dd>
              <Link href={`/panel/admin/usuarios/${report.reporter.id}` as Route} className="font-semibold text-brand-700 hover:underline">
                {fullName(report.reporter)}
              </Link>
              <span className="text-muted-strong"> · {formatDateTime(report.createdAt)}</span>
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-strong">Qué pasó, según quien reportó</p>
          <p className="whitespace-pre-line break-words text-ink">{report.description}</p>
        </div>
        {report.resolvedAt && (
          <Alert tone={report.status === "VALID" ? "warning" : "info"} title={`Resuelto el ${formatDateTime(report.resolvedAt)}`}>
            {report.resolutionNote}
          </Alert>
        )}
      </header>

      <Notice message={notice} />
      {review.isError && <Alert tone="danger">{errorMessage(review.error)}</Alert>}

      <SettingsSection title="Acciones" description="La resolución avisa a quien reportó; si es válido, también al reportado (sin decirle quién fue).">
        <div className="flex flex-wrap gap-2">
          {report.status === "SUBMITTED" && (
            <Button variant="secondary" onClick={review.mutate} loading={review.isPending}>
              Empezar a revisar
            </Button>
          )}
          {open && <Button onClick={() => onDialog("resolve")}>Resolver</Button>}
          <ButtonLink href={`/panel/admin/usuarios/${report.reportedUser.id}?reporte=${report.id}` as Route} variant="secondary">
            <Gavel className="size-4" aria-hidden="true" />
            Strike o sanción a {report.reportedUser.firstName}
          </ButtonLink>
          {hideable && !deleted && contentStatus === "VISIBLE" && (
            <Button variant="danger" onClick={() => onDialog("hide")}>
              <EyeOff className="size-4" aria-hidden="true" />
              Ocultar el contenido
            </Button>
          )}
          {hideable && !deleted && contentStatus === "HIDDEN_BY_ADMIN" && (
            <Button variant="secondary" onClick={() => onDialog("restore")}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Volver a mostrar
            </Button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Lo reportado" description="Como estaba al abrir esta página.">
        <TargetView report={report} snapshot={snapshot} />
        {report.targetType === "MESSAGE" &&
          (showChat ? (
            <ConversationView report={report} />
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-canvas p-4">
              <p className="text-sm text-muted-strong">Podés ver la conversación completa, con las versiones originales de los mensajes editados. Queda registrado que la abriste.</p>
              <Button variant="secondary" size="sm" onClick={onShowChat}>
                <MessagesSquare className="size-4" aria-hidden="true" />
                Ver la conversación
              </Button>
            </div>
          ))}
      </SettingsSection>

      {report.evidenceFileIds.length > 0 && (
        <SettingsSection title="Capturas" description="Las subió quien reportó. Son privadas: solo las ven esa persona y el equipo.">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {report.evidenceFileIds.map((fileId, index) => (
              <li key={fileId}>
                <a href={evidenceUrl(fileId)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element -- privada, servida por la API con la sesión */}
                  <img src={evidenceUrl(fileId)} alt={`Captura ${index + 1}`} className="aspect-square w-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        </SettingsSection>
      )}
    </>
  );
}

function TargetView({ report, snapshot }: { report: Report; snapshot: ReportTargetSnapshot | null }) {
  if (!snapshot) return <Alert tone="info">El contenido ya no existe.</Alert>;
  const status = "status" in snapshot ? snapshot.status : null;
  const deleted = "deleted" in snapshot && snapshot.deleted;
  const flags = (
    <span className="flex flex-wrap gap-2">
      {status === "HIDDEN_BY_ADMIN" && <Badge tone="danger">Oculto por el equipo</Badge>}
      {deleted && <Badge>Borrado por su autor</Badge>}
    </span>
  );
  if (report.targetType === "PROFILE") {
    return (
      <p className="text-ink">
        Se reportó el perfil de{" "}
        <Link href={`/panel/admin/usuarios/${report.reportedUser.id}` as Route} className="font-semibold text-brand-700 hover:underline">
          {fullName(report.reportedUser)}
        </Link>
        .
      </p>
    );
  }
  if (report.targetType === "REVIEW" && "rating" in snapshot) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-canvas p-4">
        {flags}
        <span className="flex items-center gap-1 text-amber-700" aria-label={`${snapshot.rating} de 5 estrellas`}>
          {Array.from({ length: snapshot.rating }, (_, i) => (
            <Star key={i} className="size-4 fill-current" aria-hidden="true" />
          ))}
        </span>
        <p className="whitespace-pre-line break-words text-ink">{snapshot.comment ?? "Sin comentario."}</p>
      </div>
    );
  }
  if ("body" in snapshot) {
    const original = "originalBody" in snapshot ? snapshot.originalBody : null;
    const postId = report.targetType === "FORUM_POST" ? report.targetId : "postId" in snapshot ? snapshot.postId : undefined;
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-canvas p-4">
        {flags}
        <p className="whitespace-pre-line break-words text-ink">{snapshot.body}</p>
        {original && original !== snapshot.body && (
          <p className="text-sm text-muted-strong">
            <span className="font-semibold">Versión original (antes de editarlo):</span> {original}
          </p>
        )}
        {postId && (
          <Link href={`/foro/${postId}` as Route} target="_blank" className="self-start text-sm font-semibold text-brand-700 hover:underline">
            Ver en el foro
          </Link>
        )}
      </div>
    );
  }
  return null;
}

/** La conversación del mensaje reportado (C-32), con las versiones originales. Cada apertura se audita. */
function ConversationView({ report }: { report: Report }) {
  const chat = useQuery({ queryKey: moderationKeys.conversation(report.id), queryFn: () => getReportConversation(report.id), staleTime: Infinity, retry: false });
  if (chat.isPending) return <Skeleton className="h-48 rounded-2xl" />;
  if (chat.isError) return <Alert tone="danger">{errorMessage(chat.error)}</Alert>;
  const nameOf = (senderId: string | null) =>
    senderId === report.reporter.id ? fullName(report.reporter) : senderId === report.reportedUser.id ? fullName(report.reportedUser) : "Repara Ya (automático)";
  return (
    <ol aria-label="Conversación" className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto rounded-2xl bg-canvas p-3">
      {chat.data.messages.map((message) => (
        <li
          key={message.id}
          className={cn("flex flex-col gap-1 rounded-xl border p-3 text-sm", message.reported ? "border-danger-600/40 bg-danger-50" : "border-line bg-surface")}
        >
          <span className="flex flex-wrap items-center gap-2 text-xs text-muted-strong">
            <span className="font-semibold text-ink">{nameOf(message.senderId)}</span>
            {formatDateTime(message.createdAt)}
            {message.reported && <Badge tone="danger">Reportado</Badge>}
            {message.edited && <Badge>Editado</Badge>}
            {message.deleted && <Badge>Borrado</Badge>}
          </span>
          <span className="whitespace-pre-line break-words text-ink">{message.body}</span>
          {message.originalBody && message.originalBody !== message.body && <span className="text-xs text-muted-strong">Original: {message.originalBody}</span>}
        </li>
      ))}
    </ol>
  );
}

function ReportActionDialog({ report, dialog, onClose, onDone }: { report: Report; dialog: Exclude<ReportDialog, null>; onClose: () => void; onDone: (message: string) => void }) {
  const id = useId();
  const [valid, setValid] = useState<boolean | null>(null);
  const kind = hideableTarget[report.targetType]!;
  if (dialog === "resolve") {
    return (
      <ActionDialog
        title="Resolver el reporte"
        description="Válido: lo marcás como cierto (las consecuencias, strike o sanción, las aplicás aparte). Rechazado: no tiene consecuencias para nadie."
        confirmLabel="Resolver"
        reasonLabel="Nota de la resolución"
        reasonHint="Interna: queda en el reporte y en la auditoría."
        minReason={NOTE_MIN}
        validate={() => (valid === null ? "Elegí si el reporte es válido o no." : null)}
        run={(note) => resolveReport(report.id, valid!, note)}
        done={valid ? "Marcaste el reporte como válido." : "Rechazaste el reporte."}
        onClose={onClose}
        onDone={onDone}
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-ink">Decisión</legend>
          {[
            { value: true, label: "Válido", detail: "Lo que reportaron pasó y va contra las normas." },
            { value: false, label: "Rechazado", detail: "No corresponde: se cierra sin consecuencias." },
          ].map((option) => (
            <label key={option.label} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3", valid === option.value ? "border-brand-700 bg-brand-50" : "border-line hover:border-brand-200")}>
              <input type="radio" name={`${id}-decision`} checked={valid === option.value} onChange={() => setValid(option.value)} className="mt-1 size-4 accent-brand-700" />
              <span className="flex flex-col">
                <span className="font-semibold text-ink">{option.label}</span>
                <span className="text-sm text-muted-strong">{option.detail}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </ActionDialog>
    );
  }
  const hide = dialog === "hide";
  return (
    <ActionDialog
      tone={hide ? "danger" : "primary"}
      title={hide ? "Ocultar el contenido" : "Volver a mostrar el contenido"}
      description={hide ? "Deja de verse en el sitio. Su autor ve que lo ocultó el equipo y el motivo." : "Vuelve a verse en el sitio."}
      confirmLabel={hide ? "Ocultar" : "Volver a mostrar"}
      minReason={NOTE_MIN}
      maxReason={HIDE_MAX}
      run={(reason) => (hide ? hideContent(kind, report.targetId, reason) : restoreContent(kind, report.targetId, reason))}
      done={hide ? "Ocultaste el contenido." : "El contenido se ve otra vez."}
      onClose={onClose}
      onDone={onDone}
    />
  );
}
