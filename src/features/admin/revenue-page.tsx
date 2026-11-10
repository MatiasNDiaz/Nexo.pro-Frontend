"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, BarChart3, CreditCard, Download, Minus, Receipt, Undo2, UserPlus, Wallet } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { plans } from "@/content/home";
import { PanelTitle } from "@/features/account/settings-section";
import { useLocalities, useProvinces } from "@/features/catalogs/queries";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, plural } from "@/lib/format";
import { FilterTabs, PageControls } from "./admin-ui";
import { paymentLabel, roleLabel } from "./api";
import {
  businessKeys,
  exportRevenue,
  getRevenueSummary,
  listAdminPayments,
  listRegistrations,
  listRevenuePayments,
  PAGE_SIZE,
  paymentKindLabel,
  saveFile,
  type PaymentKind,
  type PaymentStatus,
  type RevenueFilters,
  type RevenueGroupBy,
  type RevenueSummary,
} from "./business-api";

type View = "resumen" | "pagos" | "registros" | "mercadopago";
const VIEWS: { value: View; label: string }[] = [
  { value: "resumen", label: "Resumen" },
  { value: "pagos", label: "Pagos" },
  { value: "registros", label: "Registros" },
  { value: "mercadopago", label: "Mercado Pago" },
];
const GROUPS: { value: RevenueGroupBy; label: string }[] = [
  { value: "day", label: "Por día" },
  { value: "week", label: "Por semana" },
  { value: "month", label: "Por mes" },
  { value: "year", label: "Por año" },
];
const PAYMENT_STATUSES = Object.keys(paymentLabel) as PaymentStatus[];
const KINDS = Object.keys(paymentKindLabel) as PaymentKind[];

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Cordoba" });
const planName = (code: string | null) => (code ? (plans.find((p) => p.code === code)?.name ?? code) : "—");

/**
 * Ingresos (ADR 0030 del backend, E-016 y E-030 a E-033): resumen con el neto y la comparación con el
 * período anterior, pagos, registros y los pagos de Mercado Pago (con los que hay que revisar). Las
 * fechas son de Córdoba. Exportar a CSV queda en la auditoría.
 */
export function RevenuePage() {
  const id = useId();
  const initial = useSearchParams().get("vista");
  const [view, setView] = useState<View>(VIEWS.some((v) => v.value === initial) ? (initial as View) : "resumen");
  const [from, setFrom] = useState(`${today().slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today());
  const [localityId, setLocalityId] = useState("");
  const provinces = useProvinces();
  const localities = useLocalities(provinces.data?.[0]?.id ?? null);
  const filters: RevenueFilters = { from, to, ...(localityId ? { localityId } : {}) };
  const rangeError = from > to ? "La fecha «desde» tiene que ser anterior a «hasta»." : null;

  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Ingresos" description="Lo cobrado por los planes, las devoluciones y los registros. Fechas en hora de Córdoba." />
      <FilterTabs label="Vista" value={view} onChange={setView} options={VIEWS} />
      {view !== "mercadopago" && (
        <section aria-label="Filtros" className="grid gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:grid-cols-3 sm:p-5">
          <Field id={`${id}-desde`} label="Desde">
            {(a11y) => <Input {...a11y} type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />}
          </Field>
          <Field id={`${id}-hasta`} label="Hasta">
            {(a11y) => <Input {...a11y} type="date" value={to} min={from} max={today()} onChange={(e) => e.target.value && setTo(e.target.value)} />}
          </Field>
          <Field id={`${id}-localidad`} label="Localidad" hint="Donde trabaja el profesional o vive el cliente">
            {(a11y) => (
              <Listbox
                {...a11y}
                value={localityId}
                onChange={setLocalityId}
                options={[{ value: "", label: "Todas" }, ...(localities.data?.map((l) => ({ value: l.id, label: l.name })) ?? [])]}
              />
            )}
          </Field>
        </section>
      )}
      {rangeError ? (
        <Alert tone="warning">{rangeError}</Alert>
      ) : view === "resumen" ? (
        <SummaryView filters={filters} />
      ) : view === "pagos" ? (
        <PaymentsView filters={filters} />
      ) : view === "registros" ? (
        <RegistrationsView filters={filters} />
      ) : (
        <MercadoPagoView />
      )}
    </div>
  );
}

/** Exportar a CSV (máximo 10 por hora; queda en la auditoría). */
function ExportButton({ input }: { input: Parameters<typeof exportRevenue>[0] }) {
  const download = useMutation({
    mutationFn: () => exportRevenue(input),
    onSuccess: ({ blob, filename }) => saveFile(blob, filename ?? `ingresos-${input.report.toLowerCase()}.csv`),
  });
  return (
    <span className="flex flex-col items-end gap-1">
      <Button size="sm" variant="secondary" onClick={() => download.mutate()} loading={download.isPending}>
        <Download className="size-4" aria-hidden="true" />
        Exportar CSV
      </Button>
      {download.isError && (
        <span role="alert" className="text-sm font-medium text-danger-600">
          {isApiError(download.error, "TOO_MANY_REQUESTS") ? "Llegaste al límite de 10 exportaciones por hora." : errorMessage(download.error)}
        </span>
      )}
    </span>
  );
}

function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h2 className="text-lg font-semibold text-brand-900">{title}</h2>
      {children}
    </div>
  );
}

// ---- Resumen ----

function SummaryView({ filters }: { filters: RevenueFilters }) {
  const [groupBy, setGroupBy] = useState<RevenueGroupBy>("month");
  const summary = useQuery({
    queryKey: businessKeys.summary(filters, groupBy),
    queryFn: () => getRevenueSummary(filters, groupBy),
    placeholderData: keepPreviousData,
    retry: (count, error) => !isApiError(error) && count < 2,
  });
  return (
    <section aria-label="Resumen" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FilterTabs label="Agrupar" value={groupBy} onChange={setGroupBy} options={GROUPS} />
        <ExportButton input={{ report: "SUMMARY", groupBy, ...filters }} />
      </div>
      {summary.isPending ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : summary.isError ? (
        <Alert tone="danger">{errorMessage(summary.error)}</Alert>
      ) : (
        <div className={cn("flex flex-col gap-5 transition-opacity", summary.isPlaceholderData && "opacity-60")}>
          <SummaryTiles summary={summary.data} />
          {summary.data.localityMayOverlap && <Alert tone="info">Con filtro de localidad, un profesional que trabaja en varias suma en cada una.</Alert>}
          <NetChart summary={summary.data} />
          <ByPlan summary={summary.data} />
        </div>
      )}
    </section>
  );
}

function SummaryTiles({ summary }: { summary: RevenueSummary }) {
  const { total, change } = summary;
  const returned = Number(total.refunds) + Number(total.chargebacks);
  const percent = change.netPercent;
  const tiles = [
    {
      icon: Wallet,
      label: "Neto",
      value: formatMoney(total.net),
      detail:
        percent === null ? (
          "Sin ingresos en el período anterior"
        ) : (
          <span className={cn("inline-flex items-center gap-1 font-semibold", percent > 0 ? "text-success-700" : percent < 0 ? "text-danger-600" : "text-muted-strong")}>
            {percent > 0 ? <ArrowUpRight className="size-4" aria-hidden="true" /> : percent < 0 ? <ArrowDownRight className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
            {percent > 0 ? "+" : ""}
            {percent.toLocaleString("es-AR", { maximumFractionDigits: 1 })} % contra el período anterior
          </span>
        ),
    },
    { icon: Receipt, label: "Cobrado", value: formatMoney(total.gross), detail: plural(total.payments, "cobro") },
    { icon: Undo2, label: "Devoluciones", value: formatMoney(returned), detail: `${plural(total.returns, "reembolso")} o contracargos` },
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <dt className="flex items-center gap-2 text-sm font-medium text-muted-strong">
            <tile.icon className="size-4 text-brand-600" aria-hidden="true" />
            {tile.label}
          </dt>
          <dd className="flex flex-col gap-0.5">
            <span className="font-display text-3xl font-bold text-ink tabular-nums">{tile.value}</span>
            <span className="text-sm text-muted-strong">{tile.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

const bucketFormat: Record<RevenueGroupBy, Intl.DateTimeFormatOptions> = {
  day: { day: "numeric", month: "short" },
  week: { day: "numeric", month: "short" },
  month: { month: "short", year: "2-digit" },
  year: { year: "numeric" },
};

/** Neto por período: una sola serie (sin leyenda: el título la nombra), tooltip por barra y tabla. */
function NetChart({ summary }: { summary: RevenueSummary }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const values = summary.buckets.map((b) => Number(b.net));
  const max = Math.max(1, ...values);
  const nice = niceMax(max);
  const negative = values.some((v) => v < 0);
  const format = (start: string) => new Date(`${start.slice(0, 10)}T12:00:00`).toLocaleDateString("es-AR", bucketFormat[summary.groupBy]);
  const maxIndex = values.indexOf(Math.max(...values));
  const every = Math.max(1, Math.ceil(values.length / 8));
  const money = (value: number) => formatMoney(value) ?? "$ 0";
  const tick = (value: number) => (value >= 1000 ? `${Math.round(value / 1000).toLocaleString("es-AR")} mil` : String(Math.round(value)));

  return (
    <section aria-labelledby="neto-grafico" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <h3 id="neto-grafico" className="flex items-center gap-2 text-lg font-semibold text-brand-900">
        <BarChart3 className="size-5 text-brand-600" aria-hidden="true" />
        Neto por período
      </h3>
      {summary.buckets.length === 0 || values.every((value) => value === 0) ? (
        <p className="text-sm text-muted-strong">No hay cobros ni devoluciones en estas fechas.</p>
      ) : table ? (
        <table className="w-full text-sm">
          <caption className="sr-only">Neto, cobrado y devoluciones por período</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted-strong">
              <th scope="col" className="py-2 font-medium">Período</th>
              <th scope="col" className="py-2 text-right font-medium">Cobrado</th>
              <th scope="col" className="py-2 text-right font-medium">Devoluciones</th>
              <th scope="col" className="py-2 text-right font-medium">Neto</th>
            </tr>
          </thead>
          <tbody>
            {summary.buckets.map((bucket) => (
              <tr key={bucket.start} className="border-b border-line/60">
                <td className="py-1.5 text-ink">{format(bucket.start)}</td>
                <td className="py-1.5 text-right text-ink tabular-nums">{formatMoney(bucket.gross)}</td>
                <td className="py-1.5 text-right text-ink tabular-nums">{money(Number(bucket.refunds) + Number(bucket.chargebacks))}</td>
                <td className="py-1.5 text-right font-semibold text-ink tabular-nums">{formatMoney(bucket.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative" aria-hidden="true">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
            {[nice, nice / 2, 0].map((value) => (
              <div key={value} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-right text-xs text-muted tabular-nums">{tick(value)}</span>
                <span className={cn("h-px flex-1", value === 0 ? "bg-line-strong" : "bg-line")} />
              </div>
            ))}
          </div>
          <div className="ml-16 flex h-64 items-end gap-[2px] pb-7">
            {values.map((value, index) => {
              const height = (Math.max(value, 0) / nice) * 100;
              const bucket = summary.buckets[index]!;
              return (
                <div key={bucket.start} className="relative flex h-full flex-1 items-end" onPointerEnter={() => setHover(index)} onPointerLeave={() => setHover(null)}>
                  <div
                    className={cn("w-full rounded-t-[4px] transition-[height,background-color] duration-500 ease-out-soft", hover === index ? "bg-electric-500" : "bg-brand-600")}
                    style={{ height: `${Math.max(height, value > 0 ? 1.5 : 0)}%` }}
                  />
                  {index === maxIndex && value > 0 && hover === null && (
                    <span className="absolute -translate-x-1/2 text-xs font-semibold whitespace-nowrap text-ink tabular-nums" style={{ bottom: `calc(${height}% + 4px)`, left: "50%" }}>
                      {money(value)}
                    </span>
                  )}
                  {index % every === 0 && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[0.6875rem] whitespace-nowrap text-muted">{format(bucket.start)}</span>}
                  {hover === index && (
                    <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-brand-950 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-raised">
                      <span className="block text-brand-200">{format(bucket.start)}</span>
                      <span className="block font-semibold">Neto {money(value)}</span>
                      <span className="block text-brand-200">
                        {plural(bucket.payments, "cobro")} · {plural(bucket.returns, "devolución", "devoluciones")}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {negative && !table && <p className="text-sm text-muted-strong">Hay períodos con neto negativo (más devoluciones que cobros): se ven en la tabla.</p>}
      {values.some((value) => value !== 0) && (
        <button type="button" onClick={() => setTable((t) => !t)} className="self-start text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
          {table ? "Ver como gráfico" : "Ver como tabla"}
        </button>
      )}
    </section>
  );
}

function ByPlan({ summary }: { summary: RevenueSummary }) {
  if (summary.total.byPlan.length === 0) return null;
  return (
    <section aria-labelledby="por-plan" className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <h3 id="por-plan" className="text-lg font-semibold text-brand-900">
        Por plan
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted-strong">
              <th scope="col" className="py-2 font-medium">Plan</th>
              <th scope="col" className="py-2 text-right font-medium">Cobros</th>
              <th scope="col" className="py-2 text-right font-medium">Cobrado</th>
              <th scope="col" className="py-2 text-right font-medium">Devoluciones</th>
              <th scope="col" className="py-2 text-right font-medium">Neto</th>
            </tr>
          </thead>
          <tbody>
            {summary.total.byPlan.map((row) => (
              <tr key={row.planCode} className="border-b border-line/60">
                <th scope="row" className="py-2 text-left font-semibold text-ink">{planName(row.planCode)}</th>
                <td className="py-2 text-right text-ink tabular-nums">{row.payments}</td>
                <td className="py-2 text-right text-ink tabular-nums">{formatMoney(row.gross)}</td>
                <td className="py-2 text-right text-ink tabular-nums">{formatMoney(Number(row.refunds) + Number(row.chargebacks))}</td>
                <td className="py-2 text-right font-semibold text-ink tabular-nums">{formatMoney(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---- Pagos ----

function PaymentsView({ filters }: { filters: RevenueFilters }) {
  const id = useId();
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [kind, setKind] = useState<PaymentKind | "">("");
  const [page, setPage] = useState(1);
  const query = { ...filters, ...(status ? { status } : {}), ...(kind ? { kind } : {}), page };
  const list = useQuery({ queryKey: businessKeys.revenuePayments(query), queryFn: () => listRevenuePayments(query), placeholderData: keepPreviousData, retry: (c, e) => !isApiError(e) && c < 2 });
  return (
    <section aria-label="Pagos" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field id={`${id}-estado`} label="Estado" hint="Sin elegir: los que movieron plata">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={status}
              onChange={(value) => {
                setStatus(value as PaymentStatus | "");
                setPage(1);
              }}
              options={[{ value: "", label: "Cobrados y devueltos" }, ...PAYMENT_STATUSES.map((value) => ({ value, label: paymentLabel[value]!.label }))]}
            />
          )}
        </Field>
        <Field id={`${id}-tipo`} label="Tipo">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={kind}
              onChange={(value) => {
                setKind(value as PaymentKind | "");
                setPage(1);
              }}
              options={[{ value: "", label: "Todos" }, ...KINDS.map((value) => ({ value, label: paymentKindLabel[value] }))]}
            />
          )}
        </Field>
        <ExportButton input={{ report: "PAYMENTS", groupBy: "month", ...filters, ...(status ? { status } : {}), ...(kind ? { kind } : {}) }} />
      </div>
      <ListState query={list} empty={<EmptyState icon={CreditCard} title="No hay pagos con estos filtros" />}>
        {(data) => (
          <>
            <p className="text-sm font-medium text-muted-strong" aria-live="polite">
              {plural(data.total, "pago")}
            </p>
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              {data.data.map((payment) => {
                const state = paymentLabel[payment.status] ?? { label: payment.status, tone: "neutral" as const };
                return (
                  <li key={payment.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Person person={payment.user} />
                      <span className="text-sm text-muted-strong">
                        {formatDate(payment.date)} · {payment.previousPlanCode ? `${planName(payment.previousPlanCode)} → ` : ""}
                        {payment.planName}
                        {payment.kind && ` · ${paymentKindLabel[payment.kind]}`}
                        {payment.moneyReturnedAt && ` · devuelto el ${formatDate(payment.moneyReturnedAt)}`}
                      </span>
                    </span>
                    <span className="font-display text-lg font-bold text-ink tabular-nums">{formatMoney(payment.amount)}</span>
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </li>
                );
              })}
            </ul>
            <PageControls page={data.page} total={data.total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </ListState>
    </section>
  );
}

// ---- Registros ----

function RegistrationsView({ filters }: { filters: RevenueFilters }) {
  const [role, setRole] = useState<"" | "CUSTOMER" | "PROFESSIONAL">("");
  const [hasPaid, setHasPaid] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const query = { ...filters, ...(role ? { role } : {}), ...(hasPaid ? { hasPaid } : {}), page };
  const list = useQuery({ queryKey: businessKeys.registrations(query), queryFn: () => listRegistrations(query), placeholderData: keepPreviousData, retry: (c, e) => !isApiError(e) && c < 2 });
  return (
    <section aria-label="Registros" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <FilterTabs
            label="Rol"
            value={role}
            onChange={(value) => {
              setRole(value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Todos" },
              { value: "CUSTOMER", label: "Clientes" },
              { value: "PROFESSIONAL", label: "Profesionales" },
            ]}
          />
          <FilterTabs
            label="Pagó"
            value={hasPaid}
            onChange={(value) => {
              setHasPaid(value);
              setPage(1);
            }}
            options={[
              { value: "", label: "Todos" },
              { value: "true", label: "Sí" },
              { value: "false", label: "No" },
            ]}
          />
        </div>
        <ExportButton input={{ report: "REGISTRATIONS", groupBy: "month", ...filters, ...(role ? { role } : {}), ...(hasPaid ? { hasPaid: hasPaid === "true" } : {}) }} />
      </div>
      <ListState query={list} empty={<EmptyState icon={UserPlus} title="No hay registros con estos filtros" />}>
        {(data) => (
          <>
            <p className="text-sm font-medium text-muted-strong" aria-live="polite">
              {plural(data.total, "registro")}
            </p>
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              {data.data.map((item) => (
                <li key={item.user.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <Person person={item.user} />
                    <span className="text-sm text-muted-strong">
                      {roleLabel[item.user.role]} · se registró el {formatDate(item.registeredAt)}
                      {item.user.localities.length > 0 && ` · ${item.user.localities.join(", ")}`}
                    </span>
                  </span>
                  {item.currentPlanCode && <Badge>{planName(item.currentPlanCode)}</Badge>}
                  {item.hasPaid !== null && <Badge tone={item.hasPaid ? "success" : "neutral"}>{item.hasPaid ? "Pagó" : "Sin pagos"}</Badge>}
                </li>
              ))}
            </ul>
            <PageControls page={data.page} total={data.total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </ListState>
    </section>
  );
}

// ---- Mercado Pago (E-016): cada pago tal cual, con los aprobados que no se pudieron aplicar ----

function MercadoPagoView() {
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const list = useQuery({ queryKey: businessKeys.payments({ status, page }), queryFn: () => listAdminPayments(status, page), placeholderData: keepPreviousData });
  return (
    <section aria-label="Pagos de Mercado Pago" className="flex flex-col gap-4">
      <Header title="Pagos de Mercado Pago">
        <p className="max-w-md text-sm text-muted-strong">Cada intento de pago, el más nuevo primero. «Revisar» es un pago aprobado que no coincidió con lo esperado y no se aplicó: el detalle está en la auditoría.</p>
      </Header>
      <FilterTabs
        label="Estado"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[{ value: "", label: "Todos" }, ...PAYMENT_STATUSES.map((value) => ({ value, label: paymentLabel[value]!.label }))]}
      />
      <ListState query={list} empty={<EmptyState icon={CreditCard} title="No hay pagos con este estado" />}>
        {(data) => (
          <>
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              {data.data.map((payment) => {
                const state = paymentLabel[payment.status] ?? { label: payment.status, tone: "neutral" as const };
                return (
                  <li key={payment.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Link href={`/panel/admin/usuarios/${payment.userId}` as Route} className="font-semibold text-brand-700 hover:underline">
                        {planName(payment.planCode)} · {payment.purpose === "UPGRADE_DIFFERENCE" ? "diferencia por cambio de plan" : "mes"}
                      </Link>
                      <span className="text-sm text-muted-strong">
                        {formatDate(payment.createdAt)}
                        {payment.providerPaymentId && ` · Mercado Pago ${payment.providerPaymentId}`}
                        {payment.grantedUntil && ` · vigente hasta el ${formatDate(payment.grantedUntil)}`}
                      </span>
                    </span>
                    <span className="font-display text-lg font-bold text-ink tabular-nums">{formatMoney(payment.amount)}</span>
                    <Badge tone={state.tone}>{state.label}</Badge>
                    {payment.needsReview && <Badge tone="danger">Revisar</Badge>}
                    {payment.reverted && <Badge>Revertido</Badge>}
                  </li>
                );
              })}
            </ul>
            <PageControls page={data.page} total={data.total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </ListState>
    </section>
  );
}

function Person({ person }: { person: { id: string; name: string; email: string | null; deleted: boolean } }) {
  return person.deleted ? (
    <span className="font-semibold text-ink">{person.name}</span>
  ) : (
    <span className="truncate">
      <Link href={`/panel/admin/usuarios/${person.id}` as Route} className="font-semibold text-brand-700 hover:underline">
        {person.name}
      </Link>
      {person.email && <span className="text-sm text-muted-strong"> · {person.email}</span>}
    </span>
  );
}

function ListState<D extends { data: unknown[]; total: number; page: number }>({
  query,
  empty,
  children,
}: {
  query: { isPending: boolean; isError: boolean; error: unknown; isPlaceholderData: boolean; data?: D };
  empty: ReactNode;
  children: (data: D) => ReactNode;
}) {
  if (query.isPending) return <Skeleton className="h-64 rounded-3xl" />;
  if (query.isError) return <Alert tone="danger">{errorMessage(query.error)}</Alert>;
  if (!query.data || query.data.data.length === 0) return <>{empty}</>;
  return <div className={cn("flex flex-col gap-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>{children(query.data)}</div>;
}

/** Tope "redondo" para el eje (1, 2, 5 × 10ⁿ). */
function niceMax(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) if (step * power >= value) return step * power;
  return 10 * power;
}
