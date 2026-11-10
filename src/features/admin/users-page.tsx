"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronRight, Search, UserX } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Pagination } from "@/components/catalog/pagination";
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
  fullName,
  roleLabel,
  searchUsers,
  SEARCH_MIN,
  statusLabel,
  USERS_PAGE_SIZE,
  type AccountStatus,
  type AdminRole,
  type UsersQuery,
} from "./api";

const ROLES: { value: AdminRole | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "CUSTOMER", label: "Clientes" },
  { value: "PROFESSIONAL", label: "Profesionales" },
];

const STATUSES = Object.keys(statusLabel) as AccountStatus[];

/** Lee los filtros de la URL; lo que no es válido se ignora (la URL se puede escribir a mano). */
function readQuery(params: URLSearchParams): UsersQuery {
  const q = params.get("q")?.trim() ?? "";
  const role = params.get("rol");
  const status = params.get("estado");
  const page = Number(params.get("pagina"));
  return {
    ...(q.length >= SEARCH_MIN ? { q: q.slice(0, 100) } : {}),
    ...(role === "CUSTOMER" || role === "PROFESSIONAL" ? { role } : {}),
    ...(status && (STATUSES as string[]).includes(status) ? { status: status as AccountStatus } : {}),
    ...(Number.isInteger(page) && page > 1 ? { page } : {}),
  };
}

function toSearch(query: UsersQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.role) params.set("rol", query.role);
  if (query.status) params.set("estado", query.status);
  if (query.page && query.page > 1) params.set("pagina", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * Búsqueda de usuarios (E-043): por nombre, apellido o email, rol y estado de la cuenta. Los filtros
 * viven en la URL: volver desde la ficha deja la búsqueda como estaba. Las cuentas de admin y las
 * anonimizadas no aparecen (lo decide el backend).
 */
export function AdminUsersPage() {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = readQuery(params);
  const [text, setText] = useState(query.q ?? "");
  const [tooShort, setTooShort] = useState(false);

  const users = useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => searchUsers(query),
    // Al cambiar de página o filtro, la lista anterior queda (atenuada) hasta que llega la nueva.
    placeholderData: keepPreviousData,
  });

  const go = (next: UsersQuery) => router.replace(`${pathname}${toSearch(next)}` as Route, { scroll: false });
  const totalPages = users.data ? Math.max(1, Math.ceil(users.data.total / USERS_PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Usuarios" description="Clientes y profesionales. Abrí una ficha para ver todo y actuar sobre la cuenta." />

      <section aria-label="Filtros" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
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
            go({ ...query, q: value || undefined, page: undefined });
          }}
        >
          <Field
            id={`${id}-buscar`}
            label="Nombre, apellido o email"
            className="flex-1"
            error={tooShort ? `Escribí al menos ${SEARCH_MIN} letras.` : undefined}
          >
            {(a11y) => <Input {...a11y} type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={100} autoComplete="off" enterKeyHint="search" />}
          </Field>
          <Button type="submit" className="sm:mb-0">
            <Search className="size-4" aria-hidden="true" />
            Buscar
          </Button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span id={`${id}-rol`} className="text-sm font-medium text-ink">
              Rol
            </span>
            <div role="group" aria-labelledby={`${id}-rol`} className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => {
                const active = (query.role ?? "") === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => go({ ...query, role: role.value || undefined, page: undefined })}
                    className={cn("h-10 rounded-xl px-4 text-sm font-semibold transition-colors", active ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-50")}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Field id={`${id}-estado`} label="Estado de la cuenta" className="sm:w-60">
            {(a11y) => (
              <Listbox
                {...a11y}
                value={query.status ?? ""}
                onChange={(value) => go({ ...query, status: (value || undefined) as AccountStatus | undefined, page: undefined })}
                options={[{ value: "", label: "Todos" }, ...STATUSES.map((status) => ({ value: status, label: statusLabel[status].label }))]}
              />
            )}
          </Field>
        </div>
      </section>

      {users.isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
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
            {users.data.data.map((user) => {
              const status = statusLabel[user.status];
              return (
                <li key={user.id}>
                  <Link
                    href={`/panel/admin/usuarios/${user.id}` as Route}
                    className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-50/60 sm:px-5"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <span className="flex min-w-0 flex-col sm:flex-1">
                        <span className="truncate font-semibold text-ink">{fullName(user)}</span>
                        <span className="truncate text-sm text-muted-strong">{user.email}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
                        <Badge tone={user.role === "PROFESSIONAL" ? "electric" : "neutral"}>{roleLabel[user.role]}</Badge>
                        <Badge tone={status.tone}>{status.label}</Badge>
                        <span className="text-muted-strong sm:w-28 sm:text-right">desde {formatDate(user.createdAt)}</span>
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Pagination page={query.page ?? 1} total={totalPages} hrefFor={(page) => `${pathname}${toSearch({ ...query, page })}`} />
        </section>
      )}
    </div>
  );
}
