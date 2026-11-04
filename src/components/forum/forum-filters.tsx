"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Field, Select } from "@/components/ui/form-controls";
import { Spinner } from "@/components/ui/spinner";
import type { Locality, Profession } from "@/features/catalog/types";
import { forumHref, type ForumFilters } from "@/features/forum/filters";

/** Oficio, localidad y estado del foro; el tipo va en pestañas (enlaces). Se aplican al cambiar. */
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
          <Select {...a11y} value={filters.professionSlug ?? ""} onChange={(e) => go({ professionSlug: e.target.value || null })}>
            <option value="">Todos los oficios</option>
            {professions.map((profession) => (
              <option key={profession.id} value={profession.slug}>
                {profession.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field id="foro-localidad" label="Localidad">
        {(a11y) => (
          <Select {...a11y} value={filters.localityId ?? ""} onChange={(e) => go({ localityId: e.target.value || null })}>
            <option value="">Todas las localidades</option>
            {localities.map((locality) => (
              <option key={locality.id} value={locality.id}>
                {locality.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="flex items-end gap-3">
        <Field id="foro-estado" label="Estado" className="flex-1">
          {(a11y) => (
            <Select
              {...a11y}
              value={filters.resolved === null ? "" : filters.resolved ? "resueltas" : "abiertas"}
              onChange={(e) => go({ resolved: e.target.value === "" ? null : e.target.value === "resueltas" })}
            >
              <option value="">Todas</option>
              <option value="abiertas">Abiertas</option>
              <option value="resueltas">Resueltas</option>
            </Select>
          )}
        </Field>
        {pending && <Spinner className="mb-3 size-5 text-brand-600" />}
      </div>
    </div>
  );
}
