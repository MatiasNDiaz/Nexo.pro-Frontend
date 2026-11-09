"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Field } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { Spinner } from "@/components/ui/spinner";
import type { Locality, Profession } from "@/features/catalog/types";
import { forumHref, type ForumFilters } from "@/features/forum/filters";

/**
 * Oficio, localidad y estado del foro; el tipo va en pestañas (enlaces). Se aplican al cambiar, sin
 * mover la pantalla.
 */
export function ForumFiltersBar({
  filters,
  professions,
  localities,
}: {
  filters: ForumFilters;
  professions: Profession[];
  localities: Locality[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (next: Partial<ForumFilters>) =>
    startTransition(() => router.push(forumHref({ ...filters, ...next, page: 1 }) as Route, { scroll: false }));

  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-busy={pending || undefined}>
      <Field id="foro-oficio" label="Oficio">
        {(a11y) => (
          <Listbox
            {...a11y}
            value={filters.professionSlug ?? ""}
            onChange={(value) => go({ professionSlug: value || null })}
            options={[{ value: "", label: "Todos los oficios" }, ...professions.map((p) => ({ value: p.slug, label: p.name }))]}
          />
        )}
      </Field>
      <Field id="foro-localidad" label="Localidad">
        {(a11y) => (
          <Listbox
            {...a11y}
            value={filters.localityId ?? ""}
            onChange={(value) => go({ localityId: value || null })}
            options={[{ value: "", label: "Todas las localidades" }, ...localities.map((l) => ({ value: l.id, label: l.name }))]}
          />
        )}
      </Field>
      <div className="flex items-end gap-3">
        <Field id="foro-estado" label="Estado" className="flex-1">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={filters.resolved === null ? "" : filters.resolved ? "resueltas" : "abiertas"}
              onChange={(value) => go({ resolved: value === "" ? null : value === "resueltas" })}
              options={[
                { value: "", label: "Todas" },
                { value: "abiertas", label: "Abiertas" },
                { value: "resueltas", label: "Resueltas" },
              ]}
            />
          )}
        </Field>
        {pending && <Spinner className="mb-3 size-5 text-brand-600" />}
      </div>
    </div>
  );
}
