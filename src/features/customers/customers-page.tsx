"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarDays, Hammer, MapPin, Search, UsersRound, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Pagination } from "@/components/catalog/pagination";
import { ForumAvatar } from "@/components/forum/forum-author";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Checkbox, Field, Input } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { PanelTitle } from "@/features/account/settings-section";
import { useLocalities, useProfessions, useProvinces } from "@/features/catalogs/queries";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { dayKey, formatListDate, formatMonthYear, plural } from "@/lib/format";
import { CUSTOMERS_PAGE_SIZE, customerKeys, listCustomers, SEARCH_MAX, SEARCH_MIN, type CustomerCard, type CustomerQuery } from "./api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lee los filtros de la URL (nombres en castellano); lo que no es válido se ignora. */
function readQuery(params: URLSearchParams): CustomerQuery {
  const q = params.get("q")?.trim() ?? "";
  const profession = params.get("oficio") ?? "";
  const locality = params.get("localidad") ?? "";
  const page = Number(params.get("pagina"));
  return {
    ...(q.length >= SEARCH_MIN ? { q: q.slice(0, SEARCH_MAX) } : {}),
    ...(UUID.test(profession) ? { professionId: profession } : {}),
    ...(UUID.test(locality) ? { localityId: locality } : {}),
    ...(params.get("pedidos") === "abiertos" ? { withOpenRequests: true } : {}),
    ...(Number.isInteger(page) && page > 1 ? { page } : {}),
  };
}

function toSearch(query: CustomerQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.professionId) params.set("oficio", query.professionId);
  if (query.localityId) params.set("localidad", query.localityId);
  if (query.withOpenRequests) params.set("pedidos", "abiertos");
  if (query.page && query.page > 1) params.set("pagina", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * Clientes (ADR 0037 del backend): todos los clientes activos, primero los que publicaron hace menos.
 * Cada tarjeta lleva a la ficha con sus consultas y pedidos del foro. Los filtros viven en la URL.
 */
export function CustomersPage() {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = readQuery(params);
  const [text, setText] = useState(query.q ?? "");
  const [tooShort, setTooShort] = useState(false);
  // La casilla responde al toque; cuando la URL cambia (atrás, Limpiar), se pone como dice la URL.
  const urlOpenOnly = !!query.withOpenRequests;
  const [openOnly, setOpenOnly] = useState(urlOpenOnly);
  const [seenOpenOnly, setSeenOpenOnly] = useState(urlOpenOnly);
  if (urlOpenOnly !== seenOpenOnly) {
    setSeenOpenOnly(urlOpenOnly);
    setOpenOnly(urlOpenOnly);
  }
  const professions = useProfessions();
  const provinces = useProvinces();
  const cordoba = provinces.data?.find((p) => p.name === "Córdoba")?.id ?? null;
  const localities = useLocalities(cordoba);

  const customers = useQuery({
    queryKey: customerKeys.list(query),
    queryFn: () => listCustomers(query),
    placeholderData: keepPreviousData,
  });

  // Cada cambio parte del último pedido (no de la URL del último render): ver users-page.tsx del admin.
  const search = params.toString();
  const latest = useRef<CustomerQuery>(query);
  useEffect(() => {
    latest.current = readQuery(new URLSearchParams(search));
  }, [search]);
  const go = (change: (current: CustomerQuery) => CustomerQuery) => {
    latest.current = { ...change(latest.current), page: undefined };
    router.replace(`${pathname}${toSearch(latest.current)}` as Route, { scroll: false });
  };
  const filtered = !!(query.q || query.professionId || query.localityId || query.withOpenRequests);
  const totalPages = customers.data ? Math.max(1, Math.ceil(customers.data.total / CUSTOMERS_PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Clientes" description="Todas las personas que buscan arreglos en Repara Ya. Tocá una para ver lo que preguntó y pidió en el foro." />

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
            go((current) => ({ ...current, q: value || undefined }));
          }}
        >
          <Field id={`${id}-buscar`} label="Nombre o apellido" className="flex-1" error={tooShort ? `Escribí al menos ${SEARCH_MIN} letras.` : undefined}>
            {(a11y) => <Input {...a11y} type="search" value={text} onChange={(e) => setText(e.target.value)} maxLength={SEARCH_MAX} autoComplete="off" enterKeyHint="search" />}
          </Field>
          <Button type="submit">
            <Search className="size-4" aria-hidden="true" />
            Buscar
          </Button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <Field id={`${id}-oficio`} label="Pidió un oficio">
            {(a11y) => (
              <Listbox
                {...a11y}
                value={query.professionId ?? ""}
                onChange={(value) => go((current) => ({ ...current, professionId: value || undefined }))}
                options={[{ value: "", label: "Cualquier oficio" }, ...(professions.data ?? []).map((p) => ({ value: p.id, label: p.name }))]}
              />
            )}
          </Field>
          <Field id={`${id}-localidad`} label="Publicó en">
            {(a11y) => (
              <Listbox
                {...a11y}
                value={query.localityId ?? ""}
                onChange={(value) => go((current) => ({ ...current, localityId: value || undefined }))}
                options={[{ value: "", label: "Cualquier localidad" }, ...(localities.data ?? []).map((l) => ({ value: l.id, label: l.name }))]}
              />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:h-12">
            <Checkbox
              label="Con pedidos abiertos"
              checked={openOnly}
              onChange={(event) => {
                const checked = event.target.checked;
                setOpenOnly(checked);
                go((current) => ({ ...current, withOpenRequests: checked || undefined }));
              }}
            />
            {filtered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setText("");
                  go(() => ({}));
                }}
              >
                <X className="size-4" aria-hidden="true" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </section>

      {customers.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-busy="true" aria-label="Cargando clientes">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : customers.isError ? (
        <Alert tone="danger" title="No pudimos cargar los clientes">
          {errorMessage(customers.error)}
        </Alert>
      ) : customers.data.data.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={filtered ? "No hay clientes con estos filtros" : "Todavía no hay clientes"}
          description={filtered ? "Probá con otro oficio, otra localidad o sacá algún filtro." : "Cuando se registren, los vas a ver acá."}
        />
      ) : (
        <section aria-labelledby={`${id}-resultados`} className={cn("flex flex-col gap-4 transition-opacity", customers.isPlaceholderData && "opacity-60")}>
          <h2 id={`${id}-resultados`} className="text-sm font-medium text-muted-strong" aria-live="polite">
            {plural(customers.data.total, "cliente")}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
            {customers.data.data.map((customer) => (
              <li key={customer.userId}>
                <CustomerTile customer={customer} />
              </li>
            ))}
          </ul>
          <Pagination page={query.page ?? 1} total={totalPages} hrefFor={(page) => `${pathname}${toSearch({ ...query, page })}`} />
        </section>
      )}
    </div>
  );
}

/** "hoy", "Ayer", "4 nov" o "4 nov 2025" (formatListDate da la hora si es de hoy). */
export const lastPostLabel = (iso: string) => (dayKey(iso) === dayKey(new Date()) ? "hoy" : formatListDate(iso).toLowerCase());

/** Tarjeta del cliente: quién es, qué pide y dónde. Toda la tarjeta lleva a su ficha. */
function CustomerTile({ customer }: { customer: CustomerCard }) {
  const name = `${customer.firstName} ${customer.lastName}`;
  const open = customer.openRequestCount;
  const extra = customer.professions.length - 3;
  return (
    <Link
      href={`/panel/clientes/${customer.userId}` as Route}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-2xl border bg-surface p-5 shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised",
        open > 0 ? "border-amber-400/70" : "border-line",
      )}
    >
      <span className="flex items-center gap-3">
        <ForumAvatar name={name} avatarUrl={customer.avatarUrl} size="lg" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-lg font-semibold text-ink group-hover:text-brand-800">{name}</span>
          <span className="flex items-center gap-1 text-xs text-muted-strong">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            En Repara Ya desde {formatMonthYear(customer.memberSince)}
          </span>
        </span>
      </span>

      <span className="flex flex-wrap gap-1.5 text-sm">
        {open > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 font-semibold text-brand-950">
            <Hammer className="size-3.5" aria-hidden="true" />
            {plural(open, "pedido abierto", "pedidos abiertos")}
          </span>
        )}
        <span className="inline-flex items-center rounded-full bg-canvas px-2.5 py-0.5 font-medium text-muted-strong ring-1 ring-line">
          {customer.postCount === 0 ? "Sin publicaciones" : plural(customer.postCount, "publicación", "publicaciones")}
        </span>
      </span>

      {customer.professions.length > 0 && (
        <span className="flex flex-wrap gap-1.5 text-xs">
          {customer.professions.slice(0, 3).map((p) => (
            <span key={p.id} className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-800">
              {p.name}
            </span>
          ))}
          {extra > 0 && <span className="rounded-full px-1.5 py-1 font-medium text-muted-strong">+{extra}</span>}
        </span>
      )}

      <span className="mt-auto flex flex-col gap-1 border-t border-line pt-3 text-xs text-muted-strong">
        {customer.localities.length > 0 && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {customer.localities.map((l) => l.name).join(" · ")}
          </span>
        )}
        <span>{customer.lastPostAt ? `Última publicación: ${lastPostLabel(customer.lastPostAt)}` : "Todavía no publicó en el foro"}</span>
      </span>
    </Link>
  );
}
