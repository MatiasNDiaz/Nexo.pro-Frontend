"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, BarChart3, Eye, FileText, Lock, Minus, Search, Star, Trophy, Wrench, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { isApiError, errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatRating } from "@/lib/format";
import { getMetrics, workKeys, type Metrics } from "./api";

type GroupBy = "day" | "week" | "month";
type MetricKey = "profileViewers" | "searchAppearances" | "requests";

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Períodos (hora de Córdoba aproximada por la del navegador; el backend acota y valida). */
const ranges: { id: string; label: string; build: () => { from: string; to: string; groupBy: GroupBy } }[] = [
  { id: "month", label: "Este mes", build: () => { const now = new Date(); return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now), groupBy: "day" }; } },
  { id: "30", label: "Últimos 30 días", build: () => { const now = new Date(); return { from: iso(new Date(now.getTime() - 29 * 864e5)), to: iso(now), groupBy: "day" }; } },
  { id: "90", label: "Últimos 3 meses", build: () => { const now = new Date(); return { from: iso(new Date(now.getTime() - 89 * 864e5)), to: iso(now), groupBy: "week" }; } },
  { id: "year", label: "Este año", build: () => { const now = new Date(); return { from: iso(new Date(now.getFullYear(), 0, 1)), to: iso(now), groupBy: "month" }; } },
];

const chartMetrics: { key: MetricKey; label: string }[] = [
  { key: "profileViewers", label: "Visitas al perfil" },
  { key: "searchAppearances", label: "Apariciones en búsquedas" },
  { key: "requests", label: "Pedidos recibidos" },
];

/**
 * Métricas del plan Premium (E-100): números del período con la diferencia contra el anterior y un
 * gráfico de barras de una métrica a la vez (una serie: sin leyenda, el título la nombra; tooltip
 * por barra y vista en tabla). Sin el plan, el backend responde PLAN_FEATURE_REQUIRED.
 */
export function MetricsPage() {
  const [rangeId, setRangeId] = useState("month");
  const [metric, setMetric] = useState<MetricKey>("profileViewers");
  const range = ranges.find((r) => r.id === rangeId)!.build();
  const data = useQuery({
    queryKey: workKeys.metrics(range.from, range.to, range.groupBy),
    queryFn: () => getMetrics(range.from, range.to, range.groupBy),
    retry: (count, error) => !isApiError(error, "PLAN_FEATURE_REQUIRED") && count < 2,
  });

  if (data.isError && isApiError(data.error, "PLAN_FEATURE_REQUIRED")) {
    return (
      <div className="flex flex-col gap-8">
        <PanelTitle title="Métricas" description="Cuánta gente te ve y te elige." />
        <section className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white sm:p-10">
          <span aria-hidden="true" className="absolute -top-24 -right-16 -z-1 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.35),transparent)]" />
          <Lock className="size-8 text-amber-400" aria-hidden="true" />
          <h2 className="font-display text-3xl font-bold">Tus estadísticas, con Premium</h2>
          <p className="max-w-[52ch] text-brand-100">Mirá cuántas personas abren tu perfil, cuántas veces aparecés en las búsquedas y cuántas te piden presupuesto, mes a mes.</p>
          <ButtonLink href="/panel/plan" variant="accent">
            Ver planes
          </ButtonLink>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Métricas" description="Cuánta gente te ve y te elige. Se cuentan personas distintas por día." />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
        {ranges.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={rangeId === r.id}
            onClick={() => setRangeId(r.id)}
            className={cn("h-10 rounded-xl px-4 text-sm font-semibold transition-colors", rangeId === r.id ? "bg-brand-700 text-white" : "text-brand-800 hover:bg-brand-50")}
          >
            {r.label}
          </button>
        ))}
      </div>

      {data.isPending ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      ) : data.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus métricas">
          {errorMessage(data.error)}
        </Alert>
      ) : (
        <>
          <Kpis metrics={data.data} />
          <BarChart metrics={data.data} metric={metric} onMetric={setMetric} groupBy={range.groupBy} />
        </>
      )}
    </div>
  );
}

function Kpis({ metrics }: { metrics: Metrics }) {
  const { total, previous, overallRating } = metrics;
  const tiles: { icon: LucideIcon; label: string; value: string; current: number; before: number }[] = [
    { icon: Eye, label: "Visitas al perfil", value: String(total.profileViewers), current: total.profileViewers, before: previous.profileViewers },
    { icon: Search, label: "Apariciones en búsquedas", value: String(total.searchAppearances), current: total.searchAppearances, before: previous.searchAppearances },
    { icon: Trophy, label: "Veces primero en la lista", value: String(total.firstPlace), current: total.firstPlace, before: previous.firstPlace },
    { icon: FileText, label: "Pedidos recibidos", value: String(total.requests), current: total.requests, before: previous.requests },
    { icon: Wrench, label: "Trabajos terminados", value: String(total.completed), current: total.completed, before: previous.completed },
  ];
  return (
    <dl className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
      {tiles.map((tile, index) => (
        <div key={tile.label} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 animate-fade-up sm:p-5" style={{ animationDelay: `${index * 60}ms` }}>
          <dt className="flex items-center gap-2 text-sm font-medium text-muted-strong">
            <tile.icon className="size-4 text-brand-600" aria-hidden="true" />
            {tile.label}
          </dt>
          <dd className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold text-ink tabular-nums">{tile.value}</span>
            <Delta current={tile.current} before={tile.before} />
          </dd>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-4 animate-fade-up sm:p-5" style={{ animationDelay: "300ms" }}>
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-strong">
          <Star className="size-4 text-brand-600" aria-hidden="true" />
          Calificación general
        </dt>
        <dd className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-ink">{overallRating.average !== null ? formatRating(overallRating.average) : "—"}</span>
          <span className="text-sm text-muted">{overallRating.count} {overallRating.count === 1 ? "reseña" : "reseñas"}</span>
        </dd>
      </div>
    </dl>
  );
}

/** Diferencia contra el período anterior: el ícono y el texto llevan el sentido (no solo el color). */
function Delta({ current, before }: { current: number; before: number }) {
  if (before === 0 && current === 0) return null;
  if (before === 0) return <span className="text-sm font-semibold text-success-800">nuevo</span>;
  const change = Math.round(((current - before) / before) * 100);
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-sm font-semibold", change > 0 ? "text-success-800" : change < 0 ? "text-danger-600" : "text-muted")}>
      <Icon className="size-4" aria-hidden="true" />
      {change > 0 ? "+" : ""}
      {change}%<span className="sr-only"> contra el período anterior</span>
    </span>
  );
}

const shortDate: Record<GroupBy, Intl.DateTimeFormatOptions> = {
  day: { day: "numeric", month: "short" },
  week: { day: "numeric", month: "short" },
  month: { month: "short" },
};

function BarChart({ metrics, metric, onMetric, groupBy }: { metrics: Metrics; metric: MetricKey; onMetric: (m: MetricKey) => void; groupBy: GroupBy }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const values = metrics.buckets.map((b) => b[metric]);
  const max = Math.max(1, ...values);
  const nice = niceMax(max);
  const label = chartMetrics.find((m) => m.key === metric)!.label;
  const format = (start: string) => new Date(`${start}T12:00:00`).toLocaleDateString("es-AR", shortDate[groupBy]);
  const maxIndex = values.indexOf(Math.max(...values));
  // Etiquetas del eje: como mucho ~8 para que no se pisen.
  const every = Math.max(1, Math.ceil(values.length / 8));

  return (
    <section aria-labelledby="grafico" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="grafico" className="flex items-center gap-2 text-lg font-semibold text-brand-900">
          <BarChart3 className="size-5 text-brand-600" aria-hidden="true" />
          {label}
        </h2>
        <div className="flex flex-wrap gap-1 rounded-xl bg-canvas p-1" role="group" aria-label="Qué mostrar">
          {chartMetrics.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={metric === m.key}
              onClick={() => onMetric(m.key)}
              className={cn("h-9 rounded-lg px-3 text-sm font-medium transition-colors", metric === m.key ? "bg-surface text-brand-900 shadow-xs" : "text-muted-strong hover:text-ink")}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {table ? (
        <table className="w-full text-sm">
          <caption className="sr-only">{label} por período</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted-strong">
              <th scope="col" className="py-2 font-medium">Período</th>
              <th scope="col" className="py-2 text-right font-medium">{label}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.buckets.map((bucket) => (
              <tr key={bucket.start} className="border-b border-line/60">
                <td className="py-1.5 text-ink">{format(bucket.start)}</td>
                <td className="py-1.5 text-right font-semibold text-ink tabular-nums">{bucket[metric]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative" aria-hidden="true">
          {/* Grilla discreta: base y dos referencias. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
            {[nice, nice / 2, 0].map((tick) => (
              <div key={tick} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-xs text-muted tabular-nums">{Math.round(tick)}</span>
                <span className={cn("h-px flex-1", tick === 0 ? "bg-line-strong" : "bg-line")} />
              </div>
            ))}
          </div>
          <div className="ml-10 flex h-64 items-end gap-[2px] pb-7">
            {values.map((value, index) => {
              const height = (value / nice) * 100;
              return (
                <div
                  key={metrics.buckets[index]!.start}
                  className="group relative flex h-full flex-1 items-end"
                  onPointerEnter={() => setHover(index)}
                  onPointerLeave={() => setHover(null)}
                >
                  <div
                    className={cn("w-full rounded-t-[4px] transition-[height,background-color] duration-500 ease-out-soft", hover === index ? "bg-electric-500" : "bg-brand-600")}
                    style={{ height: `${Math.max(height, value > 0 ? 1.5 : 0)}%` }}
                  />
                  {/* Etiqueta directa solo en el máximo. */}
                  {index === maxIndex && value > 0 && hover === null && (
                    <span className="absolute -translate-x-1/2 text-xs font-semibold text-ink tabular-nums" style={{ bottom: `calc(${height}% + 4px)`, left: "50%" }}>
                      {value}
                    </span>
                  )}
                  {index % every === 0 && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[0.6875rem] whitespace-nowrap text-muted">{format(metrics.buckets[index]!.start)}</span>
                  )}
                  {hover === index && (
                    <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-brand-950 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-raised">
                      <span className="block text-brand-200">{format(metrics.buckets[index]!.start)}</span>
                      <span className="font-semibold">
                        {value} {label.toLowerCase()}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <button type="button" onClick={() => setTable((t) => !t)} className="self-start text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
        {table ? "Ver como gráfico" : "Ver como tabla"}
      </button>
    </section>
  );
}

/** Tope "redondo" para el eje (1, 2, 5 × 10ⁿ). */
function niceMax(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) if (step * power >= value) return step * power;
  return 10 * power;
}
