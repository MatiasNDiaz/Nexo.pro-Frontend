"use client";

import { SlidersHorizontal, X } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/form-controls";
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

const toHref = (values: Values) =>
  catalogHref({
    professionSlug: values.professionSlug || null,
    localityId: values.localityId || null,
    neighborhoodId: values.neighborhoodId || null,
    availableNow: values.availableNow,
    page: 1, // Cambiar un filtro vuelve a la primera página.
  }) as Route;

/**
 * Filtros del catálogo. En escritorio se aplican al cambiar; en celular se eligen en un panel y se
 * aplican con "Ver resultados". "Disponible ahora" está siempre a mano.
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
  const activeCount = [current.professionSlug, current.localityId].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Escritorio: barra completa */}
      <div className="hidden items-end gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card lg:flex">
        <FilterFields values={current} professions={professions} localities={localities} onChange={navigate} idPrefix="d" />
        <AvailableToggle checked={current.availableNow} onChange={(availableNow) => navigate({ ...current, availableNow })} />
        {pending && <Spinner className="mb-3 size-5 text-brand-600" />}
      </div>

      {/* Celular y tablet: botón de filtros + disponible ahora */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="secondary"
          onClick={() => {
            setDraft(current);
            setSheetOpen(true);
          }}
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-brand-700 text-xs text-white">{activeCount}</span>
          )}
        </Button>
        <AvailableToggle checked={current.availableNow} onChange={(availableNow) => navigate({ ...current, availableNow })} />
        {pending && <Spinner className="size-5 text-brand-600" />}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filtros">
        <div className="flex flex-col gap-5 p-5">
          <FilterFields values={draft} professions={professions} localities={localities} onChange={setDraft} idPrefix="m" stacked />
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <Button
              fullWidth
              onClick={() => {
                setSheetOpen(false);
                navigate(draft);
              }}
            >
              Ver resultados
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setDraft({ ...draft, professionSlug: "", localityId: "", neighborhoodId: "", neighborhoodName: "" })}
            >
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
  stacked = false,
}: {
  values: Values;
  professions: Profession[];
  localities: Locality[];
  onChange: (values: Values) => void;
  idPrefix: string;
  stacked?: boolean;
}) {
  return (
    <div className={cn("grid flex-1 gap-4", stacked ? "grid-cols-1" : "grid-cols-3")}>
      <Field id={`${idPrefix}-oficio`} label="Oficio">
        {(a11y) => (
          <Select {...a11y} value={values.professionSlug} onChange={(e) => onChange({ ...values, professionSlug: e.target.value })}>
            <option value="">Todos los oficios</option>
            {professions.map((profession) => (
              <option key={profession.id} value={profession.slug}>
                {profession.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id={`${idPrefix}-localidad`} label="Localidad">
        {(a11y) => (
          <Select
            {...a11y}
            value={values.localityId}
            // Al cambiar de localidad, el barrio elegido deja de valer.
            onChange={(e) => onChange({ ...values, localityId: e.target.value, neighborhoodId: "", neighborhoodName: "" })}
          >
            <option value="">Todas las localidades</option>
            {localities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {/* La key reinicia el texto del campo cuando cambia la localidad o se limpia el barrio. */}
      <NeighborhoodFilter
        key={`${values.localityId}:${values.neighborhoodId}`}
        idPrefix={idPrefix}
        values={values}
        onChange={onChange}
      />
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
  return (
    <label className="flex h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink shadow-xs transition-colors hover:border-brand-200 has-[:checked]:border-success-600/40 has-[:checked]:bg-success-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-electric-500">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-4"
      />
      Disponible ahora
    </label>
  );
}
