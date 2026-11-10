"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Fingerprint, Gavel, GitMerge, MapPin, Pencil, Search, ShieldOff, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { PanelTitle } from "@/features/account/settings-section";
import { useLocalities, useProvinces } from "@/features/catalogs/queries";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, plural } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { ActionDialog, adminErrorMessage } from "./action-dialog";
import { FilterTabs, Notice, PageControls } from "./admin-ui";
import { adminKeys, fullName, roleLabel } from "./api";
import {
  appealStatusLabel,
  approveNeighborhood,
  decideAppeal,
  decideVerification,
  HIDE_MAX,
  listAppeals,
  listNeighborhoods,
  listVerifications,
  mergeNeighborhood,
  moderationKeys,
  NEIGHBORHOOD_NAME_MAX,
  neighborhoodStatusLabel,
  NOTE_MIN,
  PAGE_SIZE,
  renameNeighborhood,
  verificationStatusLabel,
  type AdminAppeal,
  type AppealStatus,
  type Neighborhood,
  type NeighborhoodStatus,
  type Verification,
  type VerificationStatus,
} from "./moderation-api";

/** Lista con sus estados de carga, error y vacío. */
function QueueList<T>({
  query,
  empty,
  children,
}: {
  query: { isPending: boolean; isError: boolean; error: unknown; isPlaceholderData: boolean; data?: { items: T[]; total: number } };
  empty: ReactNode;
  children: (items: T[], total: number) => ReactNode;
}) {
  if (query.isPending) return <Skeleton className="h-64 rounded-3xl" />;
  if (query.isError) return <Alert tone="danger">{errorMessage(query.error)}</Alert>;
  if (!query.data || query.data.items.length === 0) return <>{empty}</>;
  return <div className={cn("flex flex-col gap-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>{children(query.data.items, query.data.total)}</div>;
}

const card = "flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-card";

// ======================================================================================
// Apelaciones (E-003, E-004)

export function AppealsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AppealStatus | "">("OPEN");
  const [page, setPage] = useState(1);
  const [deciding, setDeciding] = useState<{ appeal: AdminAppeal; decision: "ACCEPTED" | "REJECTED" } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const appeals = useQuery({
    queryKey: moderationKeys.appeals(status, page),
    queryFn: () => listAppeals(status, page),
    placeholderData: keepPreviousData,
    select: (data) => ({ items: data.data, total: data.total }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Apelaciones" description="Pedidos para revisar un strike o una sanción, el más viejo primero." />
      <FilterTabs
        label="Estado"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "OPEN", label: "Abiertas" },
          { value: "ACCEPTED", label: "Aceptadas" },
          { value: "REJECTED", label: "Rechazadas" },
          { value: "", label: "Todas" },
        ]}
      />
      <Notice message={notice} />
      <QueueList query={appeals} empty={<EmptyState icon={Gavel} title="No hay apelaciones acá" description={status === "OPEN" ? "No hay apelaciones esperando una decisión." : "Probá con otro filtro."} />}>
        {(items, total) => (
          <>
            <p className="text-sm font-medium text-muted-strong" aria-live="polite">
              {plural(total, "apelación", "apelaciones")}
            </p>
            <ul className="flex flex-col gap-3">
              {items.map((appeal) => {
                const state = appealStatusLabel[appeal.status];
                return (
                  <li key={appeal.id} className={card}>
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={state.tone}>{state.label}</Badge>
                      <span className="text-sm text-muted-strong">
                        {appeal.strikeId ? "Apela un strike" : "Apela una sanción"} · {formatDateTime(appeal.createdAt)}
                      </span>
                    </span>
                    <Link href={`/panel/admin/usuarios/${appeal.user.id}` as Route} className="self-start font-semibold text-brand-700 hover:underline">
                      {fullName(appeal.user)} <span className="font-normal text-muted-strong">· {appeal.user.email}</span>
                    </Link>
                    <p className="whitespace-pre-line break-words text-ink">{appeal.body}</p>
                    {appeal.decisionNote && <p className="text-sm text-muted-strong">Decisión: {appeal.decisionNote}</p>}
                    {appeal.status === "OPEN" && (
                      <span className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => setDeciding({ appeal, decision: "ACCEPTED" })}>
                          <Check className="size-4" aria-hidden="true" />
                          Aceptar
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setDeciding({ appeal, decision: "REJECTED" })}>
                          <X className="size-4" aria-hidden="true" />
                          Rechazar
                        </Button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <PageControls page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </QueueList>
      {deciding && (
        <ActionDialog
          title={deciding.decision === "ACCEPTED" ? "Aceptar la apelación" : "Rechazar la apelación"}
          description={
            deciding.decision === "ACCEPTED"
              ? `Se anula ${deciding.appeal.strikeId ? "el strike" : "la sanción"} de ${fullName(deciding.appeal.user)}. Le avisamos con tu nota.`
              : `${deciding.appeal.strikeId ? "El strike" : "La sanción"} queda como está. Le avisamos con tu nota.`
          }
          confirmLabel={deciding.decision === "ACCEPTED" ? "Aceptar" : "Rechazar"}
          tone={deciding.decision === "ACCEPTED" ? "primary" : "danger"}
          reasonLabel="Nota para la persona"
          reasonHint="La ve quien apeló y queda en la auditoría."
          minReason={NOTE_MIN}
          run={(note) => decideAppeal(deciding.appeal.id, deciding.decision, note)}
          done={deciding.decision === "ACCEPTED" ? "Aceptaste la apelación." : "Rechazaste la apelación."}
          onClose={() => setDeciding(null)}
          onDone={(message) => {
            setDeciding(null);
            setNotice(message);
            void queryClient.invalidateQueries({ queryKey: moderationKeys.appealsAll });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
          }}
        />
      )}
    </div>
  );
}

// ======================================================================================
// Identidades y cambios de perfil (E-010, E-011)

type Decision = "APPROVE" | "REJECT" | "REVOKE";
const decisionText: Record<Decision, { title: string; confirm: string; done: string; tone: "primary" | "danger" }> = {
  APPROVE: { title: "Aprobar", confirm: "Aprobar", done: "Aprobaste la verificación.", tone: "primary" },
  REJECT: { title: "Rechazar", confirm: "Rechazar", done: "Rechazaste la verificación.", tone: "danger" },
  REVOKE: { title: "Revocar la identidad", confirm: "Revocar", done: "Revocaste la identidad: la cuenta vuelve a estar por verificar.", tone: "danger" },
};

export function VerificationsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<VerificationStatus | "">("REQUIRES_REVIEW");
  const [page, setPage] = useState(1);
  const [deciding, setDeciding] = useState<{ item: Verification; decision: Decision } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const list = useQuery({
    queryKey: moderationKeys.verifications(status, page),
    queryFn: () => listVerifications(status, page),
    placeholderData: keepPreviousData,
    select: (data) => ({ items: data.data, total: data.meta.total }),
  });

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Identidades" description="Verificaciones que necesitan tu decisión y cambios de foto o nombre de cuentas ya verificadas." />
      <FilterTabs
        label="Estado"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "REQUIRES_REVIEW", label: "Para revisar" },
          { value: "PENDING", label: "Con el proveedor" },
          { value: "APPROVED", label: "Aprobadas" },
          { value: "REJECTED", label: "Rechazadas" },
          { value: "", label: "Todas" },
        ]}
      />
      <Notice message={notice} />
      <QueueList query={list} empty={<EmptyState icon={Fingerprint} title="No hay verificaciones acá" description={status === "REQUIRES_REVIEW" ? "No hay nada esperando tu revisión." : "Probá con otro filtro."} />}>
        {(items, total) => (
          <>
            <p className="text-sm font-medium text-muted-strong" aria-live="polite">
              {plural(total, "verificación", "verificaciones")}
            </p>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <VerificationCard key={item.id ?? item.userId} item={item} onDecide={(decision) => setDeciding({ item, decision })} />
              ))}
            </ul>
            <PageControls page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </QueueList>
      {deciding && (
        <ActionDialog
          title={decisionText[deciding.decision].title}
          description={
            deciding.item.kind === "PROFILE_CHANGE"
              ? deciding.decision === "APPROVE"
                ? "Se publican la foto o el nombre nuevos. La identidad sigue aprobada."
                : "Se descartan la foto o el nombre nuevos y queda lo anterior. La identidad sigue aprobada."
              : deciding.decision === "REVOKE"
                ? "La cuenta vuelve a estar por verificar y se cierran sus sesiones."
                : undefined
          }
          confirmLabel={decisionText[deciding.decision].confirm}
          tone={decisionText[deciding.decision].tone}
          minReason={NOTE_MIN}
          maxReason={HIDE_MAX}
          run={(reason) => decideVerification(deciding.item.id!, deciding.decision, reason)}
          errorFor={(error) => (isApiError(error, "PROFILE_INCOMPLETE") ? "Para aprobarla, la persona tiene que completar su perfil (foto y datos)." : null)}
          done={decisionText[deciding.decision].done}
          onClose={() => setDeciding(null)}
          onDone={(message) => {
            setDeciding(null);
            setNotice(message);
            void queryClient.invalidateQueries({ queryKey: moderationKeys.verificationsAll });
            void queryClient.invalidateQueries({ queryKey: adminKeys.dashboard });
          }}
        />
      )}
    </div>
  );
}

function VerificationCard({ item, onDecide }: { item: Verification; onDecide: (decision: Decision) => void }) {
  const state = verificationStatusLabel[item.status];
  const subject = item.subject;
  const open = item.status === "PENDING" || item.status === "REQUIRES_REVIEW";
  const profileChange = item.kind === "PROFILE_CHANGE";
  return (
    <li className={card}>
      <span className="flex flex-wrap items-center gap-2">
        <Badge tone={state.tone}>{state.label}</Badge>
        <Badge>{profileChange ? "Cambio de foto o nombre" : "Identidad"}</Badge>
        <span className="text-sm text-muted-strong">
          {item.submittedAt ? `Enviada el ${formatDateTime(item.submittedAt)}` : "Sin enviar"}
          {item.attemptNumber > 1 && ` · intento ${item.attemptNumber}`}
        </span>
      </span>
      {subject && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex gap-3">
            <Photo url={subject.avatarUrl} label={profileChange && subject.pendingAvatarUrl ? "Foto actual" : "Foto"} />
            {subject.pendingAvatarUrl && <Photo url={subject.pendingAvatarUrl} label="Foto nueva" highlight />}
          </div>
          <dl className="grid flex-1 gap-1 text-sm">
            <div>
              <dt className="sr-only">Nombre</dt>
              <dd>
                <Link href={`/panel/admin/usuarios/${subject.id}` as Route} className="text-base font-semibold text-brand-700 hover:underline">
                  {subject.firstName} {subject.lastName}
                </Link>{" "}
                <span className="text-muted-strong">· {roleLabel[subject.role]}</span>
              </dd>
            </div>
            {(subject.pendingFirstName || subject.pendingLastName) && (
              <div className="flex flex-wrap gap-1">
                <dt className="text-muted-strong">Nombre nuevo:</dt>
                <dd className="font-semibold text-ink">
                  {subject.pendingFirstName ?? subject.firstName} {subject.pendingLastName ?? subject.lastName}
                </dd>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              <dt className="text-muted-strong">Contacto:</dt>
              <dd className="break-all text-ink">
                {subject.email} · {subject.phone}
              </dd>
            </div>
            {item.adminNote && (
              <div className="flex flex-wrap gap-1">
                <dt className="text-muted-strong">Nota:</dt>
                <dd className="text-ink">{item.adminNote}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {item.id && (open || (item.status === "APPROVED" && !profileChange)) && (
        <span className="flex flex-wrap gap-2">
          {open && (
            <>
              <Button size="sm" onClick={() => onDecide("APPROVE")}>
                <Check className="size-4" aria-hidden="true" />
                Aprobar
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onDecide("REJECT")}>
                <X className="size-4" aria-hidden="true" />
                Rechazar
              </Button>
            </>
          )}
          {item.status === "APPROVED" && !profileChange && (
            <Button size="sm" variant="danger" onClick={() => onDecide("REVOKE")}>
              <ShieldOff className="size-4" aria-hidden="true" />
              Revocar
            </Button>
          )}
        </span>
      )}
    </li>
  );
}

function Photo({ url, label, highlight = false }: { url: string | null; label: string; highlight?: boolean }) {
  const src = mediaUrl(url);
  return (
    <figure className="flex flex-col items-center gap-1">
      <span className={cn("grid size-20 place-items-center overflow-hidden rounded-2xl bg-canvas ring-2", highlight ? "ring-amber-400" : "ring-line")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- la foto pendiente es privada: la sirve la API con la sesión */}
        {src ? <img src={src} alt={label} className="size-full object-cover" /> : <span className="text-xs text-muted">Sin foto</span>}
      </span>
      <figcaption className="text-xs text-muted-strong">{label}</figcaption>
    </figure>
  );
}

// ======================================================================================
// Barrios (E-012 a E-015)

/** Nombres de las localidades (hoy, una provincia activa). */
function useLocalityNames() {
  const provinces = useProvinces();
  const localities = useLocalities(provinces.data?.[0]?.id ?? null);
  return new Map((localities.data ?? []).map((locality) => [locality.id, locality.name]));
}

type NeighborhoodDialog = { kind: "approve" | "rename" | "merge"; item: Neighborhood } | null;

export function NeighborhoodsPage() {
  const queryClient = useQueryClient();
  const id = useId();
  const localityNames = useLocalityNames();
  const [status, setStatus] = useState<NeighborhoodStatus>("PENDING");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<NeighborhoodDialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const query = { status, ...(search ? { search } : {}), page };
  const list = useQuery({
    queryKey: moderationKeys.neighborhoods(query),
    queryFn: () => listNeighborhoods(query),
    placeholderData: keepPreviousData,
    select: (data) => ({ items: data.data, total: data.total }),
  });
  const done = (message: string) => {
    setDialog(null);
    setNotice(message);
    void queryClient.invalidateQueries({ queryKey: moderationKeys.neighborhoodsAll });
  };

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Barrios" description="Los que escribieron clientes y profesionales y todavía no están en la lista. Aprobalos, corregí el nombre o fusionalos con uno que ya existe." />
      <section aria-label="Filtros" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:flex-row sm:items-end sm:justify-between sm:p-5">
        <FilterTabs
          label="Estado"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "PENDING", label: "Pendientes" },
            { value: "APPROVED", label: "Aprobados" },
            { value: "MERGED", label: "Fusionados" },
          ]}
        />
        <form
          role="search"
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(text.trim());
            setPage(1);
          }}
        >
          <Field id={`${id}-buscar`} label="Buscar por nombre">
            {(a11y) => <Input {...a11y} type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={NEIGHBORHOOD_NAME_MAX} />}
          </Field>
          <Button type="submit" variant="secondary">
            <Search className="size-4" aria-hidden="true" />
            <span className="sr-only">Buscar</span>
          </Button>
        </form>
      </section>
      <Notice message={notice} />
      <QueueList query={list} empty={<EmptyState icon={MapPin} title="No hay barrios acá" description={status === "PENDING" ? "No hay barrios nuevos para revisar." : "Probá con otro filtro o búsqueda."} />}>
        {(items, total) => (
          <>
            <p className="text-sm font-medium text-muted-strong" aria-live="polite">
              {plural(total, "barrio")}
            </p>
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              {items.map((item) => {
                const state = neighborhoodStatusLabel[item.status];
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{item.name}</span>
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </span>
                      <span className="text-sm text-muted-strong">
                        {localityNames.get(item.localityId) ?? "Localidad"} · {plural(item.usage.residents, "cliente")} · {plural(item.usage.serviceAreas, "zona", "zonas")} de trabajo · desde {formatDate(item.createdAt)}
                      </span>
                    </span>
                    {item.status !== "MERGED" && (
                      <span className="flex flex-wrap gap-1">
                        {item.status === "PENDING" && (
                          <Button size="sm" onClick={() => setDialog({ kind: "approve", item })}>
                            <Check className="size-4" aria-hidden="true" />
                            Aprobar
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: "rename", item })}>
                          <Pencil className="size-4" aria-hidden="true" />
                          Renombrar
                        </Button>
                        {item.status === "PENDING" && (
                          <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: "merge", item })}>
                            <GitMerge className="size-4" aria-hidden="true" />
                            Fusionar
                          </Button>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <PageControls page={page} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </QueueList>
      {dialog?.kind === "approve" && <ApproveDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.kind === "rename" && <RenameDialog item={dialog.item} onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.kind === "merge" && <MergeDialog item={dialog.item} localityName={localityNames.get(dialog.item.localityId)} onClose={() => setDialog(null)} onDone={done} />}
    </div>
  );
}

function ApproveDialog({ item, onClose, onDone }: { item: Neighborhood; onClose: () => void; onDone: (message: string) => void }) {
  const approve = useMutation({ mutationFn: () => approveNeighborhood(item.id), onSuccess: () => onDone(`Aprobaste «${item.name}».`) });
  return (
    <Dialog open onClose={onClose} title={`Aprobar «${item.name}»`} description="Desde ahora aparece en las sugerencias y en los filtros del catálogo. Si el nombre tiene un error, corregilo antes.">
      <div className="flex flex-col gap-4">
        {approve.isError && <Alert tone="danger">{adminErrorMessage(approve.error)}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => approve.mutate()} loading={approve.isPending}>
            Aprobar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function RenameDialog({ item, onClose, onDone }: { item: Neighborhood; onClose: () => void; onDone: (message: string) => void }) {
  const id = useId();
  const [name, setName] = useState(item.name);
  const [touched, setTouched] = useState(false);
  const rename = useMutation({ mutationFn: () => renameNeighborhood(item.id, name.trim()), onSuccess: (updated) => onDone(`Ahora se llama «${updated.name}».`) });
  const tooShort = touched && name.trim().length < 2 ? "Escribí el nombre (al menos 2 letras)." : undefined;
  return (
    <Dialog open onClose={onClose} title="Corregir el nombre" description="Se respetan las mayúsculas. Si el nombre ya existe en la localidad, lo que corresponde es fusionarlos.">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (name.trim().length >= 2) rename.mutate();
        }}
      >
        <Field id={`${id}-nombre`} label="Nombre" required error={tooShort}>
          {(a11y) => <Input {...a11y} value={name} onChange={(e) => setName(e.target.value)} maxLength={NEIGHBORHOOD_NAME_MAX} />}
        </Field>
        {rename.isError && (
          <Alert tone="danger">{isApiError(rename.error, "NEIGHBORHOOD_NAME_TAKEN") ? "Ya hay un barrio con ese nombre en la localidad: fusionalos." : adminErrorMessage(rename.error)}</Alert>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={rename.isPending}>
            Guardar el nombre
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function MergeDialog({ item, localityName, onClose, onDone }: { item: Neighborhood; localityName?: string; onClose: () => void; onDone: (message: string) => void }) {
  const id = useId();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Neighborhood | null>(null);
  const candidates = useQuery({
    queryKey: moderationKeys.neighborhoods({ status: "APPROVED", localityId: item.localityId, search, page: 1 }),
    queryFn: () => listNeighborhoods({ status: "APPROVED", localityId: item.localityId, ...(search ? { search } : {}), page: 1 }),
    placeholderData: keepPreviousData,
  });
  const merge = useMutation({ mutationFn: () => mergeNeighborhood(item.id, target!.id), onSuccess: () => onDone(`Fusionaste «${item.name}» en «${target!.name}».`) });
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Fusionar «${item.name}»`}
      description={`Elegí el barrio aprobado de ${localityName ?? "la misma localidad"} que corresponde. Sus clientes y zonas pasan a ese, y si alguien vuelve a escribir «${item.name}», cae en el correcto.`}
    >
      <div className="flex flex-col gap-4">
        <form
          role="search"
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(text.trim());
          }}
        >
          <Field id={`${id}-buscar`} label="Buscar el barrio correcto" className="flex-1">
            {(a11y) => <Input {...a11y} type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={NEIGHBORHOOD_NAME_MAX} />}
          </Field>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        {candidates.isPending ? (
          <Skeleton className="h-32" />
        ) : candidates.isError ? (
          <Alert tone="danger">{errorMessage(candidates.error)}</Alert>
        ) : candidates.data.data.filter((n) => n.id !== item.id).length === 0 ? (
          <p className="text-sm text-muted-strong">No hay barrios aprobados con ese nombre en la localidad.</p>
        ) : (
          <fieldset className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            <legend className="sr-only">Barrio de destino</legend>
            {candidates.data.data
              .filter((n) => n.id !== item.id)
              .map((option) => (
                <label key={option.id} className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3", target?.id === option.id ? "bg-brand-50" : "hover:bg-canvas")}>
                  <input type="radio" name={`${id}-destino`} checked={target?.id === option.id} onChange={() => setTarget(option)} className="size-4 accent-brand-700" />
                  <span className="flex-1 font-medium text-ink">{option.name}</span>
                  <span className="text-xs text-muted-strong">{plural(option.usage.residents + option.usage.serviceAreas, "uso", "usos")}</span>
                </label>
              ))}
          </fieldset>
        )}
        {merge.isError && <Alert tone="danger">{adminErrorMessage(merge.error)}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => merge.mutate()} loading={merge.isPending} disabled={!target}>
            Fusionar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
