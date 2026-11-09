"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { Spinner } from "@/components/ui/spinner";
import { useNeighborhoodSuggestions } from "@/features/catalogs/queries";
import { catalogHref, type CatalogFilters } from "@/features/catalog/filters";
import type { Locality, Profession } from "@/features/catalog/types";
import { cn } from "@/lib/cn";

interface Values {
  professionSlug: string;
  localityId: string;
  neighborhoodId: string;
  neighborhoodName: string;
  availableNow: boolean;
}

const toValues = (filters: CatalogFilters, neighborhoodName: string | null): Values => ({
  professionSlug: filters.professionSlug ?? "",
  localityId: filters.localityId ?? "",
  neighborhoodId: filters.neighborhoodId ?? "",
  neighborhoodName: neighborhoodName ?? "",
  availableNow: filters.availableNow,
});

const cleared = (values: Values): Values => ({ ...values, professionSlug: "", localityId: "", neighborhoodId: "", neighborhoodName: "", availableNow: false });

const toHref = (values: Values) =>
  catalogHref({
    professionSlug: values.professionSlug || null,
    localityId: values.localityId || null,
    neighborhoodId: values.neighborhoodId || null,
    availableNow: values.availableNow,
    page: 1, // Cambiar un filtro vuelve a la primera página.
  }) as Route;

const countActive = (values: Values) =>
  [values.professionSlug, values.localityId, values.neighborhoodId, values.availableNow].filter(Boolean).length;

/**
 * Filtros del catálogo, siempre a la izquierda:
 * - Escritorio: una columna fija junto a los resultados; cada toque aplica el filtro al instante.
 * - Celular y tablet: una barra "Filtros" pegada arriba abre el mismo panel desde la izquierda; ahí se
 *   eligen y se aplican con "Ver resultados".
 * El oficio se elige con un toque (botones), la localidad con una lista y el barrio escribiendo.
 */
export function CatalogFiltersBar({
  filters,
  neighborhoodName,
  professions,
  localities,
}: {
  filters: CatalogFilters;
  neighborhoodName: string | null;
  professions: Profession[];
  localities: Locality[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const current = toValues(filters, neighborhoodName);
  const [draft, setDraft] = useState(current);

  const navigate = (values: Values) => startTransition(() => router.push(toHref(values), { scroll: false }));
  const active = countActive(current);

  return (
    // En celular el envoltorio "desaparece" (contents) para que la barra quede pegada mientras se
    // recorren los resultados; en escritorio es la columna izquierda entera.
    <div className="contents lg:block">
      {/* Escritorio: columna izquierda */}
      <aside aria-label="Filtros" className="sticky top-20 hidden self-start lg:block">
        <div className="flex flex-col rounded-2xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <SlidersHorizontal className="size-4 text-brand-600" aria-hidden="true" />
              Filtros
              {pending && <Spinner className="size-4 text-brand-600" />}
            </h2>
            {active > 0 && (
              <button
                type="button"
                onClick={() => navigate(cleared(current))}
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Limpiar
              </button>
            )}
          </div>
          <FilterFields values={current} professions={professions} localities={localities} onChange={navigate} idPrefix="d" />
        </div>
      </aside>

      {/* Celular y tablet: barra pegada arriba que abre el panel */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setDraft(current);
            setSheetOpen(true);
          }}
          className="flex h-12 w-full items-center gap-3 rounded-xl border border-line-strong bg-surface px-4 text-left shadow-xs transition-colors hover:border-brand-400"
        >
          <SlidersHorizontal className="size-5 text-brand-600" aria-hidden="true" />
          <span className="flex-1 font-semibold text-ink">Filtros</span>
          {active > 0 ? (
            <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-semibold text-white">
              {active} {active === 1 ? "activo" : "activos"}
            </span>
          ) : (
            <span className="text-sm text-muted">Oficio, zona, disponibles</span>
          )}
          {pending && <Spinner className="size-4 text-brand-600" />}
        </button>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtros" side="left">
        <div className="flex min-h-full flex-col">
          <FilterFields values={draft} professions={professions} localities={localities} onChange={setDraft} idPrefix="m" />
          <div className="sticky bottom-0 mt-auto flex flex-col gap-2 border-t border-line bg-surface p-5">
            <Button
              fullWidth
              onClick={() => {
                setSheetOpen(false);
                navigate(draft);
              }}
            >
              Ver resultados
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setDraft(cleared(draft))}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function FilterFields({
  values,
  professions,
  localities,
  onChange,
  idPrefix,
}: {
  values: Values;
  professions: Profession[];
  localities: Locality[];
  onChange: (values: Values) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-col divide-y divide-line">
      <div className="px-5 py-4">
        <AvailableToggle checked={values.availableNow} onChange={(availableNow) => onChange({ ...values, availableNow })} />
      </div>

      <div role="group" aria-labelledby={`${idPrefix}-oficio`} className="px-5 py-4">
        <p id={`${idPrefix}-oficio`} className="mb-3 text-sm font-semibold text-ink">
          Oficio
        </p>
        <div className="flex flex-wrap gap-2">
          {[{ slug: "", name: "Todos" }, ...professions].map((profession) => {
            const selected = values.professionSlug === profession.slug;
            return (
              <button
                key={profession.slug || "todos"}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ ...values, professionSlug: profession.slug })}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color] duration-150",
                  selected
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-line bg-surface text-ink hover:border-brand-300 hover:bg-brand-50",
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                {profession.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        <Field id={`${idPrefix}-localidad`} label="Localidad">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={values.localityId}
              // Al cambiar de localidad, el barrio elegido deja de valer.
              onChange={(localityId) => onChange({ ...values, localityId, neighborhoodId: "", neighborhoodName: "" })}
              options={[{ value: "", label: "Todas las localidades" }, ...localities.map((l) => ({ value: l.id, label: l.name }))]}
            />
          )}
        </Field>
        {/* La key reinicia el texto del campo cuando cambia la localidad o se limpia el barrio. */}
        <NeighborhoodFilter key={`${values.localityId}:${values.neighborhoodId}`} idPrefix={idPrefix} values={values} onChange={onChange} />
      </div>
    </div>
  );
}

/**
 * Barrio: se escribe y se elige entre los barrios APROBADOS de la localidad (el backend rechaza un
 * barrio pendiente con INVALID_NEIGHBORHOOD). Solo filtra cuando se elige uno de la lista.
 */
function NeighborhoodFilter({ idPrefix, values, onChange }: { idPrefix: string; values: Values; onChange: (values: Values) => void }) {
  const [text, setText] = useState(values.neighborhoodName);
  const listId = useId();
  const suggestions = useNeighborhoodSuggestions(values.localityId || null, text);

  if (values.neighborhoodId) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Barrio</span>
        <span className="flex h-11 items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 pr-1 pl-3.5 text-brand-900">
          <span className="truncate">{values.neighborhoodName || "Barrio elegido"}</span>
          <button
            type="button"
            onClick={() => {
              setText("");
              onChange({ ...values, neighborhoodId: "", neighborhoodName: "" });
            }}
            className="grid size-9 place-items-center rounded-lg text-brand-700 hover:bg-brand-100"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Quitar el filtro de barrio</span>
          </button>
        </span>
      </div>
    );
  }

  return (
    <Field id={`${idPrefix}-barrio`} label="Barrio" hint={values.localityId ? undefined : "Elegí primero la localidad."}>
      {(a11y) => (
        <>
          <Input
            {...a11y}
            list={listId}
            value={text}
            disabled={!values.localityId}
            placeholder={values.localityId ? "Escribí tu barrio" : undefined}
            autoComplete="off"
            onChange={(event) => {
              const typed = event.target.value;
              setText(typed);
              const match = suggestions.data?.find((n) => n.name.toLowerCase() === typed.trim().toLowerCase());
              if (match) onChange({ ...values, neighborhoodId: match.id, neighborhoodName: match.name });
            }}
          />
          <datalist id={listId}>
            {suggestions.data?.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.name} />
            ))}
          </datalist>
        </>
      )}
    </Field>
  );
}

/** Interruptor accesible (checkbox con rol de switch). */
function AvailableToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const hintId = useId();
  return (
    <label className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink transition-colors hover:border-brand-200 has-checked:border-success-600/40 has-checked:bg-success-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-electric-500">
      <span className="flex flex-col py-2">
        Disponible ahora
        <span id={hintId} className="text-xs font-normal text-muted-strong">
          Solo quienes atienden en este momento
        </span>
      </span>
      <input type="checkbox" role="switch" aria-label="Disponible ahora" aria-describedby={hintId} checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-4"
      />
    </label>
  );
}
