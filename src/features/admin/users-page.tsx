"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Clock, Flag, Globe, MapPin, Phone, Search, ShieldAlert, SlidersHorizontal, UserX, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { GoogleMark } from "@/components/forms/google-button";
import { Pagination } from "@/components/catalog/pagination";
import { ForumAvatar } from "@/components/forum/forum-author";
import { Button } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { PanelTitle } from "@/features/account/settings-section";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, plural } from "@/lib/format";
import {
  adminKeys,
  flagLabel,
  fullName,
  joinedLabel,
  loginLabel,
  pageStateLabel,
  planFilterLabel,
  roleLabel,
  searchUsers,
  SEARCH_MIN,
  sortLabel,
  statusLabel,
  USERS_PAGE_SIZE,
  verificationLabel,
  type AccountStatus,
  type AdminUserItem,
  type Joined,
  type LoginFilter,
  type ModerationFlag,
  type PageState,
  type PlanFilter,
  type UsersQuery,
  type UsersSort,
  type VerificationStatus,
} from "./api";

const ROLES: { value: "" | "CUSTOMER" | "PROFESSIONAL"; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "CUSTOMER", label: "Clientes" },
  { value: "PROFESSIONAL", label: "Profesionales" },
];

const keys = <T extends string>(record: Record<T, unknown>) => Object.keys(record) as T[];
const STATUSES = keys(statusLabel);
const VERIFICATIONS = keys(verificationLabel);
const JOINED = keys(joinedLabel);
const FLAGS = keys(flagLabel);
const PLANS = keys(planFilterLabel);
const PAGE_STATES = keys(pageStateLabel);
const LOGINS = keys(loginLabel);
const SORTS = keys(sortLabel);

/** Valor de la URL si está entre los permitidos (la URL se puede escribir a mano). */
function pick<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

/** Lee los filtros de la URL; lo que no es válido se ignora. Nombres en castellano en la URL. */
function readQuery(params: URLSearchParams): UsersQuery {
  const q = params.get("q")?.trim() ?? "";
  const page = Number(params.get("pagina"));
  const flags = (params.get("moderacion") ?? "").split(",").flatMap((f) => pick(f, FLAGS) ?? []);
  const sort = pick(params.get("orden"), SORTS);
  return {
    ...(q.length >= SEARCH_MIN ? { q: q.slice(0, 100) } : {}),
    role: pick(params.get("rol"), ["CUSTOMER", "PROFESSIONAL"] as const),
    status: pick(params.get("estado"), STATUSES),
    verification: pick(params.get("identidad"), VERIFICATIONS),
    joined: pick(params.get("alta"), JOINED),
    ...(flags.length ? { flags: [...new Set(flags)] } : {}),
    plan: pick(params.get("plan"), PLANS),
    pageState: pick(params.get("pagina-publica"), PAGE_STATES),
    login: pick(params.get("ingreso"), LOGINS),
    ...(sort && sort !== "recent" ? { sort } : {}),
    ...(Number.isInteger(page) && page > 1 ? { page } : {}),
  };
}

function toSearch(query: UsersQuery): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string | undefined) => value && params.set(key, value);
  set("q", query.q);
  set("rol", query.role);
  set("estado", query.status);
  set("identidad", query.verification);
  set("alta", query.joined);
  set("moderacion", query.flags?.join(","));
  set("plan", query.plan);
  set("pagina-publica", query.pageState);
  set("ingreso", query.login);
  if (query.sort && query.sort !== "recent") params.set("orden", query.sort);
  if (query.page && query.page > 1) params.set("pagina", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Cantidad de filtros avanzados elegidos (para el botón que los muestra). */
const advancedCount = (q: UsersQuery) => [q.status, q.verification, q.plan, q.pageState, q.login].filter(Boolean).length;
const anyFilter = (q: UsersQuery) => !!(q.q || q.role || q.joined || q.flags?.length || advancedCount(q));

/**
 * Usuarios (E-043, ampliado por pedido del fundador del 2026-11-11): todas las cuentas de clientes y
 * profesionales, completas o no, con foto y datos, las más nuevas primero. Filtros combinables por
 * rol, alta reciente, moderación, estado, identidad, plan, página publicada y forma de ingreso. Viven
 * en la URL: volver desde la ficha deja la búsqueda como estaba.
 */
export function AdminUsersPage() {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = readQuery(params);
  const [text, setText] = useState(query.q ?? "");
  const [tooShort, setTooShort] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(advancedCount(query) > 0);

  const users = useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => searchUsers(query),
    // Al cambiar de página o filtro, la lista anterior queda (atenuada) hasta que llega la nueva.
    placeholderData: keepPreviousData,
  });

  /*
   * Cada cambio parte del último pedido, no de la URL del último render: si alguien busca y toca un
   * filtro enseguida, el router todavía no actualizó la URL y se perdería la búsqueda. `latest` se
   * actualiza en el mismo clic y vuelve a la URL cuando esta cambia (atrás, adelante, enlaces).
   */
  const search = params.toString();
  const latest = useRef<UsersQuery>(query);
  useEffect(() => {
    latest.current = readQuery(new URLSearchParams(search));
  }, [search]);
  const go = (change: (current: UsersQuery) => UsersQuery) => {
    latest.current = { ...change(latest.current), page: undefined };
    router.replace(`${pathname}${toSearch(latest.current)}` as Route, { scroll: false });
  };
  const toggleFlag = (flag: ModerationFlag) =>
    go((current) => {
      const flags = current.flags ?? [];
      const next = flags.includes(flag) ? flags.filter((f) => f !== flag) : [...flags, flag];
      return { ...current, flags: next.length ? next : undefined };
    });
  const totalPages = users.data ? Math.max(1, Math.ceil(users.data.total / USERS_PAGE_SIZE)) : 1;
  const advanced = advancedCount(query);

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Usuarios" description="Todas las cuentas de clientes y profesionales, completas o no. Las más nuevas aparecen primero." />

      <section aria-label="Filtros" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <form
          role="search"
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            const value = text.trim();
            if (value.length > 0 && value.length < SEARCH_MIN) {
              setTooShort(true);
              return;
            }
            setTooShort(false);
            go((current) => ({ ...current, q: value || undefined }));
          }}
        >
          <Field
            id={`${id}-buscar`}
            label="Nombre, apellido, nombre comercial o email"
            className="flex-1"
            error={tooShort ? `Escribí al menos ${SEARCH_MIN} letras.` : undefined}
          >
            {(a11y) => <Input {...a11y} type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={100} autoComplete="off" enterKeyHint="search" />}
          </Field>
          <Button type="submit">
            <Search className="size-4" aria-hidden="true" />
            Buscar
          </Button>
        </form>

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-8">
          <Segmented
            label="Rol"
            options={ROLES}
            value={query.role ?? ""}
            onChange={(value) => go((current) => ({ ...current, role: value || undefined }))}
          />
          <Segmented
            label="Recién agregados"
            options={[{ value: "", label: "Siempre" }, ...JOINED.map((value) => ({ value, label: joinedLabel[value] }))]}
            value={query.joined ?? ""}
            onChange={(value) => go((current) => ({ ...current, joined: (value || undefined) as Joined | undefined }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span id={`${id}-moderacion`} className="text-sm font-medium text-ink">
            Moderación
          </span>
          <div role="group" aria-labelledby={`${id}-moderacion`} className="flex flex-wrap gap-2">
            {FLAGS.map((flag) => {
              const active = query.flags?.includes(flag) ?? false;
              return (
                <button
                  key={flag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFlag(flag)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 transition-colors",
                    active ? "bg-danger-600 text-white ring-danger-600" : "bg-surface text-ink ring-line hover:bg-danger-50 hover:ring-danger-200",
                  )}
                >
                  {flag === "sanctioned" ? <ShieldAlert className="size-4" aria-hidden="true" /> : flag === "strikes" ? <AlertTriangle className="size-4" aria-hidden="true" /> : <Flag className="size-4" aria-hidden="true" />}
                  {flagLabel[flag]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            aria-expanded={showAdvanced}
            aria-controls={`${id}-avanzados`}
            onClick={() => setShowAdvanced((open) => !open)}
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-800 hover:bg-brand-50"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {showAdvanced ? "Ocultar más filtros" : "Más filtros"}
            {advanced > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-xs text-white">{advanced}</span>}
          </button>
          <div className="flex items-center gap-3">
            <Field id={`${id}-orden`} label="Orden" className="w-56" labelClassName="sr-only">
              {(a11y) => (
                <Listbox
                  {...a11y}
                  value={query.sort ?? "recent"}
                  onChange={(value) => go((current) => ({ ...current, sort: value as UsersSort }))}
                  options={SORTS.map((value) => ({ value, label: sortLabel[value] }))}
                />
              )}
            </Field>
            {anyFilter(query) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setText("");
                  go((current) => ({ sort: current.sort }));
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {showAdvanced && (
          <div id={`${id}-avanzados`} className="grid gap-4 animate-fade-up sm:grid-cols-2 lg:grid-cols-3">
            <Select
              id={`${id}-estado`}
              label="Estado de la cuenta"
              value={query.status}
              options={STATUSES.map((value) => ({ value, label: statusLabel[value].label }))}
              onChange={(value) => go((current) => ({ ...current, status: value as AccountStatus | undefined }))}
            />
            <Select
              id={`${id}-identidad`}
              label="Identidad"
              value={query.verification}
              options={VERIFICATIONS.filter((v) => v !== "REQUIRES_REVIEW").map((value) => ({ value, label: verificationLabel[value] }))}
              onChange={(value) => go((current) => ({ ...current, verification: value as VerificationStatus | undefined }))}
            />
            <Select
              id={`${id}-ingreso`}
              label="Cómo ingresa"
              value={query.login}
              options={LOGINS.map((value) => ({ value, label: loginLabel[value] }))}
              onChange={(value) => go((current) => ({ ...current, login: value as LoginFilter | undefined }))}
            />
            <Select
              id={`${id}-plan`}
              label="Plan (profesionales)"
              value={query.plan}
              options={PLANS.map((value) => ({ value, label: planFilterLabel[value] }))}
              onChange={(value) => go((current) => ({ ...current, plan: value as PlanFilter | undefined }))}
            />
            <Select
              id={`${id}-pagina`}
              label="Página pública (profesionales)"
              value={query.pageState}
              options={PAGE_STATES.map((value) => ({ value, label: pageStateLabel[value] }))}
              onChange={(value) => go((current) => ({ ...current, pageState: value as PageState | undefined }))}
            />
          </div>
        )}
      </section>

      {users.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando usuarios">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : users.isError ? (
        <Alert tone="danger" title="No pudimos buscar">
          {errorMessage(users.error)}
        </Alert>
      ) : users.data.data.length === 0 ? (
        <EmptyState icon={UserX} title="No encontramos usuarios" description="Probá con otra búsqueda o sacá algún filtro." />
      ) : (
        <section aria-labelledby={`${id}-resultados`} className={cn("flex flex-col gap-4 transition-opacity", users.isPlaceholderData && "opacity-60")}>
          <h2 id={`${id}-resultados`} className="text-sm font-medium text-muted-strong" aria-live="polite">
            {plural(users.data.total, "usuario")}
          </h2>
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            {users.data.data.map((user) => (
              <li key={user.id}>
                <UserRow user={user} />
              </li>
            ))}
          </ul>
          <Pagination page={query.page ?? 1} total={totalPages} hrefFor={(page) => `${pathname}${toSearch({ ...query, page })}`} />
        </section>
      )}
    </div>
  );
}

/** Nueva en las últimas 24 horas. */
const isNew = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;

function UserRow({ user }: { user: AdminUserItem }) {
  const status = statusLabel[user.status];
  const name = fullName(user);
  const pro = user.professional;
  const flagged = user.activeSanctions > 0 || user.activeStrikeWeight > 0 || user.openReportsAgainst > 0;
  return (
    <Link href={`/panel/admin/usuarios/${user.id}` as Route} className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-brand-50/60 sm:items-center sm:gap-4 sm:px-5">
      <span className="relative">
        <ForumAvatar name={name} avatarUrl={user.avatarUrl} size="lg" />
        {isNew(user.createdAt) && (
          <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[0.625rem] font-bold text-brand-950 ring-2 ring-surface">Nueva</span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
        <span className="flex min-w-0 flex-col gap-0.5 lg:flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-ink">{name}</span>
            {user.google && <GoogleMark className="size-4 shrink-0" label="Ingresa con Google" />}
          </span>
          {pro?.businessName && <span className="truncate text-sm font-medium text-brand-800">{pro.businessName}</span>}
          <span className="truncate text-sm text-muted-strong">{user.email}</span>
          <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3.5" aria-hidden="true" />
                {user.phone}
              </span>
            )}
            {user.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {user.location}
              </span>
            )}
            {pro && pro.professions.length > 0 && <span>{pro.professions.join(" · ")}</span>}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-1.5 text-sm lg:max-w-88 lg:justify-end">
          <Badge tone={user.role === "PROFESSIONAL" ? "electric" : "neutral"}>{roleLabel[user.role]}</Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
          {user.verificationStatus !== "APPROVED" && <Badge tone="amber">Identidad: {verificationLabel[user.verificationStatus as VerificationStatus] ?? user.verificationStatus}</Badge>}
          {pro && (
            <Badge tone={pro.published ? "success" : "neutral"}>
              <Globe className="size-3.5" aria-hidden="true" />
              {pro.published ? "Publicada" : "Sin publicar"}
            </Badge>
          )}
          {pro && <Badge tone="neutral">{pro.planCode ? (pro.subscriptionStatus === "TRIAL" ? "Prueba" : pro.planCode) : "Sin plan"}</Badge>}
          {flagged && (
            <Badge tone="danger">
              <ShieldAlert className="size-3.5" aria-hidden="true" />
              {[
                user.activeSanctions > 0 && plural(user.activeSanctions, "sanción", "sanciones"),
                user.activeStrikeWeight > 0 && `${user.activeStrikeWeight} strike${user.activeStrikeWeight === 1 ? "" : "s"}`,
                user.openReportsAgainst > 0 && plural(user.openReportsAgainst, "reporte abierto", "reportes abiertos"),
              ]
                .filter(Boolean)
                .join(" · ")}
            </Badge>
          )}
        </span>
        <span className="flex flex-col text-xs text-muted-strong lg:w-52 lg:shrink-0 lg:items-end lg:text-right">
          <span>Alta {formatDate(user.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {user.lastLoginAt ? `Entró ${formatDate(user.lastLoginAt)}` : "Nunca entró"}
          </span>
        </span>
      </span>
      <ChevronRight className="mt-3 size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 sm:mt-0" aria-hidden="true" />
    </Link>
  );
}

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-sm font-medium text-ink">
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="inline-flex flex-wrap gap-1 self-start rounded-2xl bg-canvas p-1 ring-1 ring-line">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value || "todos"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-9 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition-[background-color,color,box-shadow]",
                active ? "bg-surface text-brand-900 shadow-card ring-1 ring-line" : "text-muted-strong hover:text-brand-800",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string | undefined; options: { value: string; label: string }[]; onChange: (value: string | undefined) => void }) {
  return (
    <Field id={id} label={label}>
      {(a11y) => <Listbox {...a11y} value={value ?? ""} onChange={(next) => onChange(next || undefined)} options={[{ value: "", label: "Todos" }, ...options]} />}
    </Field>
  );
}
